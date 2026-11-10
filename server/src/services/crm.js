/* CRM domain logic shared by routes, webhooks and the worker */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { config, q, one, many, events, STAGE_LABEL, normalizePhone, displayPhone, HttpError, fileName } = require('../core');
const Storage = require('./storage');
const AI = require('./ai');
const WA = require('./whatsapp');

/* ---------------- shapes ---------------- */
const msgOut = m => ({ id: m.id, from: m.sender === 'lead' ? 'lead' : m.sender === 'sequence' ? 'bot' : m.sender === 'bot' ? 'bot' : 'agent', type: m.sender === 'broadcast' ? 'broadcast' : m.type, text: m.text, template: m.template, media: m.media, at: m.created_at, status: m.status, error: m.error });
function leadSummary(l) {
  return {
    id: l.id, student: l.student, parent: l.parent, phone: l.phone, program: l.program, source: l.source, campaign: l.campaign, area: l.area, stage: l.stage,
    counsellorId: l.counsellor_id, createdAt: l.created_at, lastActivityAt: l.last_activity_at, nextFollowUp: l.next_follow_up, tags: l.tags || [], unread: l.unread,
    ai: { score: l.ai_score, temp: l.ai_temp }, optedOut: l.opted_out,
    lastMessage: l.lm_text != null ? { text: l.lm_text, from: l.lm_sender === 'lead' ? 'lead' : l.lm_sender === 'sequence' ? 'bot' : 'agent', at: l.lm_at } : null,
  };
}
const LEAD_SELECT = `SELECT l.*, lm.text AS lm_text, lm.sender AS lm_sender, lm.created_at AS lm_at FROM leads l
  LEFT JOIN LATERAL (SELECT text, sender, created_at FROM messages m WHERE m.lead_id = l.id ORDER BY created_at DESC LIMIT 1) lm ON true`;

async function fullLead(tenantId, id) {
  const l = await one(`SELECT * FROM leads WHERE id=$1 AND tenant_id=$2`, [id, tenantId]);
  if (!l) throw new HttpError(404, 'Lead not found');
  const [messages, notes, timeline, seqs] = await Promise.all([
    many(`SELECT * FROM messages WHERE lead_id=$1 ORDER BY created_at`, [id]),
    many(`SELECT n.*, u.name AS by FROM notes n LEFT JOIN users u ON u.id=n.user_id WHERE lead_id=$1 ORDER BY created_at DESC`, [id]),
    many(`SELECT icon, text, created_at AS at FROM timeline WHERE lead_id=$1 ORDER BY created_at`, [id]),
    many(`SELECT e.sequence_id, s.name FROM enrollments e JOIN sequences s ON s.id=e.sequence_id WHERE e.lead_id=$1 AND e.status='active'`, [id]),
  ]);
  const ai = Object.keys(l.ai || {}).length ? l.ai : { score: l.ai_score, temp: l.ai_temp, factors: {}, max: {}, reasons: [], nextAction: '', updatedAt: l.created_at, model: '' };
  return Object.assign(leadSummary(l), {
    email: l.email, avgReplyMins: l.avg_reply_mins, ai, windowOpen: windowOpen(l), custom: l.custom || {},
    messages: messages.map(msgOut), notes: notes.map(n => ({ id: n.id, text: n.text, at: n.created_at, by: n.by || 'System' })), timeline,
    sequences: seqs.map(s => s.sequence_id), sequenceNames: Object.fromEntries(seqs.map(s => [s.sequence_id, s.name])),
  });
}
const windowOpen = l => !!(l.last_inbound_at && Date.now() - new Date(l.last_inbound_at).getTime() < 24 * 36e5);

/* ---------------- timeline / tenant ---------------- */
const timeline = (tenantId, leadId, icon, text) => q(`INSERT INTO timeline(tenant_id, lead_id, icon, text) VALUES ($1,$2,$3,$4)`, [tenantId, leadId, icon, text]);
const getTenant = id => one(`SELECT * FROM tenants WHERE id=$1`, [id]);
const settingsOf = t => Object.assign({ programs: require('../core').DEFAULT_PROGRAMS, spend: {}, deadlineText: '30 November', applyLink: '', welcomeTemplate: '', defaultLanguage: 'en', counsellorSeesAll: false, countryCode: config.defaultCountryCode }, t.settings || {});

