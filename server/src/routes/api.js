/* CRM REST API — /api/v1 (tenant scoped) */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { config, q, one, many, events, STAGES, STAGE_LABEL, SOURCES, initials, HttpError, wrap } = require('../core');
const Storage = require('../services/storage');
const { requireRole } = require('../auth');
const CRM = require('../services/crm');
const AI = require('../services/ai');
const WA = require('../services/whatsapp');
const { triggerLabel, TRIGGERS } = require('../services/defaults');

const r = express.Router();
const T = req => req.tenant;
/* helpers: a user id coming from the client must belong to THIS institution; LIKE wildcards in search text are literal */
const tenantUser = async (tenantId, id) => isUuid(id) ? one(`SELECT id FROM users WHERE id=$1 AND tenant_id=$2 AND active`, [id, tenantId]) : null;
const likeEsc = s => String(s).replace(/[\\%_]/g, c => '\\' + c).slice(0, 100);
const aiLimit = require('../services/ratelimit').limiter({ windowMs: 60e3, max: +(process.env.AI_RATE_LIMIT || 30), key: req => 'ai|' + req.user.id, message: 'Too many AI requests — try again in a minute.' });
const isCounsellorScoped = req => req.role === 'counsellor' && !CRM.settingsOf(req.tenant).counsellorSeesAll;
async function loadLead(req, id) {
  const l = await one(`SELECT * FROM leads WHERE id=$1 AND tenant_id=$2`, [id, T(req).id]);
  if (!l) throw new HttpError(404, 'Lead not found');
  if (isCounsellorScoped(req) && l.counsellor_id !== req.user.id) throw new HttpError(403, 'This lead is assigned to another counsellor');
  return l;
}
const isUuid = s => /^[0-9a-f-]{36}$/i.test(String(s || ''));

/* ---------------- realtime ---------------- */
r.get('/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders(); res.write('retry: 5000\n\n');
  events.add(T(req).id, res);
});

/* ---------------- meta ---------------- */
r.get('/meta', wrap(async (req, res) => {
  const t = T(req); const s = CRM.settingsOf(t);
  const users = await many(`SELECT id, name, color, role FROM users WHERE tenant_id=$1 AND active ORDER BY name`, [t.id]);
  res.json({
    programs: s.programs, sources: SOURCES, stages: STAGES.map(id => ({ id, label: STAGE_LABEL[id] })),
    counsellors: users.map(u => ({ id: u.id, name: u.name, initials: initials(u.name), color: u.color, role: u.role })),
    institution: { name: t.name, type: t.type, city: t.city, session: t.session, plan: t.plan },
    whatsappNumber: t.wa_display_number || 'WhatsApp not connected', whatsappConnected: !!(t.wa_phone_number_id && t.wa_access_token_enc),
    triggers: TRIGGERS.map(([id, label]) => ({ id, label })),
    templateVars: { deadline: s.deadlineText, applyLink: s.applyLink },
    user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.role, color: req.user.color }, impersonating: req.impersonating,
  });
}));

