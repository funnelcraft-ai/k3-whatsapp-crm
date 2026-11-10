/* Meta WhatsApp Cloud API client (per tenant credentials) */
const fs = require('fs');
const crypto = require('crypto');
const { config, decrypt, HttpError } = require('../core');

const LANG_CODES = { English: 'en', Bengali: 'bn', Hindi: 'hi', 'English (US)': 'en_US', 'English (UK)': 'en_GB' };
const langCode = l => LANG_CODES[l] || l || 'en';

function creds(t) {
  const token = decrypt(t.wa_access_token_enc);
  if (!t.wa_phone_number_id || !token) throw new HttpError(400, 'WhatsApp is not connected yet. An admin can add the Cloud API credentials in Settings → WhatsApp.');
  return { phoneNumberId: t.wa_phone_number_id, wabaId: t.wa_waba_id, token, appId: t.meta_app_id || config.metaAppId };
}
const url = p => `${config.graphBase}/${config.graphVersion}/${p.replace(/^\//, '')}`;

async function graph(token, method, path, body, { form, raw } = {}) {
  const opts = { method, headers: token ? { Authorization: `Bearer ${token}` } : {} };
  if (form) opts.body = form;
  else if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(raw ? path : url(path), Object.assign(opts, { signal: AbortSignal.timeout(30000) })); }
  catch (e) { const err = new HttpError(502, 'WhatsApp API unreachable: ' + e.message); err.network = true; throw err; }
  const text = await r.text(); let j; try { j = text ? JSON.parse(text) : {}; } catch (e) { j = { raw: text }; }
  if (!r.ok || j.error) {
    const m = (j.error && (j.error.error_user_msg || j.error.message)) || `HTTP ${r.status}`;
    const err = new HttpError(r.status >= 500 ? 502 : r.status === 429 ? 429 : 400, 'WhatsApp API: ' + m);
    err.meta = j.error; err.httpStatus = r.status; err.code = j.error && j.error.code; throw err;
  }
  return j;
}

/* Transient errors worth retrying with back-off: rate limits, Meta outages, network failures */
const RETRYABLE_CODES = new Set([1, 2, 4, 17, 32, 613, 80007, 130429, 131000, 131016, 131056, 133004]);
function isRetryable(e) {
  if (!e) return false;
  if (e.network) return true;
  if (e.httpStatus === 429 || e.httpStatus >= 500) return true;
  return RETRYABLE_CODES.has(+e.code) || (e.meta && e.meta.is_transient === true);
}
/* Errors that mean the uploaded media ID is no longer usable (expired / missing) */
const isMediaError = e => !!e && ([131052, 131053].includes(+e.code) || /media|attachment|file/i.test(String((e.meta && (e.meta.message || e.meta.error_user_msg)) || '')));

const base = to => ({ messaging_product: 'whatsapp', recipient_type: 'individual', to });

async function sendText(t, to, text, contextId) {
  const c = creds(t);
  const body = Object.assign(base(to), { type: 'text', text: { preview_url: true, body: text } });
  if (contextId) body.context = { message_id: contextId };
  const j = await graph(c.token, 'POST', `${c.phoneNumberId}/messages`, body);
  return j.messages && j.messages[0] && j.messages[0].id;
}

/* header: { type:'image'|'video'|'document', id?, link?, filename? } ; params: array of strings for {{1}}..{{n}} */
async function sendTemplate(t, to, { name, language, params = [], header }) {
  const c = creds(t);
  const components = [];
  if (header && (header.id || header.link)) {
    const media = header.id ? { id: header.id } : { link: header.link };
    if (header.type === 'document' && header.filename) media.filename = header.filename;
    components.push({ type: 'header', parameters: [{ type: header.type, [header.type]: media }] });
  }
  if (params.length) components.push({ type: 'body', parameters: params.map(p => ({ type: 'text', text: String(p || '-').slice(0, 1000) })) });
  const body = Object.assign(base(to), { type: 'template', template: { name, language: { code: langCode(language) }, components } });
  const j = await graph(c.token, 'POST', `${c.phoneNumberId}/messages`, body);
  return j.messages && j.messages[0] && j.messages[0].id;
}