/* ---------------- AI qualification ---------------- */
async function requalify(t, leadId, { silent, deep = true } = {}) {
  const l = await one(`SELECT * FROM leads WHERE id=$1 AND tenant_id=$2`, [leadId, t.id]); if (!l) return null;
  const inbound = (await many(`SELECT text FROM messages WHERE lead_id=$1 AND sender='lead' ORDER BY created_at DESC LIMIT 30`, [leadId])).map(r => r.text);
  const cfg = AI.cfgOf(t);
  /* Optional LLM read of the replies. Cached on the lead against a hash of the messages, so a model is only called when the parent has actually written something new.
     Bulk "re-qualify all" (deep=false) reuses the cache and never calls a model. Any failure silently falls back to rules only. */
  let llm = null;
  if (cfg.useLLM !== false && AI.provider() !== 'rules' && inbound.length) {
    const h = AI.hashMsgs(inbound); const cached = l.ai && l.ai.llm;
    if (cached && cached.hash === h) llm = cached;
    else if (deep) { try { const r = await AI.assessLead(l, inbound, { institution: t.name }); if (r) llm = Object.assign(r, { hash: h, at: new Date().toISOString() }); } catch (e) { console.warn('AI assess fallback:', e.message); } }
    else if (cached) llm = cached;
  }
  const ai = AI.score(l, inbound, cfg, Date.now(), llm);
  await q(`UPDATE leads SET ai=$1, ai_score=$2, ai_temp=$3 WHERE id=$4`, [ai, ai.score, ai.temp, leadId]);
  const prev = l.ai_temp !== ai.temp && Object.keys(l.ai || {}).length ? l.ai_temp : null;
  if (prev && !silent) {
    await timeline(t.id, leadId, 'auto_awesome', `AI re-qualified: ${prev} → ${ai.temp} (score ${ai.score})`);
    await q(`UPDATE enrollments e SET status='stopped' FROM sequences s WHERE s.id=e.sequence_id AND e.lead_id=$1 AND e.status='active' AND s.trigger LIKE 'temp:%' AND s.trigger <> $2`, [leadId, 'temp:' + ai.temp]);
    if (!['admitted', 'lost'].includes(l.stage)) await trigger(t, leadId, 'temp:' + ai.temp);
    if (ai.temp === 'hot' && cfg.autoAssignHot && !['admitted', 'lost'].includes(l.stage)) {
      const due = new Date(Date.now() + 36e5);
      await q(`INSERT INTO followups(tenant_id, lead_id, type, due_at, note, owner_id, auto) VALUES ($1,$2,'call',$3,'🔥 Hot lead — call within 1 hour',$4,true)`, [t.id, leadId, due, l.counsellor_id]);
      await q(`UPDATE leads SET next_follow_up=LEAST(COALESCE(next_follow_up,$2),$2) WHERE id=$1`, [leadId, due]);
    }
  }
  return { ai, prev };
}

/* ---------------- sequences ---------------- */
async function trigger(t, leadId, trig) {
  const seqs = await many(`SELECT id, name FROM sequences WHERE tenant_id=$1 AND active AND trigger=$2`, [t.id, trig]);
  for (const s of seqs) await enroll(t, s.id, leadId, s.name);
}
async function enroll(t, sequenceId, leadId, name) {
  const seq = await one(`SELECT name, steps FROM sequences WHERE id=$1`, [sequenceId]); if (!seq) return false;
  const first = (seq.steps || [])[0]; const delay = first ? +first.delayMinutes || 0 : 0;
  const r = await one(`INSERT INTO enrollments(tenant_id, sequence_id, lead_id, next_run_at) VALUES ($1,$2,$3, now() + make_interval(mins => $4))
    ON CONFLICT (sequence_id, lead_id) DO UPDATE SET status='active', step=0, next_run_at=now() + make_interval(mins => $4), started_at=now(), replied=false WHERE enrollments.status <> 'active' RETURNING id`, [t.id, sequenceId, leadId, delay]);
  if (r) await timeline(t.id, leadId, 'conversion_path', `Enrolled in “${name || seq.name}”`);
  return !!r;
}