/* ---------------- leads ---------------- */
r.get('/leads', wrap(async (req, res) => {
  const p = [T(req).id]; const w = ['l.tenant_id=$1'];
  const add = (sql, v) => { p.push(v); w.push(sql.replace('?', '$' + p.length)); };
  if (req.query.q) add(`(l.student || ' ' || l.parent || ' ' || l.wa_id || ' ' || l.program || ' ' || l.area || ' ' || l.email) ILIKE ?`, '%' + likeEsc(req.query.q) + '%');
  if (req.query.temp) add('l.ai_temp=?', req.query.temp);
  if (req.query.stage) add('l.stage=?', req.query.stage);
  if (req.query.source) add('l.source=?', req.query.source);
  if (req.query.program) add('l.program=?', req.query.program);
  if (isUuid(req.query.counsellor)) add('l.counsellor_id=?', req.query.counsellor);
  if (isCounsellorScoped(req)) add('l.counsellor_id=?', req.user.id);
  const limit = Math.max(1, Math.min(5000, Math.floor(+req.query.limit) || 2000));
  const rows = await many(`${CRM.LEAD_SELECT} WHERE ${w.join(' AND ')} ORDER BY l.created_at DESC LIMIT ${limit}`, p);
  res.json(rows.map(CRM.leadSummary));
}));
r.post('/leads/import', wrap(async (req, res) => {
  const rows = Array.isArray(req.body.rows) ? req.body.rows.slice(0, 5000) : [];
  let imported = 0, duplicates = 0; const errors = [];
  for (const [i, row] of rows.entries()) {
    const KNOWN = ['student', 'parent', 'phone', 'email', 'program', 'source', 'campaign', 'area', 'tags', 'custom'];
    const custom = Object.assign({}, row.custom || {}); for (const k of Object.keys(row)) if (!KNOWN.includes(k)) custom[k] = row[k];
    try { const out = await CRM.createLead(T(req), { ...row, custom, source: SOURCES.includes(row.source) ? row.source : 'Website Form' }, { actorId: req.user.id, quiet: !req.body.sendWelcome }); out.duplicate ? duplicates++ : imported++; }
    catch (e) { errors.push({ row: i + 1, error: e.message }); }
  }
  res.json({ imported, duplicates, errors: errors.slice(0, 50) });
}));
r.post('/leads/qualify', wrap(async (req, res) => {
  const t = T(req); const ids = await many(`SELECT id FROM leads WHERE tenant_id=$1`, [t.id]);
  const out = { hot: 0, warm: 0, cold: 0, changed: 0 };
  for (const { id } of ids) { const x = await CRM.requalify(t, id, { deep: false }); if (x) { out[x.ai.temp]++; if (x.prev) out.changed++; } }
  res.json(out);
}));
r.get('/leads/:id', wrap(async (req, res) => { await loadLead(req, req.params.id); res.json(await CRM.fullLead(T(req).id, req.params.id)); }));
r.post('/leads', wrap(async (req, res) => {
  const d = req.body || {}; if (!d.phone) throw new HttpError(400, 'WhatsApp number is required');
  if (d.counsellorId && !isUuid(d.counsellorId)) delete d.counsellorId;
  const out = await CRM.createLead(T(req), d, { actorId: req.user.id });
  res.status(out.duplicate ? 200 : 201).json(Object.assign(await CRM.fullLead(T(req).id, out.lead.id), { duplicate: out.duplicate }));
}));
r.patch('/leads/:id', wrap(async (req, res) => {
  const t = T(req); const l = await loadLead(req, req.params.id); const b = req.body || {};
  const set = {}; const tl = [];
  for (const k of ['student', 'parent', 'program', 'area', 'email', 'campaign']) if (typeof b[k] === 'string') set[k] = b[k];
  if (b.stage && b.stage !== l.stage) { if (!STAGES.includes(b.stage)) throw new HttpError(400, 'Invalid stage'); set.stage = b.stage; tl.push(['swap_horiz', `Stage: ${STAGE_LABEL[l.stage]} → ${STAGE_LABEL[b.stage]}`]); }
  if (b.counsellorId && b.counsellorId !== l.counsellor_id) {
    const u = await one(`SELECT name FROM users WHERE id=$1 AND tenant_id=$2`, [b.counsellorId, t.id]); if (!u) throw new HttpError(400, 'Unknown counsellor');
    set.counsellor_id = b.counsellorId; tl.push(['person', `Reassigned to ${u.name}`]);
  }
  if (Array.isArray(b.tags)) set.tags = b.tags.map(String).slice(0, 20);
  if (b.custom && typeof b.custom === 'object') { set.custom = CRM.cleanCustom(b.custom); tl.push(['tune', 'Custom fields updated']); }
  if (b.unread !== undefined) set.unread = 0;
  if (b.nextFollowUp !== undefined) { if (b.nextFollowUp === null) set.next_follow_up = null; else { const d = new Date(b.nextFollowUp); if (isNaN(d)) throw new HttpError(400, 'Invalid follow-up date'); set.next_follow_up = d; } }
  if (typeof b.optedOut === 'boolean') { set.opted_out = b.optedOut; tl.push(['block', b.optedOut ? 'Marked as opted out' : 'Opt-out removed']); }
  if (Object.keys(set).length) {
    if (b.unread === undefined) set.last_activity_at = new Date();
    await q(`UPDATE leads SET ${Object.keys(set).map((k, i) => `${k}=$${i + 2}`).join(', ')} WHERE id=$1`, [l.id, ...Object.values(set)]);
  }
  for (const [icon, text] of tl) await CRM.timeline(t.id, l.id, icon, text);
  if (set.stage) {
    if (['admitted', 'lost'].includes(set.stage)) { await q(`UPDATE enrollments SET status='stopped' WHERE lead_id=$1 AND status='active'`, [l.id]); await q(`UPDATE followups SET done=true, done_at=now() WHERE lead_id=$1 AND NOT done AND auto`, [l.id]); }
    await CRM.requalify(t, l.id); await CRM.trigger(t, l.id, 'stage:' + set.stage);
  }
  res.json(await CRM.fullLead(t.id, l.id));
}));
r.post('/leads/:id/notes', wrap(async (req, res) => {
  const l = await loadLead(req, req.params.id); const text = String(req.body.text || '').trim(); if (!text) throw new HttpError(400, 'Note is empty');
  const n = await one(`INSERT INTO notes(tenant_id, lead_id, text, user_id) VALUES ($1,$2,$3,$4) RETURNING *`, [T(req).id, l.id, text, req.user.id]);
  await CRM.timeline(T(req).id, l.id, 'sticky_note_2', 'Note: ' + text.slice(0, 140));
  await q(`UPDATE leads SET last_activity_at=now() WHERE id=$1`, [l.id]);
  res.status(201).json({ id: n.id, text: n.text, at: n.created_at, by: req.user.name });
}));
r.post('/leads/:id/qualify', wrap(async (req, res) => {
  const l = await loadLead(req, req.params.id); const x = await CRM.requalify(T(req), l.id);
  await CRM.timeline(T(req).id, l.id, 'auto_awesome', `AI qualification run → ${x.ai.temp} (${x.ai.score})`);
  res.json(Object.assign({}, x.ai, { previous: x.prev }));
}));

