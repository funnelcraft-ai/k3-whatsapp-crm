/* Authentication, sessions (JWT) and role guards */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config, one, q, HttpError, wrap, encrypt, decrypt } = require('./core');
const { failureCounter } = require('./services/ratelimit');
const { audit } = require('./services/audit');
const totp = require('./services/totp');

const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('k3-not-a-real-password', BCRYPT_COST);   // compared when the email is unknown, so timing doesn't reveal which emails exist
const hashPw = p => bcrypt.hash(String(p), BCRYPT_COST);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/* Tokens carry only identity: uid, tid (institution), tv (token version). The role is ALWAYS re-read from the database. */
const sign = (payload, ttl = '12h') => jwt.sign(payload, config.jwtSecret, { expiresIn: ttl, algorithm: 'HS256' });
const userOut = u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, color: u.color, tenantId: u.tenant_id, active: u.active, lastLoginAt: u.last_login_at, twoFactor: !!u.totp_enabled });
const tokenFor = (u, extra = {}) => sign(Object.assign({ uid: u.id, tid: u.tenant_id, tv: u.token_version || 0 }, extra), extra.imp ? '2h' : '12h');
const revokeSessions = userId => q(`UPDATE users SET token_version = token_version + 1 WHERE id=$1`, [userId]);

/* ---------------- password policy ---------------- */
const COMMON = new Set(['password', 'password1', 'password12', 'password123', 'password1234', '1234567890', '12345678910', 'qwerty12345', 'qwertyuiop1', 'welcome12345', 'letmein12345', 'iloveyou123', 'abcd123456', 'abc1234567', 'k3solutions1', 'changeme123', 'admin12345', 'administrator1']);
function passwordProblem(pw, email = '') {
  pw = String(pw || '');
  if (pw.length < 10) return 'Password must be at least 10 characters';
  if (pw.length > 128) return 'Password is too long (maximum 128 characters)';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must include both letters and numbers';
  const l = pw.toLowerCase();
  if (COMMON.has(l) || /^(.)\1+$/.test(pw)) return 'That password is too easy to guess — choose a different one';
  const local = String(email || '').split('@')[0].toLowerCase();
  if (local.length >= 4 && l.includes(local)) return 'Password must not contain your email name';
  return null;
}
const requirePassword = (pw, email) => { const p = passwordProblem(pw, email); if (p) throw new HttpError(400, p); };

/* ---------------- authenticate ---------------- */
/* Attach req.user / req.tenant / req.role from a Bearer token. The ?token= form is accepted ONLY for the realtime event stream
   (EventSource cannot send headers) — never for any other route, so tokens don't leak into logs or Referer headers elsewhere. */
const isEventStream = req => req.method === 'GET' && req.originalUrl.split('?')[0] === '/api/v1/events';
const authenticate = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : (isEventStream(req) && typeof req.query.token === 'string' ? req.query.token : '');
  if (!token) throw new HttpError(401, 'Please sign in');
  let p; try { p = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }); } catch (e) { throw new HttpError(401, 'Session expired — please sign in again'); }
  const u = await one(`SELECT * FROM users WHERE id=$1`, [p.uid]);
  if (!u || !u.active) throw new HttpError(401, 'Account disabled');
  if ((p.tv || 0) !== (u.token_version || 0)) throw new HttpError(401, 'Session expired — please sign in again');
  req.user = u; req.impersonating = !!p.imp;
  if (p.imp) {                                   // support session: only a platform admin can hold one, acting as that institution's admin
    if (u.role !== 'super_admin' || !p.tid) throw new HttpError(401, 'Session expired — please sign in again');
    req.role = 'admin'; req.impReadOnly = !!p.ro;
  } else {
    if ((p.tid || null) !== (u.tenant_id || null)) throw new HttpError(401, 'Session expired — please sign in again');   // token must match the user's institution
    req.role = u.role;
  }
  if (u.tenant_id || p.tid) {
    const t = await one(`SELECT * FROM tenants WHERE id=$1`, [p.imp ? p.tid : u.tenant_id]);
    if (!t) throw new HttpError(401, 'Institution not found');
    if (t.status !== 'active' && !p.imp) throw new HttpError(403, 'This institution’s account is suspended. Please contact K3 Solutions.');
    if (t.plan_expires_at && new Date(t.plan_expires_at) < new Date() && !p.imp) req.billingLocked = true; // only Billing stays available
    if (p.imp) {
      if (t.support_access === false) throw new HttpError(403, 'This institution has switched off K3 support access.');
      if (req.impReadOnly && !SAFE_METHODS.has(req.method)) throw new HttpError(403, 'This support session is read-only.');
      if (!SAFE_METHODS.has(req.method)) res.on('finish', () => audit(req, { tenantId: t.id, action: 'support.change', target: `${req.method} ${req.originalUrl.split('?')[0]}`, detail: { status: res.statusCode } }));
    }
    req.tenant = t;
  }
  next();
});
/* blocks CRM features (not Billing) once the paid period + grace has ended */
const enforceBilling = (req, res, next) => {
  if (!req.billingLocked || req.path === '/meta' || req.path === '/events') return next();
  next(new HttpError(402, req.role === 'admin' ? 'Your subscription has ended. Renew in Settings → Billing to continue.' : 'Your institution’s subscription has ended. Please ask your admin to renew it.'));
};
const requireTenant = (req, res, next) => (req.tenant ? next() : next(new HttpError(400, 'Select an institution first')));
const requireRole = (...roles) => (req, res, next) => (roles.includes(req.role) ? next() : next(new HttpError(403, 'You don’t have permission to do this')));