/* ---------------- assignment ---------------- */
async function pickCounsellor(tenantId) {
  const r = await one(`SELECT u.id FROM users u LEFT JOIN leads l ON l.counsellor_id=u.id AND l.stage NOT IN ('admitted','lost')
    WHERE u.tenant_id=$1 AND u.active AND u.role IN ('counsellor','admin') GROUP BY u.id, u.role ORDER BY (u.role='admin'), count(l.id), random() LIMIT 1`, [tenantId]);
  return r && r.id;
}

/* custom fields: up to 30 simple key → text values, keys like roll_no / fee_balance */
function cleanCustom(c) {
  const out = {}; if (!c || typeof c !== 'object') return out;
  for (const [k, v] of Object.entries(c).slice(0, 30)) { const key = String(k).toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40); if (key && v != null && String(v).trim() !== '') out[key] = String(v).trim().slice(0, 500); }
  return out;
}
/* ---------------- lead creation (manual, import, webhooks, inbound) ---------------- */
async function createLead(t, d, { actorId, quiet } = {}) {
  const s = settingsOf(t);
  const wa = normalizePhone(d.phone, s.countryCode);
  if (!wa) throw new HttpError(400, `Invalid phone number: ${d.phone || '(empty)'}`);
  const existing = await one(`SELECT * FROM leads WHERE tenant_id=$1 AND wa_id=$2`, [t.id, wa]);
  if (existing) {
    const patch = {}; for (const k of ['student', 'parent', 'email', 'program', 'area']) if (d[k] && !existing[k]) patch[k] = d[k];
    if (d.custom && Object.keys(cleanCustom(d.custom)).length) await q(`UPDATE leads SET custom = custom || $2 WHERE id=$1`, [existing.id, cleanCustom(d.custom)]);
    if (Object.keys(patch).length) await q(`UPDATE leads SET ${Object.keys(patch).map((k, i) => `${k}=$${i + 2}`).join(',')} WHERE id=$1`, [existing.id, ...Object.values(patch)]);
    await q(`UPDATE leads SET last_activity_at=now() WHERE id=$1`, [existing.id]);
    await timeline(t.id, existing.id, 'replay', `Enquired again via ${d.source || 'unknown source'}${d.campaign ? ' (' + d.campaign + ')' : ''}`);
    return { lead: existing, duplicate: true };
  }
  const count = await one(`SELECT count(*)::int AS n FROM leads WHERE tenant_id=$1`, [t.id]);
  if (count.n >= t.max_contacts) throw new HttpError(402, `Contact limit reached for your plan (${t.max_contacts}). Contact K3 Solutions to upgrade.`);
  const mine = d.counsellorId && /^[0-9a-f-]{36}$/i.test(String(d.counsellorId)) ? await one(`SELECT id FROM users WHERE id=$1 AND tenant_id=$2 AND active`, [d.counsellorId, t.id]) : null;   // never trust an id from outside the tenant
  const counsellor = mine ? mine.id : await pickCounsellor(t.id);
  const lead = await one(`INSERT INTO leads(tenant_id, student, parent, phone, wa_id, email, program, source, campaign, area, counsellor_id, tags, external_id, next_follow_up, custom)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now() + interval '1 hour', $14) RETURNING *`,
    [t.id, d.student || '', d.parent || d.student || 'Parent', displayPhone(wa), wa, d.email || '', d.program || '', d.source || 'Website Form', d.campaign || '', d.area || '', counsellor, d.tags || [], d.externalId || null, cleanCustom(d.custom)]);
  await timeline(t.id, lead.id, 'person_add', `Enquiry captured from ${lead.source}${lead.campaign ? ' (' + lead.campaign + ')' : ''}`);
  await q(`INSERT INTO followups(tenant_id, lead_id, type, due_at, note, owner_id, auto) VALUES ($1,$2,'call', now() + interval '1 hour', 'First call within 1 hour of enquiry', $3, true)`, [t.id, lead.id, counsellor]);
  await requalify(t, lead.id, { silent: true });
  if (!quiet) {
    if (s.welcomeTemplate) {
      try { await sendToLead(t, lead, { type: 'template', template: s.welcomeTemplate }, null, 'bot'); }
      catch (e) { await timeline(t.id, lead.id, 'error', 'Welcome message failed: ' + e.message); }
    }
    await trigger(t, lead.id, 'lead_created');
    await trigger(t, lead.id, 'source:' + lead.source);
  }
  const fresh = await one(`${LEAD_SELECT} WHERE l.id=$1`, [lead.id]);
  events.emit(t.id, 'lead', leadSummary(fresh));
  return { lead: fresh, duplicate: false };
}