/* ---------------- inbox ---------------- */
r.get('/conversations', wrap(async (req, res) => {
  const p = [T(req).id]; let extra = '';
  if (isCounsellorScoped(req)) { p.push(req.user.id); extra = ' AND l.counsellor_id=$2'; }
  const rows = await many(`${CRM.LEAD_SELECT} WHERE l.tenant_id=$1${extra} AND lm.text IS NOT NULL ORDER BY lm.created_at DESC NULLS LAST LIMIT 500`, p);
  res.json(rows.map(CRM.leadSummary));
}));
r.get('/leads/:id/messages', wrap(async (req, res) => {
  const l = await loadLead(req, req.params.id);
  await q(`UPDATE leads SET unread=0 WHERE id=$1`, [l.id]);
  res.json((await many(`SELECT * FROM messages WHERE lead_id=$1 ORDER BY created_at`, [l.id])).map(CRM.msgOut));
}));
r.post('/leads/:id/messages', wrap(async (req, res) => {
  const l = await loadLead(req, req.params.id); const b = req.body || {};
  const payload = { type: b.type || (b.media ? 'media' : 'text'), text: b.text, template: b.template, media: b.media && isUuid(b.media.id) ? { id: b.media.id } : null };
  const out = await CRM.sendToLead(T(req), l, payload, req.user.id, 'agent');
  res.status(201).json(out.message);
}));

