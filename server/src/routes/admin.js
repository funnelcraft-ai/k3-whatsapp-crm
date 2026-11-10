/* Institution settings, team management and platform (super admin) */
const express = require('express');
const { config, q, one, many, encrypt, decrypt, COLORS, DEFAULT_PROGRAMS, HttpError, wrap, tx } = require('../core');
const { requireRole, requireTenant, tokenFor, revokeSessions, userOut, hash, requirePassword } = require('../auth');
const { audit, list: auditList } = require('../services/audit');
const crypto = require('crypto');
const CRM = require('../services/crm');
const WA = require('../services/whatsapp');
const { SEQUENCES } = require('../services/defaults');
const AI = require('../services/ai');

/* ---------------- tenant creation (used by platform API + CLI) ---------------- */
async function createTenant(d, { devSeed = false } = {}) {
  if (!d.name) throw new HttpError(400, 'Institution name is required');
  if (!d.admin || !d.admin.email || !d.admin.password) throw new HttpError(400, 'Admin email and password are required');
  const email = String(d.admin.email).trim().toLowerCase();
  if (!(devSeed && !config.isProduction)) requirePassword(d.admin.password, email);   // devSeed: the local-development demo login only, never on a production server
  if (await one(`SELECT 1 FROM users WHERE lower(email)=$1`, [email])) throw new HttpError(409, 'A user with this email already exists');
  const pw = await hash(d.admin.password);
  return tx(async c => {
    const trialEnd = +d.trialDays > 0 ? new Date(Date.now() + +d.trialDays * 864e5) : null;
    const t = (await c.query(`INSERT INTO tenants(name, type, city, session, plan, max_users, max_contacts, plan_expires_at, settings, ai_config, billing_status, trial_ends_at, billing_email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [d.name, d.type || 'School', d.city || '', d.session || '', trialEnd ? 'Trial' : d.plan || 'Starter', +d.maxUsers || 5, +d.maxContacts || 5000, trialEnd || d.planExpiresAt || null,
        { programs: d.programs && d.programs.length ? d.programs : DEFAULT_PROGRAMS, spend: {}, deadlineText: '30 November', applyLink: '', welcomeTemplate: 'welcome_enquiry', counsellorSeesAll: false, countryCode: config.defaultCountryCode }, AI.DEFAULT_CONFIG, trialEnd ? 'trial' : 'manual', trialEnd, String(d.admin.email).trim().toLowerCase()])).rows[0];
    await c.query(`INSERT INTO users(tenant_id, name, email, password_hash, role, color) VALUES ($1,$2,$3,$4,'admin',$5)`, [t.id, d.admin.name || 'Admin', email, pw, COLORS[0]]);
    for (const s of SEQUENCES) await c.query(`INSERT INTO sequences(tenant_id, name, trigger, active, color, steps) VALUES ($1,$2,$3,false,$4,$5)`, [t.id, s.name, s.trigger, s.color, JSON.stringify(s.steps)]);
    return t;
  });
}

/* ---------------- institution settings (admin) ---------------- */
const settings = express.Router();
settings.use(requireTenant, requireRole('admin'));
function settingsOut(t) {
  const s = CRM.settingsOf(t);
  return {
    institution: { name: t.name, type: t.type, city: t.city, session: t.session, plan: t.plan, maxUsers: t.max_users, maxContacts: t.max_contacts, planExpiresAt: t.plan_expires_at },
    settings: s,
    security: { supportAccess: t.support_access !== false },
    whatsapp: { phoneNumberId: t.wa_phone_number_id || '', wabaId: t.wa_waba_id || '', displayNumber: t.wa_display_number, appId: t.meta_app_id || '', hasAccessToken: !!t.wa_access_token_enc, hasAppSecret: !!t.wa_app_secret_enc,
      webhookUrl: `${config.publicUrl}/webhooks/whatsapp/${t.webhook_key}`, verifyToken: t.wa_verify_token },
    embeddedSignup: { enabled: WA.esEnabled(), appId: WA.esConfig().appId, configId: WA.esConfig().configId, solutionId: WA.esConfig().solutionId, graphVersion: config.graphVersion },
    leadSources: { metaPageId: t.meta_page_id || '', hasPageToken: !!t.meta_page_token_enc, googleLeadKey: t.google_lead_key || '',
      websiteWebhook: `${config.publicUrl}/hooks/leads/${t.webhook_key}`, googleWebhook: `${config.publicUrl}/hooks/google-ads/${t.webhook_key}`,
      metaWebhook: `${config.publicUrl}/webhooks/whatsapp/${t.webhook_key}` },
  };
}
settings.get('/', (req, res) => res.json(settingsOut(req.tenant)));
settings.put('/', wrap(async (req, res) => {
  const t = req.tenant; const b = req.body || {}; const set = {};
  if (b.institution) for (const [k, col] of [['name', 'name'], ['type', 'type'], ['city', 'city'], ['session', 'session']]) if (typeof b.institution[k] === 'string' && b.institution[k].trim()) set[col] = b.institution[k].trim();
  if (b.settings) {
    const s = CRM.settingsOf(t); const n = b.settings;
    if (Array.isArray(n.programs)) s.programs = n.programs.map(x => String(x).trim()).filter(Boolean).slice(0, 100);
    if (n.spend && typeof n.spend === 'object') s.spend = Object.fromEntries(Object.entries(n.spend).map(([k, v]) => [k, Math.max(0, +v || 0)]));
    for (const k of ['deadlineText', 'applyLink', 'welcomeTemplate', 'countryCode']) if (typeof n[k] === 'string') s[k] = n[k].trim();
    if (typeof n.counsellorSeesAll === 'boolean') s.counsellorSeesAll = n.counsellorSeesAll;
    set.settings = s;
  }
  if (b.whatsapp) {
    const w = b.whatsapp;
    if (typeof w.phoneNumberId === 'string') set.wa_phone_number_id = w.phoneNumberId.trim() || null;
    if (typeof w.wabaId === 'string') set.wa_waba_id = w.wabaId.trim() || null;
    if (typeof w.displayNumber === 'string') set.wa_display_number = w.displayNumber.trim();
    if (typeof w.appId === 'string') set.meta_app_id = w.appId.trim() || null;
    if (w.accessToken) set.wa_access_token_enc = encrypt(w.accessToken.trim());
    if (w.appSecret) set.wa_app_secret_enc = encrypt(w.appSecret.trim());
    if (set.wa_phone_number_id) { const other = await one(`SELECT 1 FROM tenants WHERE wa_phone_number_id=$1 AND id<>$2`, [set.wa_phone_number_id, t.id]); if (other) throw new HttpError(409, 'This phone number ID is already connected to another institution'); }
  }
  if (b.leadSources) {
    const l = b.leadSources;
    if (typeof l.metaPageId === 'string') set.meta_page_id = l.metaPageId.trim() || null;
    if (l.metaPageToken) set.meta_page_token_enc = encrypt(l.metaPageToken.trim());
    if (typeof l.googleLeadKey === 'string') set.google_lead_key = l.googleLeadKey.trim() || null;
  }
  if (b.security && typeof b.security.supportAccess === 'boolean') set.support_access = b.security.supportAccess;
  if (Object.keys(set).length) {
    await q(`UPDATE tenants SET ${Object.keys(set).map((k, i) => `${k}=$${i + 2}`).join(', ')} WHERE id=$1`, [t.id, ...Object.values(set)]);
    const sensitive = Object.keys(set).filter(k => /^(wa_|meta_|google_|support_access)/.test(k));   // names only — never the secret values
    if (sensitive.length) await audit(req, { action: 'settings.integration_changed', detail: { fields: sensitive, supportAccess: set.support_access } });
  }
  res.json(settingsOut(await one(`SELECT * FROM tenants WHERE id=$1`, [t.id])));
}));
settings.get('/audit', wrap(async (req, res) => res.json(await auditList({ tenantId: req.tenant.id, limit: req.query.limit, before: req.query.before, support: req.query.support === '1' }))));
settings.post('/whatsapp/test', wrap(async (req, res) => {
  const info = await WA.testConnection(req.tenant);
  if (info.display_phone_number && !req.tenant.wa_display_number) await q(`UPDATE tenants SET wa_display_number=$2 WHERE id=$1`, [req.tenant.id, info.display_phone_number]);
  res.json({ ok: true, info });
}));
settings.post('/whatsapp/embedded', wrap(async (req, res) => {
  const t = req.tenant; const b = req.body || {};
  const other = await one(`SELECT name FROM tenants WHERE wa_phone_number_id=$1 AND id<>$2`, [b.phoneNumberId, t.id]);
  if (other) throw new HttpError(409, 'This WhatsApp number is already connected to another institution.');
  const r = await WA.embeddedSignup({ code: b.code, phoneNumberId: b.phoneNumberId, wabaId: b.wabaId });
  await q(`UPDATE tenants SET wa_phone_number_id=$2, wa_waba_id=$3, wa_access_token_enc=$4, wa_display_number=COALESCE(NULLIF($5,''), wa_display_number), meta_app_id=$6, wa_app_secret_enc=NULL, wa_pin_enc=$7 WHERE id=$1`,
    [t.id, String(b.phoneNumberId), String(b.wabaId), encrypt(r.token), r.info.display_phone_number || '', WA.esConfig().appId, encrypt(r.pin)]);
  const fresh = await one(`SELECT * FROM tenants WHERE id=$1`, [t.id]);
  let synced = 0; try { synced = await require('./api').syncTemplates(fresh); } catch (e) { r.warnings.push('Template sync: ' + e.message); }
  res.json(Object.assign(settingsOut(fresh), { connected: true, verifiedName: r.info.verified_name || '', templatesSynced: synced, warnings: r.warnings }));
}));
settings.post('/rotate-webhook-key', wrap(async (req, res) => {
  const t = await one(`UPDATE tenants SET webhook_key=encode(gen_random_bytes(12),'hex'), wa_verify_token=encode(gen_random_bytes(12),'hex') WHERE id=$1 RETURNING *`, [req.tenant.id]);
  await audit(req, { action: 'settings.webhook_key_rotated' });
  res.json(settingsOut(t));
}));

/* ---------------- team ---------------- */
const team = express.Router();
team.use(requireTenant);
team.get('/', wrap(async (req, res) => res.json((await many(`SELECT * FROM users WHERE tenant_id=$1 ORDER BY role, name`, [req.tenant.id])).map(userOut))));
team.post('/', requireRole('admin'), wrap(async (req, res) => {
  const b = req.body || {}; const t = req.tenant;
  const n = await one(`SELECT count(*)::int AS n FROM users WHERE tenant_id=$1 AND active`, [t.id]);
  if (n.n >= t.max_users) throw new HttpError(402, `User limit reached for your plan (${t.max_users}). Contact K3 Solutions to add more seats.`);
  const email = String(b.email || '').trim().toLowerCase(); if (!email || !b.name) throw new HttpError(400, 'Name and email are required');
  requirePassword(b.password, email);
  if (await one(`SELECT 1 FROM users WHERE lower(email)=$1`, [email])) throw new HttpError(409, 'A user with this email already exists');
  const u = await one(`INSERT INTO users(tenant_id, name, email, password_hash, role, phone, color) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [t.id, b.name, email, await hash(b.password), b.role === 'admin' ? 'admin' : 'counsellor', b.phone || '', COLORS[(n.n + 1) % COLORS.length]]);
  await audit(req, { action: 'team.user_added', target: email, detail: { role: u.role } });
  res.status(201).json(userOut(u));
}));
team.patch('/:id', requireRole('admin'), wrap(async (req, res) => {
  const u = await one(`SELECT * FROM users WHERE id=$1 AND tenant_id=$2`, [req.params.id, req.tenant.id]); if (!u) throw new HttpError(404, 'User not found');
  const b = req.body || {}; const set = {};
  if (b.name) set.name = b.name; if (typeof b.phone === 'string') set.phone = b.phone;
  if (b.role && ['admin', 'counsellor'].includes(b.role)) set.role = b.role;
  if (typeof b.active === 'boolean') { if (u.id === req.user.id && !b.active) throw new HttpError(400, 'You can’t deactivate yourself'); set.active = b.active; }
  if (b.password) { requirePassword(b.password, u.email); set.password_hash = await hash(b.password); }
  if (set.role === 'counsellor' && u.role === 'admin') { const a = await one(`SELECT count(*)::int AS n FROM users WHERE tenant_id=$1 AND role='admin' AND active`, [req.tenant.id]); if (a.n <= 1) throw new HttpError(400, 'At least one admin is required'); }
  const out = Object.keys(set).length ? await one(`UPDATE users SET ${Object.keys(set).map((k, i) => `${k}=$${i + 2}`).join(', ')} WHERE id=$1 RETURNING *`, [u.id, ...Object.values(set)]) : u;
  if (set.password_hash || set.active === false || (set.role && set.role !== u.role)) await revokeSessions(u.id);   // sign them out everywhere so the change takes effect now
  if (Object.keys(set).length) await audit(req, { action: set.password_hash ? 'team.password_reset' : set.active === false ? 'team.user_deactivated' : set.role && set.role !== u.role ? 'team.role_changed' : 'team.user_updated', target: u.email, detail: { fields: Object.keys(set).map(k => k === 'password_hash' ? 'password' : k), role: set.role } });
  if (set.active === false) await q(`UPDATE leads SET counsellor_id=NULL WHERE counsellor_id=$1 AND stage NOT IN ('admitted','lost')`, [u.id]);
  res.json(userOut(out));
}));

/* ---------------- platform (super admin) ---------------- */
const platform = express.Router();
platform.use(requireRole('super_admin'));
platform.get('/tenants', wrap(async (req, res) => {
  const rows = await many(`SELECT t.*, (SELECT count(*) FROM users u WHERE u.tenant_id=t.id AND u.active)::int AS users,
      (SELECT count(*) FROM leads l WHERE l.tenant_id=t.id)::int AS leads,
      (SELECT count(*) FROM messages m WHERE m.tenant_id=t.id AND m.sender <> 'lead' AND m.created_at > date_trunc('month', now()))::int AS msgs_month,
      (SELECT email FROM users u WHERE u.tenant_id=t.id AND u.role='admin' ORDER BY created_at LIMIT 1) AS admin_email
    FROM tenants t ORDER BY t.created_at DESC`);
  res.json(rows.map(t => ({ billingStatus: t.billing_status, paidUntil: t.current_period_end, trialEndsAt: t.trial_ends_at, id: t.id, name: t.name, type: t.type, city: t.city, plan: t.plan, status: t.status, maxUsers: t.max_users, maxContacts: t.max_contacts, planExpiresAt: t.plan_expires_at, users: t.users, leads: t.leads, messagesThisMonth: t.msgs_month, adminEmail: t.admin_email, whatsappConnected: !!(t.wa_phone_number_id && t.wa_access_token_enc), createdAt: t.created_at })));
}));
platform.post('/tenants', wrap(async (req, res) => { const t = await createTenant(req.body || {}); await audit(req, { tenantId: t.id, action: 'platform.tenant_created', target: t.name, detail: { plan: t.plan } }); res.status(201).json({ id: t.id, name: t.name }); }));
platform.patch('/tenants/:id', wrap(async (req, res) => {
  const b = req.body || {}; const set = {};
  if (b.status && ['active', 'suspended'].includes(b.status)) set.status = b.status;
  if (b.plan) set.plan = b.plan; if (b.maxUsers) set.max_users = +b.maxUsers; if (b.maxContacts) set.max_contacts = +b.maxContacts;
  if (b.planExpiresAt !== undefined) set.plan_expires_at = b.planExpiresAt || null; if (b.name) set.name = b.name;
  const t = await one(`UPDATE tenants SET ${Object.keys(set).map((k, i) => `${k}=$${i + 2}`).join(', ') || 'name=name'} WHERE id=$1 RETURNING id, name, status, plan`, [req.params.id, ...Object.values(set)]);
  if (!t) throw new HttpError(404, 'Institution not found');
  await audit(req, { tenantId: t.id, action: 'platform.tenant_updated', target: t.name, detail: { fields: Object.keys(set), status: set.status, plan: set.plan } });
  res.json(t);
}));
const Billing = require('../services/billing');
platform.get('/plans', wrap(async (req, res) => res.json((await many(`SELECT * FROM plans ORDER BY sort, price_paise`)).map(Billing.planOut))));
const planFields = b => ({ name: b.name, description: b.description || '', billing: ['monthly', 'yearly', 'one_time'].includes(b.billing) ? b.billing : 'monthly', price_paise: Math.round(+b.pricePaise || 0), gst_percent: b.gstPercent == null ? 18 : +b.gstPercent, max_users: +b.maxUsers || 5, max_contacts: +b.maxContacts || 5000, features: JSON.stringify(Array.isArray(b.features) ? b.features.map(String).slice(0, 20) : []), active: b.active !== false, sort: +b.sort || 0 });
platform.post('/plans', wrap(async (req, res) => {
  const f = planFields(req.body || {}); if (!f.name || !f.price_paise) throw new HttpError(400, 'Name and price are required');
  const code = (String(req.body.code || f.name).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + f.billing).slice(0, 60) + '-' + Date.now().toString(36);
  const p = await one(`INSERT INTO plans(code, name, description, billing, price_paise, gst_percent, max_users, max_contacts, features, active, sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, [code, f.name, f.description, f.billing, f.price_paise, f.gst_percent, f.max_users, f.max_contacts, f.features, f.active, f.sort]);
  await audit(req, { tenantId: null, action: 'platform.plan_created', target: p.name });
  res.status(201).json(Billing.planOut(p));
}));
platform.patch('/plans/:id', wrap(async (req, res) => {
  const cur = await one(`SELECT * FROM plans WHERE id=$1`, [req.params.id]); if (!cur) throw new HttpError(404, 'Plan not found');
  const f = planFields(Object.assign(Billing.planOut(cur), req.body || {}));
  const priceChanged = f.price_paise !== cur.price_paise || f.gst_percent !== +cur.gst_percent || f.billing !== cur.billing;
  const p = await one(`UPDATE plans SET name=$2, description=$3, billing=$4, price_paise=$5, gst_percent=$6, max_users=$7, max_contacts=$8, features=$9, active=$10, sort=$11, razorpay_plan_id=CASE WHEN $12 THEN NULL ELSE razorpay_plan_id END WHERE id=$1 RETURNING *`,
    [cur.id, f.name, f.description, f.billing, f.price_paise, f.gst_percent, f.max_users, f.max_contacts, f.features, f.active, f.sort, priceChanged]);
  await audit(req, { tenantId: null, action: 'platform.plan_updated', target: p.name, detail: { priceChanged } });
  res.json(Billing.planOut(p));
}));
platform.get('/payments', wrap(async (req, res) => {
  const rows = await many(`SELECT p.*, t.name AS tenant_name FROM payments p JOIN tenants t ON t.id=p.tenant_id ORDER BY p.created_at DESC LIMIT 500`);
  res.json(rows.map(p => Object.assign(Billing.paymentOut(p), { tenantName: p.tenant_name, tenantId: p.tenant_id })));
}));
platform.get('/payments/:id/invoice', wrap(async (req, res) => res.type('html').send(await Billing.invoiceHTML(req.params.id))));
platform.get('/company', wrap(async (req, res) => res.json(Object.assign(await Billing.company(), { razorpay: { enabled: Billing.enabled(), keyId: process.env.RAZORPAY_KEY_ID || '', webhookUrl: `${config.publicUrl}/webhooks/razorpay`, webhookSecretSet: !!process.env.RAZORPAY_WEBHOOK_SECRET }, embeddedSignup: { enabled: !!(process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_ES_CONFIG_ID), webhookUrl: `${config.publicUrl}/webhooks/whatsapp`, verifyTokenSet: !!process.env.META_VERIFY_TOKEN } }))));
platform.put('/company', wrap(async (req, res) => {
  const b = req.body || {}; const v = {}; for (const k of ['name', 'address', 'gstin', 'email', 'phone', 'invoicePrefix', 'state']) if (typeof b[k] === 'string') v[k] = b[k].trim();
  await q(`INSERT INTO platform_settings(key, value) VALUES ('company', $1) ON CONFLICT (key) DO UPDATE SET value = platform_settings.value || $1`, [v]);
  await audit(req, { tenantId: null, action: 'platform.company_updated', detail: { fields: Object.keys(v) } });
  res.json(await Billing.company());
}));
const Backup = require('../services/backup');
platform.get('/backups', wrap(async (req, res) => res.json(await Backup.list())));
platform.post('/backups', wrap(async (req, res) => { const r = await Backup.create(); await audit(req, { tenantId: null, action: 'platform.backup_created', target: r.name }); res.json(r); }));
platform.get('/backups/:name', wrap(async (req, res) => {
  const s = await Backup.openStream(req.params.name);
  await audit(req, { tenantId: null, action: 'platform.backup_downloaded', target: require('path').basename(req.params.name) });
  res.set({ 'Content-Type': 'application/gzip', 'Content-Disposition': `attachment; filename="${require('path').basename(req.params.name)}"` });
  s.pipe(res);
}));
platform.post('/demo', wrap(async (req, res) => {
  const b = req.body || {}; const email = String(b.email || `demo${Date.now().toString(36)}@k3solutions.in`).toLowerCase();
  const pw = b.password ? String(b.password) : 'Dm-' + crypto.randomBytes(8).toString('hex') + '-9x';   // never a shared default — demo logins are real logins on a live server
  requirePassword(pw, email);
  const r = await require('../services/demo').seedDemo(email, pw);
  await audit(req, { tenantId: r.tenant.id, action: 'platform.demo_created', target: r.tenant.name });
  res.status(201).json({ id: r.tenant.id, name: r.tenant.name, email: r.email, password: r.password, counsellors: r.counsellors });
}));
/* Support session ("master key"): a platform admin acts as the institution's admin. Always logged and visible to that institution;
   the institution can switch it off (Settings → Security); optional read-only mode; expires after 2 hours. */
platform.post('/tenants/:id/impersonate', wrap(async (req, res) => {
  const t = await one(`SELECT id, name, support_access FROM tenants WHERE id=$1`, [req.params.id]); if (!t) throw new HttpError(404, 'Institution not found');
  if (t.support_access === false) throw new HttpError(403, 'This institution has switched off K3 support access. Ask their admin to turn it on in Settings → Security.');
  const b = req.body || {}; const readOnly = b.readOnly === true; const reason = String(b.reason || '').trim().slice(0, 300);
  await audit(req, { tenantId: t.id, action: 'support.start', target: t.name, support: true, detail: { reason: reason || 'support', readOnly } });
  res.json({ token: tokenFor(req.user, { tid: t.id, imp: true, ro: readOnly || undefined }), tenant: { id: t.id, name: t.name }, readOnly });
}));
platform.get('/audit', wrap(async (req, res) => res.json(await auditList({ tenantId: req.query.tenantId, limit: req.query.limit, before: req.query.before, support: req.query.support === '1' }))));
platform.get('/admins', wrap(async (req, res) => res.json((await many(`SELECT * FROM users WHERE role='super_admin' ORDER BY created_at`)).map(userOut))));
platform.post('/admins', wrap(async (req, res) => {
  const b = req.body || {}; const email = String(b.email || '').trim().toLowerCase();
  if (!email) throw new HttpError(400, 'Email is required');
  requirePassword(b.password, email);
  if (await one(`SELECT 1 FROM users WHERE lower(email)=$1`, [email])) throw new HttpError(409, 'A user with this email already exists');
  const u = await one(`INSERT INTO users(name, email, password_hash, role) VALUES ($1,$2,$3,'super_admin') RETURNING *`, [b.name || 'Platform admin', email, await hash(b.password)]);
  await audit(req, { tenantId: null, action: 'platform.admin_added', target: email });
  res.status(201).json(userOut(u));
}));

module.exports = { settings, team, platform, createTenant };