/* ---------------- outbound messaging ---------------- */
/* Template variables: each template can map {{1}}, {{2}}… to a lead field, a custom field or fixed text.
   Templates without a mapping use the default admissions order below. */
const DEFAULT_VARS = ['parent_first', 'program', 'deadline', 'apply_link', 'institution'];
const VAR_SOURCES = {
  parent_first: 'Parent first name', parent_full: 'Parent full name', student_first: 'Student first name', student_full: 'Student full name',
  program: 'Program / class', phone: 'Phone number', area: 'Area / city', counsellor: 'Counsellor name', institution: 'Institution name',
  session: 'Admission session', deadline: 'Deadline text (Settings)', apply_link: 'Application link (Settings)',
};
async function templateParams(t, lead, tpl) {
  const body = typeof tpl === 'string' ? tpl : tpl.body; const map = (typeof tpl === 'object' && Array.isArray(tpl.var_map)) ? tpl.var_map : [];
  const n = Math.max(0, ...(body.match(/\{\{(\d+)\}\}/g) || []).map(x => +x.replace(/\D/g, '')));
  const st = settingsOf(t); let counsellorName;
  const first = v => String(v || '').trim().split(/\s+/)[0];
  const resolve = async src => {
    if (!src) return null;
    if (src.startsWith('custom:')) return src.slice(7);
    if (src.startsWith('field:')) { const v = (lead.custom || {})[src.slice(6)]; return v == null ? null : String(v); }
    switch (src) {
      case 'parent_first': return first(lead.parent) || 'Parent';
      case 'parent_full': return lead.parent;
      case 'student_first': return first(lead.student) || first(lead.parent);
      case 'student_full': return lead.student || lead.parent;
      case 'program': return lead.program || 'admission';
      case 'phone': return lead.phone;
      case 'area': return lead.area;
      case 'counsellor': if (counsellorName === undefined) { const u = lead.counsellor_id && await one(`SELECT name FROM users WHERE id=$1`, [lead.counsellor_id]); counsellorName = u ? u.name : 'our admissions team'; } return counsellorName;
      case 'institution': return t.name;
      case 'session': return t.session;
      case 'deadline': return st.deadlineText;
      case 'apply_link': return st.applyLink || t.name;
      default: return null;
    }
  };
  const out = [];
  for (let i = 0; i < n; i++) { const v = await resolve(map[i] || DEFAULT_VARS[i] || 'institution'); out.push(v == null || String(v).trim() === '' ? '-' : String(v)); }
  return out;
}
const fillBody = (body, params) => body.replace(/\{\{(\d+)\}\}/g, (m, i) => params[+i - 1] ?? m);