/* ---------------- follow-ups ---------------- */
const fuOut = f => ({ id: f.id, leadId: f.lead_id, type: f.type, due: f.due_at, note: f.note, done: f.done, owner: f.owner_id, auto: f.auto, lead: f.l_id ? { id: f.l_id, parent: f.parent, student: f.student, program: f.program, stage: f.stage, phone: f.phone, ai: { temp: f.ai_temp, score: f.ai_score } } : null });
r.get('/followups', wrap(async (req, res) => {
  const p = [T(req).id]; let extra = '';
  if (isCounsellorScoped(req)) { p.push(req.user.id); extra = ' AND f.owner_id=$2'; }
  const rows = await many(`SELECT f.*, l.id AS l_id, l.parent, l.student, l.program, l.stage, l.phone, l.ai_temp, l.ai_score FROM followups f JOIN leads l ON l.id=f.lead_id
    WHERE f.tenant_id=$1${extra} AND (NOT f.done OR f.done_at > now() - interval '30 days') ORDER BY f.due_at LIMIT 3000`, p);
  res.json(rows.map(fuOut));
}));
r.post('/followups', wrap(async (req, res) => {
  const t = T(req); const b = req.body || {}; const l = await loadLead(req, b.leadId);
  const due = new Date(b.due); if (isNaN(due)) throw new HttpError(400, 'Invalid due date');
  let owner = l.counsellor_id; if (b.owner) { if (!(await tenantUser(t.id, b.owner))) throw new HttpError(400, 'Unknown team member'); owner = b.owner; }
  const f = await one(`INSERT INTO followups(tenant_id, lead_id, type, due_at, note, owner_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [t.id, l.id, b.type || 'call', due, b.note || '', owner]);
  await q(`UPDATE leads SET next_follow_up=$2 WHERE id=$1`, [l.id, due]);
  await CRM.timeline(t.id, l.id, 'event', `Follow-up scheduled (${f.type}) for ${due.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}`);
  res.status(201).json(fuOut(f));
}));
r.patch('/followups/:id', wrap(async (req, res) => {
  const t = T(req); const f = await one(`SELECT * FROM followups WHERE id=$1 AND tenant_id=$2`, [req.params.id, t.id]); if (!f) throw new HttpError(404, 'Task not found');
  await loadLead(req, f.lead_id); const b = req.body || {};
  const set = {};
  if (typeof b.done === 'boolean') { set.done = b.done; set.done_at = b.done ? new Date() : null; }
  if (b.due) { const d = new Date(b.due); if (isNaN(d)) throw new HttpError(400, 'Invalid due date'); set.due_at = d; }
  if (b.owner) { if (!(await tenantUser(t.id, b.owner))) throw new HttpError(400, 'Unknown team member'); set.owner_id = b.owner; }
  if (typeof b.note === 'string') set.note = b.note;
  const out = await one(`UPDATE followups SET ${Object.keys(set).map((k, i) => `${k}=$${i + 2}`).join(', ') || 'note=note'} WHERE id=$1 RETURNING *`, [f.id, ...Object.values(set)]);
  if (b.done) await CRM.timeline(t.id, f.lead_id, 'task_alt', 'Follow-up done: ' + f.note);
  const nextDue = await one(`SELECT min(due_at) AS d FROM followups WHERE lead_id=$1 AND NOT done`, [f.lead_id]);
  await q(`UPDATE leads SET next_follow_up=$2 WHERE id=$1`, [f.lead_id, nextDue.d]);
  res.json(fuOut(out));
}));

/* ---------------- sequences ---------------- */
async function seqOut(tenantId) {
  const rows = await many(`SELECT s.*, count(e.*)::int AS enrolled, count(e.*) FILTER (WHERE e.status='completed')::int AS completed, count(e.*) FILTER (WHERE e.replied)::int AS replied
    FROM sequences s LEFT JOIN enrollments e ON e.sequence_id=s.id WHERE s.tenant_id=$1 GROUP BY s.id ORDER BY s.created_at`, [tenantId]);
  return rows.map(s => ({ id: s.id, name: s.name, trigger: triggerLabel(s.trigger), triggerKey: s.trigger, active: s.active, color: s.color, enrolled: s.enrolled, completed: s.completed, replyRate: s.enrolled ? s.replied / s.enrolled : 0,
    steps: (s.steps || []).map(st => ({ kind: st.kind, delay: st.kind === 'condition' ? '' : st.delayLabel, delayMinutes: st.delayMinutes, title: st.title, detail: st.detail, template: st.template, taskType: st.taskType })) }));
}
const cleanSteps = steps => (Array.isArray(steps) ? steps : []).slice(0, 20).map(s => ({
  kind: ['send', 'task', 'condition'].includes(s.kind) ? s.kind : 'send', delayMinutes: Math.max(0, +s.delayMinutes || 0), delayLabel: String(s.delayLabel || s.delay || 'Instantly'),
  title: String(s.title || s.template || ''), detail: String(s.detail || ''), template: s.kind === 'send' ? String(s.template || s.title || '') : undefined, taskType: s.taskType || 'call',
}));
r.get('/sequences', wrap(async (req, res) => res.json(await seqOut(T(req).id))));
r.post('/sequences', requireRole('admin'), wrap(async (req, res) => {
  const b = req.body || {}; if (!b.name) throw new HttpError(400, 'Name is required');
  await q(`INSERT INTO sequences(tenant_id, name, trigger, active, color, steps) VALUES ($1,$2,$3,$4,$5,$6)`, [T(req).id, b.name, b.trigger || 'manual', b.active !== false, b.color || '#1a73e8', JSON.stringify(cleanSteps(b.steps))]);
  res.status(201).json(await seqOut(T(req).id));
}));
r.patch('/sequences/:id', requireRole('admin'), wrap(async (req, res) => {
  const s = await one(`SELECT * FROM sequences WHERE id=$1 AND tenant_id=$2`, [req.params.id, T(req).id]); if (!s) throw new HttpError(404, 'Sequence not found');
  const b = req.body || {};
  const out = await one(`UPDATE sequences SET name=COALESCE($2,name), trigger=COALESCE($3,trigger), active=COALESCE($4,active), steps=COALESCE($5,steps) WHERE id=$1 RETURNING *`,
    [s.id, b.name || null, b.trigger || null, typeof b.active === 'boolean' ? b.active : null, b.steps ? JSON.stringify(cleanSteps(b.steps)) : null]);
  if (b.active === false) await q(`UPDATE enrollments SET next_run_at=next_run_at WHERE sequence_id=$1`, [s.id]);
  res.json({ id: out.id, name: out.name, active: out.active });
}));
r.delete('/sequences/:id', requireRole('admin'), wrap(async (req, res) => { await q(`DELETE FROM sequences WHERE id=$1 AND tenant_id=$2`, [req.params.id, T(req).id]); res.status(204).end(); }));
r.post('/sequences/:id/enroll', wrap(async (req, res) => {
  const s = await one(`SELECT * FROM sequences WHERE id=$1 AND tenant_id=$2`, [req.params.id, T(req).id]); if (!s) throw new HttpError(404, 'Sequence not found');
  let n = 0; for (const id of (req.body.leadIds || []).filter(isUuid)) { await loadLead(req, id); if (await CRM.enroll(T(req), s.id, id, s.name)) n++; }
  res.json({ ok: true, enrolled: n });
}));

/* ---------------- templates ---------------- */
async function tplOut(tenantId) {
  const rows = await many(`SELECT t.*, coalesce(s.sent,0)::int AS sent, coalesce(s.read,0)::int AS read FROM templates t
    LEFT JOIN (SELECT template, count(*) AS sent, count(*) FILTER (WHERE status='read') AS read FROM messages WHERE tenant_id=$1 AND template IS NOT NULL GROUP BY template) s ON s.template=t.name
    WHERE t.tenant_id=$1 ORDER BY t.status='Approved' DESC, t.created_at DESC`, [tenantId]);
  const LANG = { en: 'English', en_US: 'English (US)', en_GB: 'English (UK)', bn: 'Bengali', hi: 'Hindi' };
  return rows.map(t => ({ id: t.id, name: t.name, category: t.category, language: LANG[t.language] || t.language, languageCode: t.language, status: t.status, header: t.header, body: t.body, buttons: t.buttons, sent: t.sent, readRate: t.sent ? t.read / t.sent : 0, rejectReason: t.reject_reason, varMap: t.var_map || [], vars: Math.max(0, ...(t.body.match(/\{\{(\d+)\}\}/g) || []).map(x => +x.replace(/\D/g, ''))) }));
}
r.get('/templates', wrap(async (req, res) => res.json(await tplOut(T(req).id))));
async function syncTemplates(t) {
  const list = await WA.listTemplates(t);
  for (const m of list) {
    await q(`INSERT INTO templates(tenant_id, name, language, category, status, header, body, buttons, reject_reason, meta_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (tenant_id, name, language) DO UPDATE SET category=$4, status=$5, header=$6, body=$7, buttons=$8, reject_reason=$9, meta_id=$10`,
      [t.id, m.name, m.language, m.category, m.status, m.header, m.body, JSON.stringify(m.buttons), m.reject_reason, m.meta_id]);
  }
  return list.length;
}
/* variable mapping per template */
r.get('/templates/variables', wrap(async (req, res) => {
  const keys = await many(`SELECT DISTINCT jsonb_object_keys(custom) AS k FROM leads WHERE tenant_id=$1 AND custom <> '{}'::jsonb LIMIT 100`, [T(req).id]);
  res.json({ sources: CRM.VAR_SOURCES, defaults: CRM.DEFAULT_VARS, customFields: keys.map(x => x.k).sort() });
}));
r.patch('/templates/:id', requireRole('admin'), wrap(async (req, res) => {
  const t = await one(`SELECT * FROM templates WHERE id=$1 AND tenant_id=$2`, [req.params.id, T(req).id]); if (!t) throw new HttpError(404, 'Template not found');
  const vm = Array.isArray(req.body.varMap) ? req.body.varMap.slice(0, 20).map(v => { v = String(v || ''); return v.startsWith('custom:') ? v.slice(0, 300) : v.startsWith('field:') ? 'field:' + v.slice(6).toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40) : (CRM.VAR_SOURCES[v] ? v : ''); }) : [];
  await q(`UPDATE templates SET var_map=$2 WHERE id=$1`, [t.id, JSON.stringify(vm)]);
  res.json((await tplOut(T(req).id)).find(x => x.id === t.id));
}));
/* preview: render a template for a given lead with its mapping */
r.post('/templates/:id/preview', wrap(async (req, res) => {
  const t = await one(`SELECT * FROM templates WHERE id=$1 AND tenant_id=$2`, [req.params.id, T(req).id]); if (!t) throw new HttpError(404, 'Template not found');
  if (Array.isArray(req.body.varMap)) t.var_map = req.body.varMap;
  const lead = isUuid(req.body.leadId) ? await loadLead(req, req.body.leadId) : (await one(`SELECT * FROM leads WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 1`, [T(req).id])) || { parent: 'Priya Sharma', student: 'Aarav Sharma', program: 'Class 5', custom: {} };
  const params = await CRM.templateParams(T(req), lead, t);
  res.json({ params, text: CRM.fillBody(t.body, params), lead: lead.id ? { id: lead.id, parent: lead.parent } : null });
}));
r.post('/templates/sync', requireRole('admin'), wrap(async (req, res) => { const n = await syncTemplates(T(req)); res.json({ synced: n, templates: await tplOut(T(req).id) }); }));
r.post('/templates', requireRole('admin'), wrap(async (req, res) => {
  const t = T(req); const b = req.body || {};
  const name = String(b.name || '').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 512); if (!name) throw new HttpError(400, 'Template name is required');
  if (!b.body) throw new HttpError(400, 'Template body is required');
  const tpl = { name, category: b.category === 'Utility' ? 'Utility' : 'Marketing', language: WA.langCode(b.language || 'en'), header: ['image', 'video', 'document'].includes(b.header) ? b.header : 'none', body: String(b.body), buttons: (b.buttons || []).slice(0, 3) };
  let sample = null; if (isUuid(b.sampleMediaId)) { const m = await one(`SELECT * FROM media WHERE id=$1 AND tenant_id=$2`, [b.sampleMediaId, t.id]); if (m) sample = { path: await Storage.localFile(m), mime: m.mime }; }
  const meta = await WA.createTemplate(t, tpl, sample);
  await q(`INSERT INTO templates(tenant_id, name, language, category, status, header, body, buttons, meta_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (tenant_id, name, language) DO UPDATE SET status=$5, body=$7, buttons=$8, meta_id=$9`, [t.id, tpl.name, tpl.language, tpl.category, meta.status, tpl.header, tpl.body, JSON.stringify(tpl.buttons), meta.meta_id]);
  res.status(201).json(await tplOut(t.id));
}));
r.post('/templates/recommended', requireRole('admin'), wrap(async (req, res) => {
  const t = T(req); const { TEMPLATES } = require('../services/defaults'); const results = [];
  for (const tpl of TEMPLATES) {
    try { const meta = await WA.createTemplate(t, tpl, null);
      await q(`INSERT INTO templates(tenant_id, name, language, category, status, header, body, buttons, meta_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (tenant_id, name, language) DO UPDATE SET status=$5, meta_id=$9`,
        [t.id, tpl.name, tpl.language, tpl.category, meta.status, tpl.header, tpl.body, JSON.stringify(tpl.buttons), meta.meta_id]);
      results.push({ name: tpl.name, ok: true }); }
    catch (e) { results.push({ name: tpl.name, ok: false, error: e.message }); }
  }
  res.json({ results, templates: await tplOut(t.id) });
}));

/* ---------------- media ---------------- */
const upload = multer({ storage: multer.diskStorage({ destination: config.uploadDir, filename: (req, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') + Storage.extOf(f.originalname, f.mimetype)) }), limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, f, cb) => Storage.allowedMime(f.mimetype) ? cb(null, true) : cb(new HttpError(400, 'This file type is not supported. Use JPG/PNG images, MP4/3GP video, audio, PDF, Word, Excel, PowerPoint or text files.')) });
const LIMITS = { image: 5, video: 16, audio: 16, document: 100 };
r.post('/media', upload.single('file'), wrap(async (req, res) => {
  const f = req.file; if (!f) throw new HttpError(400, 'No file uploaded');
  f.mimetype = String(f.mimetype).split(';')[0].trim().toLowerCase();
  const major = f.mimetype.split('/')[0]; const type = ['image', 'video', 'audio'].includes(major) ? major : 'document';
  if (type === 'image' && !['image/jpeg', 'image/png'].includes(f.mimetype)) { fs.unlinkSync(f.path); throw new HttpError(400, 'WhatsApp accepts JPG or PNG images only'); }
  if (f.size > LIMITS[type] * 1048576) { fs.unlinkSync(f.path); throw new HttpError(400, `WhatsApp allows ${type} files up to ${LIMITS[type]} MB`); }
  let waId = null; try { waId = await WA.uploadMedia(T(req), f.path, f.mimetype, f.originalname); } catch (e) { if (e.status !== 400 || !/not connected/i.test(e.message)) throw e; }
  const buf = fs.readFileSync(f.path); const st = await Storage.save(T(req).id, buf, { name: f.originalname, mime: f.mimetype });
  try { fs.unlinkSync(f.path); } catch (e) { /* */ }
  const m = await one(`INSERT INTO media(tenant_id, wa_media_id, wa_uploaded_at, name, mime, type, size, path, data, storage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, name, mime, size, path`,
    [T(req).id, waId, waId ? new Date() : null, f.originalname || 'file', f.mimetype, type, f.size, st.path, st.data, st.storage]);
  res.status(201).json({ id: m.id, type, mime: m.mime, name: m.name, size: m.size, url: `/uploads/${path.basename(m.path)}`, waMediaId: waId });
}));

/* ---------------- broadcasts ---------------- */
/* Campaigns reach every lead in the institution, so a counsellor who may only see their own leads cannot run them */
const broadcaster = (req, res, next) => isCounsellorScoped(req) ? next(new HttpError(403, 'Only admins can send broadcasts')) : next();
r.post('/broadcasts/audience', broadcaster, wrap(async (req, res) => res.json(await CRM.audience(T(req), req.body || {}))));
r.get('/broadcasts', wrap(async (req, res) => {
  const ids = await many(`SELECT id FROM broadcasts WHERE tenant_id=$1 ORDER BY coalesce(sent_at, scheduled_at, created_at) DESC LIMIT 100`, [T(req).id]);
  res.json(await Promise.all(ids.map(x => CRM.broadcastOut(x.id))));
}));
r.post('/broadcasts', requireRole('admin', 'counsellor'), broadcaster, wrap(async (req, res) => {
  const t = T(req); const b = req.body || {}; if (!b.name || !b.template) throw new HttpError(400, 'Name and template are required');
  const seg = b.segment || {}; const aud = await CRM.audience(t, seg);
  let creative = null;
  if (b.creative && isUuid(b.creative.mediaId)) { const m = await one(`SELECT * FROM media WHERE id=$1 AND tenant_id=$2`, [b.creative.mediaId, t.id]); if (m) creative = { mediaId: m.id, type: m.type, name: m.name, url: `/uploads/${path.basename(m.path)}` }; }
  const sched = b.scheduleAt ? new Date(b.scheduleAt) : null;
  const row = await one(`INSERT INTO broadcasts(tenant_id, name, template, segment, audience_label, creative, status, scheduled_at, audience, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [t.id, b.name, b.template, seg, b.audienceLabel || '', creative, sched ? 'Scheduled' : 'Draft', sched, aud.count, req.user.id]);
  res.status(201).json(await CRM.broadcastOut(row.id));
}));
r.get('/broadcasts/:id/failed', broadcaster, wrap(async (req, res) => {
  const rows = await many(`SELECT r.lead_id, r.error, r.attempts, r.status, l.parent, l.student, l.phone FROM broadcast_recipients r JOIN leads l ON l.id=r.lead_id
    WHERE r.broadcast_id=$1 AND r.tenant_id=$2 AND (r.status='failed' OR (r.status='queued' AND r.attempts > 0)) ORDER BY r.status, l.parent LIMIT 1000`, [req.params.id, T(req).id]);
  res.json(rows.map(x => ({ leadId: x.lead_id, parent: x.parent, student: x.student, phone: x.phone, error: x.error, attempts: x.attempts, retrying: x.status === 'queued' })));
}));
r.post('/broadcasts/:id/retry-failed', broadcaster, wrap(async (req, res) => {
  const b = await one(`SELECT id FROM broadcasts WHERE id=$1 AND tenant_id=$2`, [req.params.id, T(req).id]); if (!b) throw new HttpError(404, 'Broadcast not found');
  const r2 = await q(`UPDATE broadcast_recipients r SET status='queued', attempts=0, next_attempt_at=NULL, error=NULL FROM leads l
    WHERE l.id=r.lead_id AND r.broadcast_id=$1 AND r.status='failed' AND NOT l.opted_out`, [b.id]);
  if (r2.rowCount) await q(`UPDATE broadcasts SET status='Sending' WHERE id=$1`, [b.id]);
  res.json(Object.assign(await CRM.broadcastOut(b.id), { requeued: r2.rowCount }));
}));
r.post('/broadcasts/:id/send', broadcaster, wrap(async (req, res) => res.json(await CRM.startBroadcast(T(req), req.params.id))));

/* ---------------- reports ---------------- */
r.get('/reports/overview', wrap(async (req, res) => {
  const t = T(req); const s = CRM.settingsOf(t);
  const days = { '7d': 7, '30d': 30, '90d': 90 }[req.query.range] || 30; const now = Date.now();
  const from = new Date(now - days * 864e5), prevFrom = new Date(now - 2 * days * 864e5);
  const leads = await many(`SELECT id, created_at, stage, source, program, counsellor_id, ai_temp FROM leads WHERE tenant_id=$1 AND created_at >= $2`, [t.id, prevFrom]);
  const inR = leads.filter(l => l.created_at >= from), prevR = leads.filter(l => l.created_at < from);
  const reached = (l, st) => l.stage !== 'lost' ? STAGES.indexOf(l.stage) >= STAGES.indexOf(st) : st === 'new' || st === 'contacted';
  const funnel = ['new', 'contacted', 'counselling', 'visit', 'application', 'admitted'].map(st => ({ stage: st, label: STAGE_LABEL[st], count: inR.filter(l => reached(l, st)).length }));
  const series = []; for (let d = days - 1; d >= 0; d--) {
    const start = new Date(now - d * 864e5); start.setHours(0, 0, 0, 0); const end = start.getTime() + 864e5;
    const ls = inR.filter(l => l.created_at >= start && l.created_at.getTime() < end); series.push({ date: start.toISOString(), total: ls.length, hot: ls.filter(l => l.ai_temp === 'hot').length });
  }
  const spend = src => Math.round((+((s.spend || {})[src]) || 0) * days / 30);
  const bySource = SOURCES.map(src => { const ls = inR.filter(l => l.source === src); const adm = ls.filter(l => l.stage === 'admitted').length; const sp = spend(src); return { source: src, leads: ls.length, hot: ls.filter(l => l.ai_temp === 'hot').length, admitted: adm, spend: sp, cpl: ls.length && sp ? Math.round(sp / ls.length) : 0, cpa: adm && sp ? Math.round(sp / adm) : 0 }; });
  const byProgram = s.programs.map(pr => { const ls = inR.filter(l => l.program === pr); return { program: pr, leads: ls.length, admitted: ls.filter(l => l.stage === 'admitted').length }; });
  const users = await many(`SELECT id, name, color FROM users WHERE tenant_id=$1 AND active ORDER BY name`, [t.id]);
  const fr = await many(`SELECT l.counsellor_id, avg(extract(epoch FROM (fm.at - l.created_at))/60) AS mins FROM leads l
    JOIN LATERAL (SELECT min(created_at) AS at FROM messages WHERE lead_id=l.id AND sender='agent') fm ON fm.at IS NOT NULL WHERE l.tenant_id=$1 AND l.created_at >= $2 GROUP BY 1`, [t.id, from]);
  const fus = await many(`SELECT owner_id, count(*) FILTER (WHERE done)::int AS done, count(*) FILTER (WHERE NOT done AND due_at < now())::int AS overdue FROM followups WHERE tenant_id=$1 GROUP BY 1`, [t.id]);
  const counsellors = users.map(u => { const ls = inR.filter(l => l.counsellor_id === u.id); const adm = ls.filter(l => l.stage === 'admitted').length; const f = fus.find(x => x.owner_id === u.id) || {}; const r1 = fr.find(x => x.counsellor_id === u.id);
    return { id: u.id, name: u.name, initials: initials(u.name), color: u.color, leads: ls.length, hot: ls.filter(l => l.ai_temp === 'hot').length, visits: ls.filter(l => reached(l, 'visit')).length, admitted: adm, conv: ls.length ? adm / ls.length : 0, followupsDone: f.done || 0, overdue: f.overdue || 0, firstResponse: r1 ? Math.round(r1.mins) : '—' }; });
  const temp = { hot: inR.filter(l => l.ai_temp === 'hot').length, warm: inR.filter(l => l.ai_temp === 'warm').length, cold: inR.filter(l => l.ai_temp === 'cold').length };
  const admitted = inR.filter(l => l.stage === 'admitted').length;
  const mc = await one(`SELECT count(*) FILTER (WHERE sender <> 'lead')::int AS outbound, count(*) FILTER (WHERE sender='lead')::int AS inbound FROM messages WHERE tenant_id=$1 AND created_at >= $2`, [t.id, from]);
  const bot = await one(`SELECT avg(extract(epoch FROM (fm.at - l.created_at))) AS secs FROM leads l JOIN LATERAL (SELECT min(created_at) AS at FROM messages WHERE lead_id=l.id AND sender <> 'lead') fm ON fm.at IS NOT NULL WHERE l.tenant_id=$1 AND l.created_at >= $2`, [t.id, from]);
  const bcs = await many(`SELECT id FROM broadcasts WHERE tenant_id=$1 AND status='Completed' AND sent_at >= $2 ORDER BY sent_at DESC LIMIT 20`, [t.id, from]);
  const bOut = await Promise.all(bcs.map(x => CRM.broadcastOut(x.id)));
  res.json({ range: req.query.range || '30d', days,
    kpis: { leads: inR.length, leadsPrev: prevR.length, admitted, admittedPrev: prevR.filter(l => l.stage === 'admitted').length, conversion: inR.length ? admitted / inR.length : 0, hot: temp.hot, replyRate: mc.outbound ? Math.min(1, mc.inbound / mc.outbound) : 0, botFirstResponseSec: bot.secs != null ? Math.round(bot.secs) : 0, spend: bySource.reduce((a, x) => a + x.spend, 0) },
    series, funnel, bySource, byProgram, counsellors, temp, whatsapp: { outbound: mc.outbound, inbound: mc.inbound, broadcasts: bOut.map(b => ({ name: b.name, ...b.stats })) } });
}));

/* ---------------- AI ---------------- */
r.post('/ai/classify', aiLimit, wrap(async (req, res) => res.json(await AI.classify(String((req.body || {}).text || '').slice(0, 4000), { institution: T(req).name }))));
r.get('/ai/config', wrap(async (req, res) => res.json(Object.assign({}, AI.cfgOf(T(req)), { engine: AI.engineInfo() }))));
r.put('/ai/config', requireRole('admin'), wrap(async (req, res) => {
  const b = req.body || {}; const cfg = AI.cfgOf(T(req));
  if (b.weights) for (const k in cfg.weights) if (b.weights[k] !== undefined) cfg.weights[k] = Math.max(0, Math.min(2, +b.weights[k]));
  if (b.thresholds) { cfg.thresholds.hot = Math.max(1, Math.min(100, +b.thresholds.hot || 70)); cfg.thresholds.warm = Math.max(0, Math.min(cfg.thresholds.hot - 1, +b.thresholds.warm || 40)); }
  if (typeof b.autoQualifyOnReply === 'boolean') cfg.autoQualifyOnReply = b.autoQualifyOnReply;
  if (typeof b.autoAssignHot === 'boolean') cfg.autoAssignHot = b.autoAssignHot;
  if (typeof b.useLLM === 'boolean') cfg.useLLM = b.useLLM;
  await q(`UPDATE tenants SET ai_config=$2 WHERE id=$1`, [T(req).id, cfg]);
  res.json(Object.assign({}, cfg, { engine: AI.engineInfo() }));
}));

module.exports = { router: r, syncTemplates };
