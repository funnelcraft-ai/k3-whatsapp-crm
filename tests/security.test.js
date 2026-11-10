/* Security regression tests (multi-tenant isolation, sessions, 2FA, support access, webhooks, uploads).
   Runs against a LOCAL server on :8080 with the fake Meta on :9099 — see README "Testing".
   node tests/security.test.js */
const assert = require('assert');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const BASE = process.env.BASE || 'http://localhost:8080';
const totp = require('../server/src/services/totp');
const step = n => console.log('✓', n);
const stamp = Date.now();

async function call(method, path, body, tk, extra = {}) {
  const r = await fetch(BASE + path, { method, redirect: 'manual', headers: Object.assign({ 'Content-Type': 'application/json' }, tk ? { Authorization: 'Bearer ' + tk } : {}, extra.headers || {}), body: extra.raw !== undefined ? extra.raw : body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = t; }
  return { status: r.status, body: j, headers: r.headers };
}
const ok = (r, m) => { if (r.status >= 400) throw new Error(`${m}: ${r.status} ${JSON.stringify(r.body)}`); return r.body; };
const sql = text => execFileSync('psql', [process.env.DATABASE_URL, '-tAc', text], { encoding: 'utf8' }).trim();
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');

(async () => {
  /* ---------- unit: TOTP (RFC 6238 appendix B test vector) ---------- */
  const rfcSecret = totp.b32encode(Buffer.from('12345678901234567890'));
  assert.equal(totp.code(rfcSecret, Math.floor(59 / 30)), '287082'); step('TOTP matches the RFC 6238 test vector');
  const s1 = totp.verify(rfcSecret, '287082', { now: 59 * 1000 }); assert.equal(s1, 1);
  assert.equal(totp.verify(rfcSecret, '287082', { now: 59 * 1000, lastStep: 1 }), null); step('TOTP replay of an already-used code refused');
  assert.equal(totp.verify(rfcSecret, '000000', { now: 59 * 1000 }), null);

  /* ---------- set-up: two schools + platform admin ---------- */
  const sa = ok(await call('POST', '/api/v1/auth/login', { email: 'owner@k3solutions.in', password: 'Owner@12345' }), 'super login');
  const mk = async (tag) => {
    const email = `${tag}${stamp}@secure-test.in`, pw = `Str0ng-${tag}-Pass`;
    const t = ok(await call('POST', '/api/v1/platform/tenants', { name: `Sec ${tag} ${stamp}`, type: 'School', city: 'Kolkata', plan: 'Growth', maxUsers: 5, maxContacts: 500, programs: ['Class 1'], admin: { name: tag + ' Admin', email, password: pw } }, sa.token), 'create tenant ' + tag);
    const lg = ok(await call('POST', '/api/v1/auth/login', { email, password: pw }), 'login ' + tag);
    return { id: t.id, email, pw, token: lg.token, uid: lg.user.id };
  };
  const A = await mk('alpha'), B = await mk('bravo');
  const la = ok(await call('POST', '/api/v1/leads', { student: 'A-Student', parent: 'A Parent', phone: '98300 10001', program: 'Class 1' }, A.token), 'A lead');
  const lb = ok(await call('POST', '/api/v1/leads', { student: 'B-Student', parent: 'B Parent', phone: '98300 20002', program: 'Class 1' }, B.token), 'B lead');
  step('two isolated schools created');

  /* ---------- 1. tenant isolation ---------- */
  assert.equal((await call('GET', `/api/v1/leads/${lb.id}`, null, A.token)).status, 404); step("school A cannot open school B's lead by id");
  const listA = ok(await call('GET', '/api/v1/leads', null, A.token), 'list A'); assert.ok(!listA.some(l => l.id === lb.id) && listA.some(l => l.id === la.id)); step("school A's lead list never contains B's leads");
  assert.equal((await call('PATCH', `/api/v1/leads/${lb.id}`, { stage: 'lost' }, A.token)).status, 404); step("school A cannot edit B's lead");
  assert.equal((await call('POST', `/api/v1/leads/${lb.id}/notes`, { text: 'x' }, A.token)).status, 404); step("school A cannot write notes on B's lead");
  assert.equal((await call('PATCH', `/api/v1/team/${B.uid}`, { name: 'hijack' }, A.token)).status, 404); step("school A cannot edit B's team members");
  const r1 = await call('POST', '/api/v1/followups', { leadId: la.id, due: new Date(Date.now() + 36e5).toISOString(), owner: B.uid }, A.token); assert.equal(r1.status, 400); step("a task cannot be assigned to another school's user");
  const l3 = ok(await call('POST', '/api/v1/leads', { student: 'Inj', parent: 'Inj', phone: '98300 30003', program: 'Class 1', counsellorId: B.uid }, A.token), 'lead with foreign counsellor');
  assert.notEqual(l3.counsellorId, B.uid); step("a lead cannot be assigned to another school's counsellor");
  assert.equal((await call('GET', '/api/v1/leads?q=' + encodeURIComponent('%'), null, A.token)).status, 200);
  const pct = ok(await call('GET', '/api/v1/leads?q=' + encodeURIComponent('%'), null, A.token), 'pct'); assert.equal(pct.length, 0); step('search treats % and _ literally');

  /* ---------- 2. tokens ---------- */
  const [h, p, sig] = A.token.split('.');
  const pay = JSON.parse(Buffer.from(p, 'base64url').toString()); assert.equal(pay.tid, A.id);
  const forged = [b64({ alg: 'none', typ: 'JWT' }) + '.' + b64(Object.assign({}, pay, { tid: B.id })) + '.', h + '.' + b64(Object.assign({}, pay, { tid: B.id })) + '.' + sig];
  for (const f of forged) assert.equal((await call('GET', '/api/v1/leads', null, f)).status, 401);
  step('forged / alg=none / tenant-swapped tokens rejected');
  assert.equal((await call('GET', `/api/v1/leads?token=${A.token}`, null, null)).status, 401); step('?token= is not accepted on normal endpoints');
  const ac = new AbortController(); const ev = await fetch(`${BASE}/api/v1/events?token=${A.token}`, { signal: ac.signal }); assert.equal(ev.status, 200); ac.abort(); step('?token= still works for the live-update stream only');

  /* ---------- 3. role comes from the database, sessions can be revoked ---------- */
  const co = ok(await call('POST', '/api/v1/team', { name: 'Couns', email: `couns${stamp}@secure-test.in`, password: 'Cou-n5elor-Pass', role: 'counsellor' }, A.token), 'add counsellor');
  const cl = ok(await call('POST', '/api/v1/auth/login', { email: `couns${stamp}@secure-test.in`, password: 'Cou-n5elor-Pass' }), 'counsellor login');
  assert.equal((await call('GET', '/api/v1/team', null, cl.token)).status, 200);   // team list readable
  assert.equal((await call('POST', '/api/v1/team', { name: 'x', email: 'x@x.in', password: 'Zz-123456789' }, cl.token)).status, 403); step('counsellor cannot add team members');
  assert.equal((await call('POST', '/api/v1/broadcasts/audience', {}, cl.token)).status, 403); step('counsellor cannot build or send broadcasts');
  ok(await call('PATCH', `/api/v1/team/${co.id}`, { active: false }, A.token), 'deactivate');
  assert.equal((await call('GET', '/api/v1/leads', null, cl.token)).status, 401); step('deactivated user is signed out immediately');
  ok(await call('PATCH', `/api/v1/team/${co.id}`, { active: true }, A.token), 'reactivate');
  const old = A.token;
  const chg = ok(await call('POST', '/api/v1/auth/password', { current: A.pw, next: 'N3w-Strong-Pass-A' }, A.token), 'password change'); assert.ok(chg.token);
  assert.equal((await call('GET', '/api/v1/leads', null, old)).status, 401); step('changing password signs out every other session');
  A.token = chg.token; A.pw = 'N3w-Strong-Pass-A'; assert.equal((await call('GET', '/api/v1/leads', null, A.token)).status, 200); step('the device that changed it stays signed in');
  ok(await call('POST', '/api/v1/auth/logout-all', {}, A.token), 'logout-all'); assert.equal((await call('GET', '/api/v1/leads', null, A.token)).status, 401); step('"sign out everywhere" works');
  A.token = ok(await call('POST', '/api/v1/auth/login', { email: A.email, password: A.pw }), 're-login').token;

  /* ---------- 4. passwords & lockout ---------- */
  for (const bad of ['short1', 'password123', 'onlyletterslong', '1234567890123']) assert.equal((await call('POST', '/api/v1/team', { name: 'x', email: `p${Math.random()}@x.in`, password: bad }, A.token)).status, 400);
  step('weak passwords refused');
  const victim = `lock${stamp}@secure-test.in`; ok(await call('POST', '/api/v1/team', { name: 'Lock', email: victim, password: 'Lock-me-Out-77' }, A.token), 'victim');
  let last; for (let i = 0; i < 11; i++) last = await call('POST', '/api/v1/auth/login', { email: victim, password: 'wrong-' + i });
  assert.equal(last.status, 429); assert.ok(last.headers.get('retry-after')); step('repeated wrong passwords lock the account temporarily');
  assert.equal((await call('POST', '/api/v1/auth/login', { email: victim, password: 'Lock-me-Out-77' })).status, 429); step('…even the right password is refused during the lockout');
  const unk = await call('POST', '/api/v1/auth/login', { email: 'nobody@nowhere.in', password: 'whatever-123' }); assert.equal(unk.status, 401); assert.equal(unk.body.error, (await call('POST', '/api/v1/auth/login', { email: A.email, password: 'wrong-wrong-1' })).body.error); step('unknown email and wrong password give the same message');

  /* ---------- 5. two-factor authentication ---------- */
  const setup = ok(await call('POST', '/api/v1/auth/2fa/setup', { password: B.pw }, B.token), '2fa setup'); assert.ok(/^otpauth:\/\//.test(setup.otpauthUrl));
  assert.equal((await call('POST', '/api/v1/auth/2fa/enable', { code: '000000' }, B.token)).status, 400);
  const cur = totp.stepAt(); const en = ok(await call('POST', '/api/v1/auth/2fa/enable', { code: totp.code(setup.secret, cur) }, B.token), '2fa enable'); assert.equal(en.recoveryCodes.length, 8); step('2FA set up with an authenticator code');
  assert.ok(!sql(`SELECT totp_secret_enc FROM users WHERE id='${B.uid}'`).includes(setup.secret)); step('2FA secret is stored encrypted');
  let lg = await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw }); assert.equal(lg.status, 401); assert.equal(lg.body.code, 'otp_required'); step('password alone no longer signs in');
  assert.equal((await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw, otp: '123456' })).status, 401);
  const good = totp.code(setup.secret, totp.stepAt() + 1);     // next step (this step was used when enabling)
  const lg2 = await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw, otp: good }); assert.equal(lg2.status, 200); step('password + authenticator code signs in');
  assert.equal((await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw, otp: good })).status, 401); step('the same code cannot be used twice');
  const rec = en.recoveryCodes[0];
  assert.equal((await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw, otp: rec })).status, 200); assert.equal((await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw, otp: rec })).status, 401); step('recovery codes work exactly once');
  sql(`UPDATE users SET totp_last_step=0 WHERE id='${B.uid}'`);
  const tok2 = lg2.body.token; ok(await call('POST', '/api/v1/auth/2fa/disable', { password: B.pw, code: totp.code(setup.secret, totp.stepAt()) }, tok2), '2fa disable');
  B.token = ok(await call('POST', '/api/v1/auth/login', { email: B.email, password: B.pw }), 'B login after disable').token; step('2FA can be turned off with a valid code');

  /* ---------- 6. support ("master key") access ---------- */
  const imp = ok(await call('POST', `/api/v1/platform/tenants/${A.id}/impersonate`, { reason: 'Fix import', readOnly: true }, sa.token), 'impersonate ro');
  assert.equal((await call('GET', '/api/v1/leads', null, imp.token)).status, 200);
  const w = await call('POST', '/api/v1/leads', { student: 'x', parent: 'y', phone: '98300 99999' }, imp.token); assert.equal(w.status, 403); step('read-only support session can look but not change');
  const imp2 = ok(await call('POST', `/api/v1/platform/tenants/${A.id}/impersonate`, { reason: 'Fix a stage' }, sa.token), 'impersonate rw');
  ok(await call('PATCH', `/api/v1/leads/${la.id}`, { stage: 'contacted' }, imp2.token), 'support edit');
  assert.equal((await call('GET', '/api/v1/platform/tenants', null, imp2.token)).status, 403); step('a support session cannot reach platform admin functions');
  assert.equal((await call('POST', '/api/v1/auth/password', { current: 'x', next: 'Whatever-123-x' }, imp2.token)).status, 403); step("a support session cannot change the school admin's password or 2FA");
  await new Promise(r => setTimeout(r, 400));
  const audit = ok(await call('GET', '/api/v1/settings/audit?support=1', null, A.token), 'school audit'); const acts = audit.map(x => x.action);
  assert.ok(acts.includes('support.start') && acts.includes('support.change')); step('the school can see every support session and change in its own audit log');
  assert.ok(audit.find(x => x.action === 'support.start').detail.reason);
  const plat = ok(await call('GET', `/api/v1/platform/audit?tenantId=${A.id}`, null, sa.token), 'platform audit'); assert.ok(plat.length >= 2); step('platform audit log available');
  const cl2 = ok(await call('POST', '/api/v1/auth/login', { email: `couns${stamp}@secure-test.in`, password: 'Cou-n5elor-Pass' }), 'counsellor re-login');
  assert.equal((await call('GET', '/api/v1/settings/audit', null, cl2.token)).status, 403); step('counsellors cannot read the audit log');
  ok(await call('PUT', '/api/v1/settings', { security: { supportAccess: false } }, A.token), 'turn support off');
  assert.equal((await call('POST', `/api/v1/platform/tenants/${A.id}/impersonate`, {}, sa.token)).status, 403); step('a school can switch support access off');
  assert.equal((await call('GET', '/api/v1/leads', null, imp2.token)).status, 403); step('…which also ends support sessions already open');
  ok(await call('PUT', '/api/v1/settings', { security: { supportAccess: true } }, A.token), 'turn support on');

  /* ---------- 7. webhooks ---------- */
  const SECRET = 'wh-secret-' + stamp, PN_A = 'PNA' + stamp, PN_B = 'PNB' + stamp;
  const sa1 = ok(await call('PUT', '/api/v1/settings', { whatsapp: { phoneNumberId: PN_A, wabaId: 'W' + stamp, accessToken: 'TEST_TOKEN', appSecret: SECRET } }, A.token), 'wa A');
  const sb1 = ok(await call('PUT', '/api/v1/settings', { whatsapp: { phoneNumberId: PN_B, wabaId: 'WB' + stamp, accessToken: 'TEST_TOKEN' } }, B.token), 'wa B (no app secret)');
  const keyA = sa1.whatsapp.webhookUrl.split('/').pop(), keyB = sb1.whatsapp.webhookUrl.split('/').pop();
  const evt = (pn, from, text) => JSON.stringify({ object: 'whatsapp_business_account', entry: [{ id: 'W', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { phone_number_id: pn }, contacts: [{ wa_id: from, profile: { name: 'Hook Parent' } }], messages: [{ from, id: 'wamid.' + crypto.randomBytes(6).toString('hex'), timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: text } }] } }] }] });
  const sign = (raw, s) => 'sha256=' + crypto.createHmac('sha256', s).update(raw).digest('hex');
  const post = (key, raw, sig) => call('POST', `/webhooks/whatsapp/${key}`, null, null, { raw, headers: sig ? { 'X-Hub-Signature-256': sig } : {} });
  let raw = evt(PN_A, '919830077701', 'fees please');
  assert.equal((await post(keyA, raw)).status, 401); assert.equal((await post(keyA, raw, 'sha256=' + '0'.repeat(64))).status, 401); step('unsigned or wrongly signed webhooks refused');
  assert.equal((await post(keyB, evt(PN_B, '919830077702', 'hi'), sign(evt(PN_B, '919830077702', 'hi'), 'anything'))).status, 401); step('a school with no App Secret set accepts nothing (fails closed)');
  assert.equal((await post(keyA, raw, sign(raw, SECRET))).status, 200);
  raw = evt(PN_B, '919830077703', 'cross tenant attempt');   // school A's URL + A's valid signature, but naming school B's WhatsApp number
  assert.equal((await post(keyA, raw, sign(raw, SECRET))).status, 200);
  await new Promise(r => setTimeout(r, 600));
  assert.equal(sql(`SELECT count(*) FROM leads WHERE tenant_id='${A.id}' AND wa_id='919830077701'`), '1'); step('a signed message is delivered to its own school');
  assert.equal(sql(`SELECT count(*) FROM leads WHERE wa_id='919830077703'`), '0'); step("a school's webhook URL can never write into another school (phone-number pinning)");
  assert.equal((await fetch(`${BASE}/webhooks/whatsapp/${keyA}?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1`)).status, 403); step('wrong verify token refused');
  const hook = (k, body, h = {}) => call('POST', `/hooks/leads/${k}`, body, null, { headers: h });
  const hr = await hook(keyA, { phone: '98300 55555', parent: 'Redirect Test', _redirect: 'https://evil.example/phish' }); assert.equal(hr.status, 201); step('website form cannot be used as an open redirect');
  const hr2 = await hook(keyA, { phone: '98300 55556', parent: 'Redirect OK', _redirect: 'https://school.example/thanks' }, { Origin: 'https://school.example' }); assert.equal(hr2.status, 303); step('…but may bounce back to the site the form came from');

  /* ---------- 8. uploads ---------- */
  const up = async (name, type, data, tk) => { const fd = new FormData(); fd.append('file', new Blob([data], { type }), name); const r = await fetch(BASE + '/api/v1/media', { method: 'POST', headers: { Authorization: 'Bearer ' + tk }, body: fd }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = t; } return { status: r.status, body: j }; };
  assert.equal((await up('x.html', 'text/html', '<script>alert(1)</script>', A.token)).status, 400);
  assert.equal((await up('x.svg', 'image/svg+xml', '<svg onload=alert(1)/>', A.token)).status, 400);
  assert.equal((await up('x.js', 'application/javascript', 'alert(1)', A.token)).status, 400); step('HTML / SVG / JS uploads refused');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const sneaky = await up('evil.html', 'image/png', png, A.token); assert.equal(sneaky.status, 201); assert.ok(/\.png$/.test(sneaky.body.url), sneaky.body.url); step('the stored file name/extension is chosen by the server, not the uploader');
  const f = await fetch(BASE + sneaky.body.url); assert.equal(f.status, 200); assert.equal(f.headers.get('content-type'), 'image/png'); assert.equal(f.headers.get('x-content-type-options'), 'nosniff'); assert.ok(/sandbox/.test(f.headers.get('content-security-policy'))); step('uploads are served with a fixed type, nosniff and a sandbox CSP');
  const txt = await up('notes.txt', 'text/plain', 'hello', A.token); const f2 = await fetch(BASE + txt.body.url); assert.ok(/attachment/.test(f2.headers.get('content-disposition'))); step('non-media files are forced to download');
  assert.equal((await fetch(BASE + '/uploads/..%2f..%2fetc%2fpasswd')).status, 404); assert.equal((await fetch(BASE + '/uploads/index.html')).status, 404); step('upload path traversal / arbitrary names refused');

  /* ---------- 9. headers, misc ---------- */
  const hd = (await fetch(BASE + '/')).headers; const csp = hd.get('content-security-policy');
  assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp) || process.env.CSP_ALLOW_INLINE === 'true'); assert.ok(/object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp)); assert.ok(hd.get('permissions-policy')); step('CSP blocks inline scripts, plugins and <base> hijacking');
  assert.equal((await fetch(BASE + '/cron/run?key=guess')).status, 404); step('cron endpoint closed without the secret');
  assert.equal((await call('GET', '/api/v1/platform/tenants', null, A.token)).status, 403); step('school admins cannot reach the platform API');
  console.log('\nALL SECURITY TESTS PASSED');
})().catch(e => { console.error('\n✗ FAILED:', e.message); process.exit(1); });