async function sendMedia(t, to, { type, id, caption, filename }) {
  const c = creds(t);
  const media = { id }; if (caption && type !== 'audio') media.caption = caption; if (type === 'document' && filename) media.filename = filename;
  const j = await graph(c.token, 'POST', `${c.phoneNumberId}/messages`, Object.assign(base(to), { type, [type]: media }));
  return j.messages && j.messages[0] && j.messages[0].id;
}

async function markRead(t, waMessageId) {
  try { const c = creds(t); await graph(c.token, 'POST', `${c.phoneNumberId}/messages`, { messaging_product: 'whatsapp', status: 'read', message_id: waMessageId }); } catch (e) { /* non-critical */ }
}

async function uploadMedia(t, filePath, mime, name) {
  const c = creds(t);
  const form = new FormData();
  form.append('messaging_product', 'whatsapp'); form.append('type', mime);
  form.append('file', new Blob([fs.readFileSync(filePath)], { type: mime }), name || 'file');
  const j = await graph(c.token, 'POST', `${c.phoneNumberId}/media`, undefined, { form });
  return j.id;
}

async function downloadMedia(t, mediaId) {
  const c = creds(t);
  const info = await graph(c.token, 'GET', mediaId);
  const r = await fetch(info.url, { headers: { Authorization: `Bearer ${c.token}` } });
  if (!r.ok) throw new Error('media download ' + r.status);
  return { buffer: Buffer.from(await r.arrayBuffer()), mime: info.mime_type || r.headers.get('content-type') || 'application/octet-stream' };
}

/* Templates */
async function listTemplates(t) {
  const c = creds(t); if (!c.wabaId) throw new HttpError(400, 'Add your WhatsApp Business Account (WABA) ID in Settings → WhatsApp.');
  let out = []; let next = `${c.wabaId}/message_templates?limit=100&fields=id,name,status,category,language,components,rejected_reason`;
  let raw = false;
  for (let i = 0; i < 20 && next; i++) { const j = await graph(c.token, 'GET', next, undefined, { raw }); out = out.concat(j.data || []); next = j.paging && j.paging.next; raw = true; }
  return out.map(m => {
    const comp = type => (m.components || []).find(x => x.type === type) || {};
    const h = comp('HEADER');
    return {
      meta_id: m.id, name: m.name, language: m.language, category: m.category === 'UTILITY' ? 'Utility' : m.category === 'AUTHENTICATION' ? 'Authentication' : 'Marketing',
      status: ({ APPROVED: 'Approved', PENDING: 'Pending', REJECTED: 'Rejected', PAUSED: 'Paused', DISABLED: 'Disabled', IN_APPEAL: 'Pending' })[m.status] || m.status,
      header: h.format ? String(h.format).toLowerCase().replace('text', 'none') : 'none',
      body: comp('BODY').text || '', buttons: (comp('BUTTONS').buttons || []).map(b => b.text), reject_reason: m.rejected_reason && m.rejected_reason !== 'NONE' ? m.rejected_reason : null,
    };
  });
}

/* Resumable Upload API → header_handle used as a sample when creating media-header templates */
async function resumableUpload(t, filePath, mime) {
  const c = creds(t); if (!c.appId) throw new HttpError(400, 'META_APP_ID (or the app ID in Settings → WhatsApp) is required to submit templates with media headers.');
  const size = fs.statSync(filePath).size;
  const s = await graph(c.token, 'POST', `${c.appId}/uploads?file_length=${size}&file_type=${encodeURIComponent(mime)}`);
  const r = await fetch(url(s.id), { method: 'POST', headers: { Authorization: `OAuth ${c.token}`, file_offset: '0', 'Content-Type': 'application/octet-stream' }, body: fs.readFileSync(filePath) });
  const j = await r.json(); if (!r.ok || !j.h) throw new HttpError(400, 'Template sample upload failed: ' + ((j.error && j.error.message) || r.status));
  return j.h;
}

