/* Public webhooks: Meta (WhatsApp messages/statuses/templates + Lead Ads), Google Ads lead forms, website forms */
const express = require('express');
const { config, q, one, decrypt, HttpError, wrap } = require('../core');
const crypto = require('crypto');
const CRM = require('../services/crm');
const WA = require('../services/whatsapp');
const { limiter } = require('../services/ratelimit');

const safeEq = (a, b) => { const x = Buffer.from(String(a == null ? '' : a)), y = Buffer.from(String(b == null ? '' : b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
/* webhook_log is diagnostic only: bounded size so a flood can't fill the database */
const log = (tenantId, kind, payload, error) => {
  let p = payload; try { const j = JSON.stringify(payload); if (j && j.length > 8000) p = { truncated: true, preview: j.slice(0, 8000) }; } catch (e) { p = null; }
  return q(`INSERT INTO webhook_log(tenant_id, kind, payload, error) VALUES ($1,$2,$3,$4)`, [tenantId, kind, p, error ? String(error).slice(0, 500) : null]).catch(() => {});
};
const byIp = (name, max) => limiter({ windowMs: 60e3, max, key: req => name + '|' + req.ip });

/* ---------------- Meta webhook ---------------- */
const meta = express.Router();
meta.use(byIp('meta', +(process.env.WEBHOOK_RATE_LIMIT || 600)));
meta.use(express.raw({ type: '*/*', limit: '5mb' }));

meta.get(['/', '/:key'], wrap(async (req, res) => {
  const mode = req.query['hub.mode'], token = req.query['hub.verify_token'], challenge = req.query['hub.challenge'];
  let ok = false;
  if (req.params.key) { const t = await one(`SELECT wa_verify_token FROM tenants WHERE webhook_key=$1`, [req.params.key]); ok = !!t && !!t.wa_verify_token && safeEq(token, t.wa_verify_token); }
  else ok = !!config.metaVerifyToken && safeEq(token, config.metaVerifyToken);
  if (mode === 'subscribe' && ok) return res.status(200).send(challenge);
  res.status(403).send('Verification failed');
}));

meta.post(['/', '/:key'], wrap(async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  let keyed = null;
  if (req.params.key) { keyed = await one(`SELECT * FROM tenants WHERE webhook_key=$1`, [req.params.key]); if (!keyed) return res.sendStatus(404); }
  const secret = keyed && keyed.wa_app_secret_enc ? decrypt(keyed.wa_app_secret_enc) : config.metaAppSecret;
  if (!WA.verifySignature(raw, req.headers['x-hub-signature-256'], secret)) { if (keyed) log(keyed.id, 'meta:bad-signature', { configured: !!secret }); return res.sendStatus(401); }   // not logged for the shared URL: anyone can spam it
  let body; try { body = JSON.parse(raw.toString('utf8') || '{}'); } catch (e) { return res.sendStatus(400); }
  res.sendStatus(200); // acknowledge fast; process after
  processMeta(body, keyed).catch(e => { console.error('webhook processing', e); log(keyed && keyed.id, 'meta:error', body, e.message); });
}));

async function processMeta(body, keyed) {
  for (const entry of body.entry || []) {
    for (const ch of entry.changes || []) {
      const v = ch.value || {};
      if (ch.field === 'messages') {
        const pnid = v.metadata && v.metadata.phone_number_id;
        /* A school's own URL may only ever deliver to that school. (Otherwise a school with its own App Secret could sign a payload naming another school's phone number id.) */
        if (keyed && pnid && keyed.wa_phone_number_id !== pnid) { log(keyed.id, 'meta:number-mismatch', { pnid }); continue; }
        const t = keyed || await one(`SELECT * FROM tenants WHERE wa_phone_number_id=$1`, [pnid]);
        if (!t) { log(null, 'meta:unknown-number', { pnid }); continue; }
        if (t.status !== 'active') continue;
        for (const m of v.messages || []) { const contact = (v.contacts || []).find(c => c.wa_id === m.from); await CRM.handleInbound(t, m, contact); }
        for (const s of v.statuses || []) await CRM.handleStatus(t, s);
      } else if (ch.field === 'message_template_status_update') {
        const st = ({ APPROVED: 'Approved', REJECTED: 'Rejected', PENDING: 'Pending', PAUSED: 'Paused', DISABLED: 'Disabled', FLAGGED: 'Paused' })[v.event] || v.event;
        const wabaFilter = keyed ? `tenant_id=$4` : `tenant_id IN (SELECT id FROM tenants WHERE wa_waba_id=$4)`;
        await q(`UPDATE templates SET status=$1, reject_reason=$2 WHERE (meta_id=$3 OR name=$5) AND ${wabaFilter}`, [st, v.reason && v.reason !== 'NONE' ? v.reason : null, String(v.message_template_id || ''), keyed ? keyed.id : entry.id, v.message_template_name || '']);
      } else if (ch.field === 'leadgen') {
        if (keyed && keyed.meta_page_id !== String(v.page_id)) { log(keyed.id, 'leadgen:page-mismatch', { page_id: v.page_id }); continue; }
        const t = keyed || await one(`SELECT * FROM tenants WHERE meta_page_id=$1`, [String(v.page_id)]);
        if (!t || !t.meta_page_token_enc) { log(t && t.id, 'leadgen:no-tenant-or-token', v); continue; }
        const lead = await WA.fetchLeadgen(decrypt(t.meta_page_token_enc), v.leadgen_id);
        await CRM.createLead(t, mapFields(lead.fields, { source: 'Meta Ads', campaign: lead.campaign || 'Meta Lead Ads', externalId: 'fb:' + v.leadgen_id }));
      }
    }
  }
}

/* map arbitrary form field names → lead fields */
function mapFields(f, base = {}) {
  const norm = {}; for (const [k, v] of Object.entries(f || {})) norm[String(k).toLowerCase().replace(/[^a-z0-9]/g, '_')] = Array.isArray(v) ? v[0] : v;
  const pick = (...keys) => { for (const k of keys) if (norm[k]) return String(norm[k]).trim(); return ''; };
  const fullName = pick('full_name', 'name', 'parent_name', 'parent', 'guardian_name', 'your_name');
  return Object.assign({
    parent: fullName || [pick('first_name'), pick('last_name')].filter(Boolean).join(' '),
    student: pick('student_name', 'student', 'child_name', 'child', 'ward_name'),
    phone: pick('phone_number', 'phone', 'mobile', 'mobile_number', 'whatsapp', 'whatsapp_number', 'contact', 'contact_number'),
    email: pick('email', 'email_address'),
    program: pick('program', 'programme', 'class', 'grade', 'course', 'admission_for', 'class_applying_for', 'which_class'),
    area: pick('city', 'area', 'locality', 'location', 'address'),
    campaign: pick('campaign', 'utm_campaign', 'campaign_name'),
  }, base, { campaign: base.campaign || pick('campaign', 'utm_campaign', 'campaign_name'), custom: extras(norm) });
}
/* any other form fields (roll_no, father_occupation…) become lead custom fields */
const USED = new Set(['full_name', 'name', 'parent_name', 'parent', 'guardian_name', 'your_name', 'first_name', 'last_name', 'student_name', 'student', 'child_name', 'child', 'ward_name', 'phone_number', 'phone', 'mobile', 'mobile_number', 'whatsapp', 'whatsapp_number', 'contact', 'contact_number', 'email', 'email_address', 'program', 'programme', 'class', 'grade', 'course', 'admission_for', 'class_applying_for', 'which_class', 'city', 'area', 'locality', 'location', 'address', 'campaign', 'utm_campaign', 'campaign_name', 'source', 'utm_source', 'utm_medium', 'utm_content', 'utm_term', 'gclid', 'fbclid', '_hp', '_redirect', 'google_key', 'lead_id', 'is_test']);
function extras(norm) { const o = {}; for (const [k, v] of Object.entries(norm)) if (!USED.has(k) && v != null && typeof v !== 'object' && String(v).trim()) o[k] = v; return o; }

/* ---------------- Website / generic lead webhook ---------------- */
const hooks = express.Router();
hooks.use((req, res, next) => { res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); if (req.method === 'OPTIONS') return res.sendStatus(204); next(); });
hooks.use(byIp('hooks', +(process.env.HOOK_RATE_LIMIT || 120)));
hooks.use(express.json({ limit: '200kb' }), express.urlencoded({ extended: true, limit: '200kb' }));
hooks.post('/leads/:key', wrap(async (req, res) => {
  const t = await one(`SELECT * FROM tenants WHERE webhook_key=$1 AND status='active'`, [req.params.key]); if (!t) throw new HttpError(404, 'Unknown form key');
  const b = req.body || {};
  if (b._hp) return res.json({ ok: true }); // honeypot
  const src = ['Meta Ads', 'Google Ads', 'Website Form', 'Walk-in', 'Referral', 'JustDial', 'Event / Seminar', 'WhatsApp'].includes(b.source) ? b.source : /google/i.test(b.utm_source || '') ? 'Google Ads' : /(facebook|instagram|meta|fb|ig)/i.test(b.utm_source || '') ? 'Meta Ads' : /justdial/i.test(b.utm_source || '') ? 'JustDial' : 'Website Form';
  const d = mapFields(b, { source: src });
  if (!d.phone) throw new HttpError(400, 'Phone number is required');
  const out = await CRM.createLead(t, d);
  log(t.id, 'hook:website', b);
  if (b._redirect && safeRedirect(req, b._redirect)) return res.redirect(303, b._redirect);
  res.status(out.duplicate ? 200 : 201).json({ ok: true, duplicate: out.duplicate });
}));

/* Website forms may bounce the visitor to a thank-you page — but only back to the site the form was submitted from (no open redirect). */
function safeRedirect(req, url) {
  try {
    const u = new URL(String(url)); if (!/^https?:$/.test(u.protocol)) return false;
    const from = req.headers.origin || req.headers.referer; if (!from) return false;
    return new URL(from).host === u.host;
  } catch (e) { return false; }
}

/* Google Ads lead form extension webhook */
hooks.post('/google-ads/:key', wrap(async (req, res) => {
  const t = await one(`SELECT * FROM tenants WHERE webhook_key=$1 AND status='active'`, [req.params.key]); if (!t) throw new HttpError(404, 'Unknown key');
  const b = req.body || {};
  if (!t.google_lead_key || !safeEq(b.google_key, t.google_lead_key)) { log(t.id, 'hook:google:bad-key', { lead_id: b.lead_id }); throw new HttpError(401, 'Invalid google_key'); }
  const f = {}; for (const c of b.user_column_data || []) { f[(c.column_id || c.column_name || '').toLowerCase()] = c.string_value; if (c.column_name) f[c.column_name.toLowerCase()] = c.string_value; }
  if (b.is_test) { log(t.id, 'hook:google:test', b); return res.json({}); }
  await CRM.createLead(t, mapFields(f, { source: 'Google Ads', campaign: b.campaign_id ? 'Google campaign ' + b.campaign_id : 'Google Ads lead form', externalId: 'g:' + b.lead_id }));
  res.json({});
}));

module.exports = { meta, hooks, mapFields, processMeta };