/* ---------------- login lockouts ----------------
   Two independent counters, failures only: per client IP (any email) and per email (any IP, so rotating IPs doesn't help). */
const ipFails = failureCounter({ windowMs: 15 * 60e3, max: 40 });
const emailFails = failureCounter({ windowMs: 15 * 60e3, max: 10 });
const otpFails = failureCounter({ windowMs: 15 * 60e3, max: 8 });

const router = express.Router();
router.post('/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254); const password = String(req.body.password || '').slice(0, 1024); const otp = String(req.body.otp || '');
  if (ipFails.blocked(req.ip) || emailFails.blocked(email)) {
    res.set('Retry-After', String(Math.max(ipFails.retryAfter(req.ip), emailFails.retryAfter(email))));
    throw new HttpError(429, 'Too many sign-in attempts. Try again in 15 minutes.');
  }
  const u = await one(`SELECT * FROM users WHERE lower(email)=$1`, [email]);
  const okPw = await bcrypt.compare(password, u ? u.password_hash : DUMMY_HASH);
  if (!u || !u.active || !okPw) {
    ipFails.fail(req.ip); emailFails.fail(email);
    await audit(req, { tenantId: u ? u.tenant_id : null, action: 'login.failed', target: email, actor: { email }, detail: { reason: !u ? 'unknown email' : !u.active ? 'disabled' : 'wrong password' } });
    throw new HttpError(401, 'Incorrect email or password');
  }
  if (u.tenant_id) {
    const t = await one(`SELECT status FROM tenants WHERE id=$1`, [u.tenant_id]);
    if (!t || t.status !== 'active') throw new HttpError(403, 'This institution’s account is suspended. Please contact K3 Solutions.');
  }
  if (u.totp_enabled) {                                     // second factor
    if (!otp) { const e = new HttpError(401, 'Enter the 6-digit code from your authenticator app'); e.publicCode = 'otp_required'; throw e; }
    if (otpFails.blocked(u.id)) { res.set('Retry-After', String(otpFails.retryAfter(u.id))); throw new HttpError(429, 'Too many wrong codes. Try again in 15 minutes.'); }
    const step = totp.verify(decrypt(u.totp_secret_enc), otp, { lastStep: +u.totp_last_step || 0 });
    let used = false;
    if (step) await q(`UPDATE users SET totp_last_step=$2 WHERE id=$1`, [u.id, step]);
    else {                                                  // maybe a one-time recovery code
      const h = totp.hashRecovery(otp); const rec = Array.isArray(u.totp_recovery) ? u.totp_recovery : [];
      if (rec.includes(h)) { await q(`UPDATE users SET totp_recovery=$2 WHERE id=$1`, [u.id, JSON.stringify(rec.filter(x => x !== h))]); used = true; }
      else { otpFails.fail(u.id); ipFails.fail(req.ip); await audit(req, { tenantId: u.tenant_id, action: 'login.failed', target: email, actor: { id: u.id, email, role: u.role }, detail: { reason: 'wrong 2FA code' } }); throw new HttpError(401, 'That code is not correct. Try again.'); }
    }
    otpFails.reset(u.id); if (used) await audit(req, { tenantId: u.tenant_id, action: '2fa.recovery_code_used', actor: { id: u.id, email, role: u.role } });
  }
  emailFails.reset(email);
  await q(`UPDATE users SET last_login_at=now() WHERE id=$1`, [u.id]);
  if (bcrypt.getRounds(u.password_hash) < BCRYPT_COST) await q(`UPDATE users SET password_hash=$2 WHERE id=$1`, [u.id, await hashPw(password)]).catch(() => {});   // upgrade old hashes silently
  await audit(req, { tenantId: u.tenant_id, action: 'login.success', target: email, actor: { id: u.id, email, role: u.role } });
  res.json({ token: tokenFor(u), user: userOut(u) });
}));
router.get('/me', authenticate, wrap(async (req, res) => {
  res.json({ user: userOut(req.user), role: req.role, impersonating: req.impersonating, readOnly: !!req.impReadOnly, tenant: req.tenant ? { id: req.tenant.id, name: req.tenant.name, plan: req.tenant.plan, status: req.tenant.status, billingStatus: req.tenant.billing_status, accessUntil: req.tenant.plan_expires_at, billingLocked: !!req.billingLocked } : null });
}));
router.post('/password', authenticate, wrap(async (req, res) => {
  if (req.impersonating) throw new HttpError(403, 'Not available during a support session');
  const { current, next } = req.body;
  if (otpFails.blocked('pw:' + req.user.id)) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
  requirePassword(next, req.user.email);
  if (!(await bcrypt.compare(String(current || ''), req.user.password_hash))) { otpFails.fail('pw:' + req.user.id); throw new HttpError(400, 'Current password is incorrect'); }
  if (await bcrypt.compare(String(next), req.user.password_hash)) throw new HttpError(400, 'Choose a password different from the current one');
  const u = await one(`UPDATE users SET password_hash=$2, token_version=token_version+1 WHERE id=$1 RETURNING *`, [req.user.id, await hashPw(next)]);   // every other device is signed out
  await audit(req, { action: 'password.changed', target: u.email });
  res.json({ ok: true, token: tokenFor(u) });                // fresh token for this device
}));
router.post('/logout-all', authenticate, wrap(async (req, res) => {
  if (req.impersonating) throw new HttpError(403, 'Not available during a support session');
  await revokeSessions(req.user.id); await audit(req, { action: 'session.revoke_all', target: req.user.email });
  res.json({ ok: true });
}));