/* WhatsApp media IDs expire 30 days after upload → reuse for 25 days, then upload again */
const MEDIA_TTL_MS = +(process.env.WA_MEDIA_TTL_DAYS || 25) * 864e5;
async function ensureWaMedia(t, row, force) {
  if (!row) return null;
  const fresh = row.wa_media_id && row.wa_uploaded_at && Date.now() - new Date(row.wa_uploaded_at).getTime() < MEDIA_TTL_MS;
  if (fresh && !force) return row.wa_media_id;
  // one upload per file even when many recipients are being sent in parallel
  const key = row.id + (force ? ':' + row.wa_media_id : '');
  if (!uploading.has(key)) {
    uploading.set(key, (async () => {
      if (!force) { const cur = await one(`SELECT wa_media_id, wa_uploaded_at FROM media WHERE id=$1`, [row.id]); if (cur && cur.wa_media_id && cur.wa_uploaded_at && Date.now() - new Date(cur.wa_uploaded_at).getTime() < MEDIA_TTL_MS) return cur.wa_media_id; }
      const id = await WA.uploadMedia(t, await Storage.localFile(row), row.mime, row.name);
      await q(`UPDATE media SET wa_media_id=$2, wa_uploaded_at=now() WHERE id=$1`, [row.id, id]); return id;
    })().finally(() => setTimeout(() => uploading.delete(key), 5000)));
  }
  const id = await uploading.get(key);
  row.wa_media_id = id; row.wa_uploaded_at = new Date(); return id;
}
const uploading = new Map();
/* payload: { type:'text'|'template'|'media', text, template, media:{id(media row id), type, url, name} } */
async function sendToLead(t, lead, payload, userId, sender = 'agent', extra = {}) {
  if (lead.opted_out) throw new HttpError(409, 'This contact has opted out of WhatsApp messages.');
  let rec = { type: payload.type || 'text', text: payload.text || '', template: null, media: null };
  let send, mediaRow = null;
  if (payload.type === 'template') {
    const tpl = await one(`SELECT * FROM templates WHERE tenant_id=$1 AND name=$2 ORDER BY (status='Approved') DESC LIMIT 1`, [t.id, payload.template]);
    if (!tpl) throw new HttpError(400, `Template “${payload.template}” not found. Sync templates from Meta in Templates.`);
    if (tpl.status !== 'Approved') throw new HttpError(400, `Template “${tpl.name}” is ${tpl.status}, not Approved yet.`);
    const params = await templateParams(t, lead, tpl);
    let header = null; const m = payload.media || extra.headerMedia;
    if (tpl.header !== 'none') {
      if (!m) throw new HttpError(400, `Template “${tpl.name}” needs a ${tpl.header} header — attach a creative.`);
      const row = m.id ? await one(`SELECT * FROM media WHERE id=$1 AND tenant_id=$2`, [m.id, t.id]) : null;
      if (row) { await ensureWaMedia(t, row); mediaRow = row; }
      header = { type: tpl.header, link: !row ? m.link : undefined, filename: row && row.name };
      rec.media = { type: tpl.header, url: row ? `/uploads/${fileName(row.path)}` : m.url, name: row ? row.name : m.name };
    }
    rec.template = tpl.name; rec.text = fillBody(tpl.body, params);
    send = () => WA.sendTemplate(t, lead.wa_id, { name: tpl.name, language: tpl.language, params, header: header && Object.assign({}, header, { id: mediaRow ? mediaRow.wa_media_id : undefined }) });
  } else {
    if (!windowOpen(lead)) throw new HttpError(409, 'The 24-hour WhatsApp window is closed — the parent hasn’t messaged in the last 24 hours. Send an approved template instead.');
    if (payload.type === 'media' && payload.media) {
      const row = await one(`SELECT * FROM media WHERE id=$1 AND tenant_id=$2`, [payload.media.id, t.id]); if (!row) throw new HttpError(400, 'Attachment not found');
      rec.media = { type: row.type, url: `/uploads/${fileName(row.path)}`, name: row.name };
      await ensureWaMedia(t, row); mediaRow = row;
      send = () => WA.sendMedia(t, lead.wa_id, { type: row.type === 'application' ? 'document' : row.type, id: row.wa_media_id, caption: payload.text, filename: row.name });
    } else {
      if (!rec.text.trim()) throw new HttpError(400, 'Message is empty');
      send = () => WA.sendText(t, lead.wa_id, rec.text);
    }
  }
  let waId = null, status = 'sent', error = null;
  try { waId = await send(); }
  catch (e0) {
    let e = e0;
    // expired / missing WhatsApp media ID → upload the file again once and resend
    if (mediaRow && WA.isMediaError(e)) { try { await ensureWaMedia(t, mediaRow, true); waId = await send(); e = null; } catch (e2) { e = e2; } }
    if (e) {
      if (extra.throwRetryable && WA.isRetryable(e)) throw e;   // caller (worker) will retry with back-off
      status = 'failed'; error = e.message; if (sender === 'agent' && !extra.recordFailure) throw e;
    }
  }
  const m = await one(`INSERT INTO messages(tenant_id, lead_id, sender, type, text, template, media, wa_message_id, status, error, user_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, [t.id, lead.id, sender, rec.type, rec.text, rec.template, rec.media, waId, status, error, userId]);
  await q(`UPDATE leads SET last_outbound_at=now(), last_activity_at=now(), stage=CASE WHEN stage='new' AND $2 = 'agent' THEN 'contacted' ELSE stage END WHERE id=$1`, [lead.id, sender]);
  const out = msgOut(m);
  if (!extra.silent) events.emit(t.id, 'message', { leadId: lead.id, message: out, lead: leadSummary(await one(`${LEAD_SELECT} WHERE l.id=$1`, [lead.id])) });
  if (status === 'failed' && sender !== 'agent') await timeline(t.id, lead.id, 'error', `${sender === 'broadcast' ? 'Broadcast' : 'Automated'} message failed: ${error}`);
  return { message: out, waId, status, error };
}

/* ---------------- inbound (webhook) ---------------- */
const STATUS_RANK = { queued: 0, sending: 0, sent: 1, delivered: 2, read: 3, failed: 4 };
function inboundText(m) {
  switch (m.type) {
    case 'text': return m.text && m.text.body;
    case 'button': return m.button && m.button.text;
    case 'interactive': return m.interactive && ((m.interactive.button_reply && m.interactive.button_reply.title) || (m.interactive.list_reply && m.interactive.list_reply.title));
    case 'image': case 'video': case 'document': case 'audio': case 'sticker': return (m[m.type] && m[m.type].caption) || (m.type === 'document' && m.document && m.document.filename) || `[${m.type}]`;
    case 'location': return `📍 Location: ${m.location.latitude}, ${m.location.longitude}`;
    case 'reaction': return null;
    default: return `[${m.type}]`;
  }
}
async function handleInbound(t, m, contact) {
  const text = inboundText(m); if (text == null) return;
  if (await one(`SELECT 1 FROM messages WHERE wa_message_id=$1`, [m.id])) return; // dedupe Meta retries
  let lead = await one(`SELECT * FROM leads WHERE tenant_id=$1 AND wa_id=$2`, [t.id, m.from]);
  if (!lead) {
    const name = (contact && contact.profile && contact.profile.name) || 'WhatsApp contact';
    lead = (await createLead(t, { phone: m.from, parent: name, student: '', source: 'WhatsApp', campaign: 'Inbound WhatsApp message' }, { quiet: true })).lead;
    await trigger(t, lead.id, 'lead_created'); await trigger(t, lead.id, 'source:WhatsApp');
  }
  let media = null;
  if (['image', 'video', 'document', 'audio'].includes(m.type)) {
    try {
      const { buffer, mime } = await WA.downloadMedia(t, m[m.type].id);
      const fname0 = (m.document && m.document.filename) || `whatsapp-${m.type}`;
      const st = await Storage.save(t.id, buffer, { name: fname0, mime });
      const row = await one(`INSERT INTO media(tenant_id, name, mime, type, size, path, data, storage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, name, path`, [t.id, fname0, mime, m.type, buffer.length, st.path, st.data, st.storage]);
      media = { type: m.type, url: `/uploads/${fileName(row.path)}`, name: row.name };
    } catch (e) { console.warn('inbound media download failed', e.message); }
  }
  const at = m.timestamp ? new Date(+m.timestamp * 1000) : new Date();
  const ctx = m.context && m.context.id;
  const saved = await one(`INSERT INTO messages(tenant_id, lead_id, sender, type, text, media, wa_message_id, context_id, status, created_at)
    VALUES ($1,$2,'lead',$3,$4,$5,$6,$7,'received',$8) ON CONFLICT (wa_message_id) DO NOTHING RETURNING *`, [t.id, lead.id, m.type, text, media, m.id, ctx, at]);
  if (!saved) return;
  // reply speed stats
  let avg = lead.avg_reply_mins, rc = lead.reply_count + 1;
  if (lead.last_outbound_at && (!lead.last_inbound_at || new Date(lead.last_outbound_at) > new Date(lead.last_inbound_at))) {
    const mins = Math.max(0, (at - new Date(lead.last_outbound_at)) / 6e4); avg = ((avg * (rc - 1)) + mins) / rc;
  }
  const upper = String(text).trim().toUpperCase();
  const optOut = ['STOP', 'UNSUBSCRIBE', 'STOP ALL'].includes(upper), optIn = ['START', 'SUBSCRIBE'].includes(upper);
  await q(`UPDATE leads SET reply_count=$2, avg_reply_mins=$3, unread=unread+1, last_inbound_at=$4, last_activity_at=$4, opted_out=CASE WHEN $5 THEN true WHEN $6 THEN false ELSE opted_out END WHERE id=$1`, [lead.id, rc, avg, at, optOut, optIn]);
  if (optOut) { await timeline(t.id, lead.id, 'block', 'Opted out of WhatsApp (replied STOP)'); await q(`UPDATE enrollments SET status='stopped' WHERE lead_id=$1 AND status='active'`, [lead.id]); }
  if (optIn) await timeline(t.id, lead.id, 'check_circle', 'Opted back in to WhatsApp (replied START)');
  // attribution
  if (ctx) await q(`UPDATE broadcast_recipients SET replied=true, clicked = clicked OR $2 WHERE wa_message_id=$1`, [ctx, m.type === 'button' || m.type === 'interactive']);
  else await q(`UPDATE broadcast_recipients SET replied=true WHERE lead_id=$1 AND sent_at > now() - interval '72 hours'`, [lead.id]);
  await q(`UPDATE enrollments SET replied=true WHERE lead_id=$1 AND status='active'`, [lead.id]);
  WA.markRead(t, m.id);
  const cfg = AI.cfgOf(t);
  const r = cfg.autoQualifyOnReply ? await requalify(t, lead.id) : null;
  const fresh = await one(`${LEAD_SELECT} WHERE l.id=$1`, [lead.id]);
  events.emit(t.id, 'message', { leadId: lead.id, message: msgOut(saved), lead: leadSummary(fresh), tempChangedFrom: r && r.prev });
}

const bcEmitAt = new Map();
async function handleStatus(t, s) {
  const st = s.status; if (!(st in STATUS_RANK)) return;
  const err = s.errors && s.errors[0] ? `${s.errors[0].code}: ${s.errors[0].title || s.errors[0].message}` : null;
  const msg = await one(`UPDATE messages SET status=$2, error=COALESCE($3, error) WHERE wa_message_id=$1 AND (CASE status WHEN 'failed' THEN 4 WHEN 'read' THEN 3 WHEN 'delivered' THEN 2 WHEN 'sent' THEN 1 ELSE 0 END) < $4 RETURNING id, lead_id`, [s.id, st, err, STATUS_RANK[st]]);
  if (msg) events.emit(t.id, 'status', { leadId: msg.lead_id, messageId: msg.id, status: st });
  const rcp = await one(`UPDATE broadcast_recipients SET status=$2, error=COALESCE($3, error) WHERE wa_message_id=$1 AND (CASE status WHEN 'failed' THEN 4 WHEN 'read' THEN 3 WHEN 'delivered' THEN 2 WHEN 'sent' THEN 1 ELSE 0 END) < $4 RETURNING broadcast_id`, [s.id, st, err, STATUS_RANK[st]]);
  if (rcp) { const last = bcEmitAt.get(rcp.broadcast_id) || 0; if (Date.now() - last > 1500) { bcEmitAt.set(rcp.broadcast_id, Date.now()); events.emit(t.id, 'broadcast', await broadcastOut(rcp.broadcast_id)); } }
  if (st === 'failed' && msg && s.errors && s.errors[0] && [131026, 131047].includes(s.errors[0].code)) await timeline(t.id, msg.lead_id, 'error', 'WhatsApp delivery failed: ' + err);
}

/* ---------------- broadcasts ---------------- */
async function broadcastOut(id) {
  const b = await one(`SELECT * FROM broadcasts WHERE id=$1`, [id]);
  const s = await one(`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE status IN ('sent','delivered','read'))::int AS sent,
      count(*) FILTER (WHERE status IN ('delivered','read'))::int AS delivered,
      count(*) FILTER (WHERE status='read')::int AS read,
      count(*) FILTER (WHERE status='failed')::int AS failed,
      count(*) FILTER (WHERE replied)::int AS replied, count(*) FILTER (WHERE clicked)::int AS clicked,
      count(*) FILTER (WHERE status='queued' AND attempts > 0)::int AS retrying
    FROM broadcast_recipients WHERE broadcast_id=$1`, [id]);
  return { id: b.id, name: b.name, status: b.status, template: b.template, audienceLabel: b.audience_label, segment: b.segment, sentAt: b.sent_at || b.scheduled_at, creative: b.creative,
    stats: { audience: b.audience || s.total, sent: s.sent + s.failed, delivered: s.delivered, read: s.read, replied: s.replied, clicked: s.clicked, failed: s.failed, retrying: s.retrying } };
}
function segmentWhere(seg, params) {
  const w = [`l.tenant_id=$1`, `NOT l.opted_out`];
  const add = (col, arr) => { if (arr && arr.length) { params.push(arr); w.push(`${col} = ANY($${params.length})`); } };
  add('l.ai_temp', seg.temps); add('l.stage', seg.stages); add('l.program', seg.programs); add('l.source', seg.sources); add('l.id::text', seg.leadIds);
  return w.join(' AND ');
}
async function audience(t, seg) {
  const params = [t.id]; const where = segmentWhere(seg || {}, params);
  const n = await one(`SELECT count(*)::int AS n FROM leads l WHERE ${where}`, params);
  const sample = await many(`${LEAD_SELECT} WHERE ${where} ORDER BY l.created_at DESC LIMIT 5`, params);
  return { count: n.n, sample: sample.map(leadSummary) };
}
async function startBroadcast(t, id) {
  const b = await one(`SELECT * FROM broadcasts WHERE id=$1 AND tenant_id=$2`, [id, t.id]); if (!b) throw new HttpError(404, 'Broadcast not found');
  if (['Sending', 'Completed'].includes(b.status)) return broadcastOut(id);
  const tpl = await one(`SELECT status FROM templates WHERE tenant_id=$1 AND name=$2 ORDER BY (status='Approved') DESC LIMIT 1`, [t.id, b.template]);
  if (!tpl || tpl.status !== 'Approved') throw new HttpError(400, `Template “${b.template}” is not approved.`);
  WA.creds(t);
  const params = [t.id]; const where = segmentWhere(b.segment || {}, params);
  params.push(id);
  await q(`INSERT INTO broadcast_recipients(broadcast_id, tenant_id, lead_id) SELECT $${params.length}, l.tenant_id, l.id FROM leads l WHERE ${where} ON CONFLICT DO NOTHING`, params);
  const n = await one(`SELECT count(*)::int AS n FROM broadcast_recipients WHERE broadcast_id=$1`, [id]);
  await q(`UPDATE broadcasts SET status='Sending', sent_at=now(), audience=$2 WHERE id=$1`, [id, n.n]);
  const out = await broadcastOut(id); events.emit(t.id, 'broadcast', out); return out;
}

module.exports = { cleanCustom, VAR_SOURCES, DEFAULT_VARS, ensureWaMedia, leadSummary, LEAD_SELECT, fullLead, msgOut, timeline, getTenant, settingsOf, requalify, trigger, enroll, createLead, sendToLead, templateParams, fillBody, handleInbound, handleStatus, broadcastOut, audience, startBroadcast, segmentWhere, windowOpen, STAGE_LABEL };