async function createTemplate(t, tpl, sample) {
  const c = creds(t); if (!c.wabaId) throw new HttpError(400, 'Add your WABA ID in Settings → WhatsApp.');
  const components = [];
  if (tpl.header && tpl.header !== 'none') {
    if (!sample) throw new HttpError(400, `Upload a sample ${tpl.header} for the template header.`);
    const handle = await resumableUpload(t, sample.path, sample.mime);
    components.push({ type: 'HEADER', format: tpl.header.toUpperCase(), example: { header_handle: [handle] } });
  }
  const vars = (tpl.body.match(/\{\{\d+\}\}/g) || []).length;
  const bodyC = { type: 'BODY', text: tpl.body };
  if (vars) bodyC.example = { body_text: [['Priya', 'Class 5', '30 Nov', 'https://example.com'].slice(0, vars).concat(Array(Math.max(0, vars - 4)).fill('sample'))] };
  components.push(bodyC);
  if (tpl.buttons && tpl.buttons.length) components.push({ type: 'BUTTONS', buttons: tpl.buttons.slice(0, 3).map(b => ({ type: 'QUICK_REPLY', text: String(b).slice(0, 25) })) });
  const j = await graph(c.token, 'POST', `${c.wabaId}/message_templates`, { name: tpl.name, language: langCode(tpl.language), category: tpl.category === 'Utility' ? 'UTILITY' : 'MARKETING', components });
  return { meta_id: j.id, status: ({ APPROVED: 'Approved', PENDING: 'Pending', REJECTED: 'Rejected' })[j.status] || 'Pending' };
}

/* Meta Lead Ads: fetch lead details */
async function fetchLeadgen(pageToken, leadgenId) {
  const j = await graph(pageToken, 'GET', `${leadgenId}?fields=field_data,created_time,ad_name,campaign_name,form_id`);
  const fields = {}; (j.field_data || []).forEach(f => { fields[f.name] = (f.values || [])[0]; });
  return { fields, campaign: j.campaign_name || j.ad_name || '', created: j.created_time };
}

async function testConnection(t) {
  const c = creds(t);
  const j = await graph(c.token, 'GET', `${c.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier`);
  return j;
}

/* ---------- Meta Embedded Signup (one-click onboarding) ----------
   Requires K3's Meta app to be a Tech Provider: META_APP_ID, META_APP_SECRET, META_ES_CONFIG_ID */
const esConfig = () => ({ appId: process.env.META_APP_ID || config.metaAppId, appSecret: process.env.META_APP_SECRET || config.metaAppSecret, configId: process.env.META_ES_CONFIG_ID || '', solutionId: process.env.META_ES_SOLUTION_ID || '' });
const esEnabled = () => { const c = esConfig(); return !!(c.appId && c.appSecret && c.configId); };
async function embeddedSignup({ code, phoneNumberId, wabaId }) {
  const c = esConfig(); if (!esEnabled()) throw new HttpError(400, 'One-click WhatsApp signup is not enabled on this platform yet.');
  if (!code || !phoneNumberId || !wabaId) throw new HttpError(400, 'Signup was not completed — missing code, phone number or WhatsApp account.');
  // 1. exchange the code for a business integration system-user token
  const tok = await graph('', 'GET', `oauth/access_token?client_id=${encodeURIComponent(c.appId)}&client_secret=${encodeURIComponent(c.appSecret)}&code=${encodeURIComponent(code)}`);
  const token = tok.access_token; if (!token) throw new HttpError(400, 'Meta did not return an access token.');
  const warnings = [];
  // 2. subscribe our app to the customer's WABA (so their messages reach our webhook)
  await graph(token, 'POST', `${wabaId}/subscribed_apps`);
  // 3. register the number for Cloud API with a two-step verification PIN
  const pin = String(crypto.randomInt(100000, 999999));
  try { await graph(token, 'POST', `${phoneNumberId}/register`, { messaging_product: 'whatsapp', pin }); }
  catch (e) { warnings.push('Number registration: ' + e.message.replace('WhatsApp API: ', '') + ' (it may already be registered).'); }
  let info = {}; try { info = await graph(token, 'GET', `${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`); } catch (e) { /* optional */ }
  return { token, pin, info, warnings };
}

function verifySignature(rawBody, header, secret) {
  if (!secret) return false; // no App Secret configured → refuse: an unsigned webhook can be forged by anyone who knows the URL
  if (!header || !header.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(header.slice(7)), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { esConfig, esEnabled, embeddedSignup, isRetryable, isMediaError, creds, sendText, sendTemplate, sendMedia, markRead, uploadMedia, downloadMedia, listTemplates, createTemplate, fetchLeadgen, testConnection, verifySignature, langCode };