/* ---------------- two-factor (TOTP) ---------------- */
router.get('/2fa', authenticate, wrap(async (req, res) => res.json({ enabled: !!req.user.totp_enabled, recoveryCodesLeft: (req.user.totp_recovery || []).length })));
router.post('/2fa/setup', authenticate, wrap(async (req, res) => {
  if (req.impersonating) throw new HttpError(403, 'Not available during a support session');
  if (req.user.totp_enabled) throw new HttpError(409, 'Two-factor authentication is already on. Turn it off first to set it up again.');
  if (!(await bcrypt.compare(String(req.body.password || ''), req.user.password_hash))) throw new HttpError(400, 'Password is incorrect');
  const secret = totp.generateSecret();
  await q(`UPDATE users SET totp_secret_enc=$2, totp_enabled=false WHERE id=$1`, [req.user.id, encrypt(secret)]);
  res.json({ secret, otpauthUrl: totp.otpauthUrl(secret, req.user.email) });
}));
router.post('/2fa/enable', authenticate, wrap(async (req, res) => {
  if (req.impersonating) throw new HttpError(403, 'Not available during a support session');
  if (!req.user.totp_secret_enc) throw new HttpError(400, 'Start the setup first');
  if (req.user.totp_enabled) throw new HttpError(409, 'Two-factor authentication is already on');
  const step = totp.verify(decrypt(req.user.totp_secret_enc), req.body.code);
  if (!step) throw new HttpError(400, 'That code is not correct. Check the time on your phone and try again.');
  const codes = totp.newRecoveryCodes();
  await q(`UPDATE users SET totp_enabled=true, totp_last_step=$2, totp_recovery=$3 WHERE id=$1`, [req.user.id, step, JSON.stringify(codes.map(totp.hashRecovery))]);
  await audit(req, { action: '2fa.enabled', target: req.user.email });
  res.json({ ok: true, recoveryCodes: codes });             // shown once
}));
router.post('/2fa/disable', authenticate, wrap(async (req, res) => {
  if (req.impersonating) throw new HttpError(403, 'Not available during a support session');
  if (!req.user.totp_enabled) throw new HttpError(400, 'Two-factor authentication is not on');
  if (!(await bcrypt.compare(String(req.body.password || ''), req.user.password_hash))) throw new HttpError(400, 'Password is incorrect');
  if (!totp.verify(decrypt(req.user.totp_secret_enc), req.body.code, { lastStep: +req.user.totp_last_step || 0 })) throw new HttpError(400, 'That code is not correct');
  await q(`UPDATE users SET totp_enabled=false, totp_secret_enc=NULL, totp_recovery='[]'::jsonb, token_version=token_version+1 WHERE id=$1`, [req.user.id]);
  await audit(req, { action: '2fa.disabled', target: req.user.email });
  res.json({ ok: true });
}));

module.exports = { enforceBilling, router, authenticate, requireTenant, requireRole, sign, tokenFor, revokeSessions, userOut, passwordProblem, requirePassword, hash: hashPw, BCRYPT_COST };
