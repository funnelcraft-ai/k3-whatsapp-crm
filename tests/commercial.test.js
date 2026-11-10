/* Commercial features: Razorpay billing (subscriptions, one-time licence, webhooks, invoices, lock-out),
   Meta Embedded Signup, automated backups + restore.
   Needs: fake-meta :9099, fake-razorpay :9098, server :8080 started with
   RAZORPAY_KEY_ID=rzp_test_K3 RAZORPAY_KEY_SECRET=rzp_secret_K3 RAZORPAY_WEBHOOK_SECRET=whsec_K3 RAZORPAY_API_BASE=http://localhost:9098/v1
   META_APP_ID=APP_K3 META_APP_SECRET=meta_secret_K3 META_ES_CONFIG_ID=CFG_K3 BACKUP_DIR=/tmp/k3backups */
const assert = require('assert'); const crypto = require('crypto'); const { execFileSync } = require('child_process'); const path = require('path');
const { Pool } = require('pg');
const DBURL = process.env.DATABASE_URL || 'postgres://k3:k3pass@localhost:5432/k3crm';
const db = new Pool({ connectionString: DBURL });
const A = process.env.BASE || 'http://localhost:8080'; const RZP = 'http://localhost:9098/v1';
const step = n => console.log('✓', n); const stamp = Date.now();
const hmac = (s, d) => crypto.createHmac('sha256', s).update(d).digest('hex');
async function call(method, p, body, tk, expect) {
  const r = await fetch(A + p, { method, headers: Object.assign({ 'Content-Type': 'application/json' }, tk ? { Authorization: 'Bearer ' + tk } : {}), body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = t; }
  if (expect ? r.status !== expect : r.status >= 400) throw new Error(`${method} ${p} → ${r.status} ${t.slice(0, 300)}`); return j;
}
async function rzHook(evt, secret = 'whsec_K3') { const raw = JSON.stringify(evt); return fetch(A + '/webhooks/razorpay', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': hmac(secret, raw) }, body: raw }); }

const R = Date.now().toString(36);
(async () => {
  const sa = (await call('POST', '/api/v1/auth/login', { email: 'owner@k3solutions.in', password: 'Owner@12345' })).token;
  /* ---------- platform setup ---------- */
  const plans = await call('GET', '/api/v1/platform/plans', null, sa); assert.ok(plans.length >= 4);
  let growth = plans.find(p => p.code === 'growth-monthly'); const licence = plans.find(p => p.code === 'licence-one-time');
  if (growth.pricePaise !== 599900) growth = await call('PATCH', `/api/v1/platform/plans/${growth.id}`, { pricePaise: 599900 }, sa); // re-runnable
  assert.equal(growth.totalPaise, Math.round(599900 * 1.18)); step('plans seeded with GST-inclusive totals');
  await call('PUT', '/api/v1/platform/company', { name: 'K3 Solutions', gstin: '19ABCDE1234F1Z5', address: 'Salt Lake, Kolkata', invoicePrefix: 'K3' }, sa);
  const co = await call('GET', '/api/v1/platform/company', null, sa); assert.equal(co.razorpay.enabled, true); assert.equal(co.embeddedSignup.enabled, true); step('company details + Razorpay/Embedded Signup detected');
  const tn = await call('POST', '/api/v1/platform/tenants', { name: 'Billing School ' + stamp, trialDays: 14, admin: { email: `bill${stamp}@test.in`, password: 'Admin@12345' } }, sa);
  const tk = (await call('POST', '/api/v1/auth/login', { email: `bill${stamp}@test.in`, password: 'Admin@12345' })).token;
  let ov = await call('GET', '/api/v1/billing', null, tk); assert.equal(ov.status, 'trial'); assert.ok(new Date(ov.accessUntil) > new Date(Date.now() + 13 * 864e5)); step('new institution starts a 14-day trial');

  /* ---------- subscription ---------- */
  const co1 = await call('POST', '/api/v1/billing/checkout', { planId: growth.id }, tk);
  assert.equal(co1.mode, 'subscription'); assert.equal(co1.key, 'rzp_test_K3'); assert.ok(co1.subscription_id);
  const rlog = await (await fetch(RZP + '/__log')).json(); assert.equal(rlog.find(x => x.path === '/plans').json.item.amount, growth.totalPaise); step('checkout creates Razorpay plan + subscription');
  await call('POST', '/api/v1/billing/verify', { razorpay_payment_id: 'pay_A1' + R, razorpay_subscription_id: co1.subscription_id, razorpay_signature: 'bad' }, tk, 400); step('forged payment signature rejected');
  const v = await call('POST', '/api/v1/billing/verify', { razorpay_payment_id: 'pay_A1' + R, razorpay_subscription_id: co1.subscription_id, razorpay_signature: hmac('rzp_secret_K3', `pay_A1${R}|${co1.subscription_id}`) }, tk);
  assert.equal(v.status, 'active'); ov = v.overview; assert.equal(ov.plan.name, 'Growth'); assert.equal(ov.payments.length, 1); assert.ok(/^K3\/\d{4}-\d{2}\/\d{4}$/.test(ov.payments[0].invoiceNo));
  assert.ok(new Date(ov.accessUntil) > new Date(Date.now() + 33 * 864e5)); step(`subscription activated, invoice ${ov.payments[0].invoiceNo}, access = period + grace`);
  const inv = await (await fetch(`${A}/api/v1/billing/invoices/${ov.payments[0].id}`, { headers: { Authorization: "Bearer " + tk } })).text(); assert.ok(inv.includes('Tax Invoice') && inv.includes('CGST') && inv.includes('19ABCDE1234F1Z5')); step('GST invoice renders (CGST/SGST)');

  /* ---------- webhooks ---------- */
  const now = Math.floor(Date.now() / 1000);
  const charged = { event: 'subscription.charged', payload: { subscription: { entity: { id: co1.subscription_id, status: 'active', current_start: now + 30 * 86400, current_end: now + 60 * 86400, notes: { tenant_id: tn.id, plan_id: growth.id } } }, payment: { entity: { id: 'pay_A2' + R, amount: growth.totalPaise, currency: 'INR', status: 'captured' } } } };
  assert.equal((await rzHook(charged, 'wrong')).status, 401); step('webhook with bad signature rejected');
  assert.equal((await rzHook(charged)).status, 200); assert.equal((await rzHook(charged)).status, 200);
  ov = await call('GET', '/api/v1/billing', null, tk); assert.equal(ov.payments.length, 2); assert.ok(new Date(ov.currentPeriodEnd) > new Date(Date.now() + 59 * 864e5)); step('renewal webhook extends access, records invoice once (idempotent)');
  await rzHook({ event: 'subscription.halted', payload: { subscription: { entity: { id: co1.subscription_id, notes: { tenant_id: tn.id, plan_id: growth.id } } } } });
  ov = await call('GET', '/api/v1/billing', null, tk); assert.equal(ov.status, 'past_due'); step('halted subscription → past due (access until paid period + grace)');

  /* ---------- lock-out when unpaid ---------- */
  await db.query(`UPDATE tenants SET plan_expires_at = now() - interval '1 day' WHERE id=$1`, [tn.id]);
  const r402 = await fetch(A + '/api/v1/leads', { headers: { Authorization: 'Bearer ' + tk } }); assert.equal(r402.status, 402);
  assert.equal((await fetch(A + '/api/v1/billing', { headers: { Authorization: 'Bearer ' + tk } })).status, 200);
  const me = await call('GET', '/api/v1/auth/me', null, tk); assert.equal(me.tenant.billingLocked, true); step('lapsed institution: CRM locked (402) but Billing still open');

  /* ---------- one-time licence ---------- */
  const co2 = await call('POST', '/api/v1/billing/checkout', { planId: licence.id }, tk); assert.equal(co2.mode, 'order'); assert.equal(co2.amount, licence.totalPaise);
  const v2 = await call('POST', '/api/v1/billing/verify', { razorpay_payment_id: 'pay_L1' + R, razorpay_order_id: co2.order_id, razorpay_signature: hmac('rzp_secret_K3', `${co2.order_id}|pay_L1${R}`) }, tk);
  assert.equal(v2.status, 'lifetime'); assert.equal(v2.overview.accessUntil, null);
  assert.equal((await fetch(A + '/api/v1/leads', { headers: { Authorization: 'Bearer ' + tk } })).status, 200); step('one-time licence paid → lifetime access, CRM unlocked');

  /* ---------- plans admin ---------- */
  const g2 = await call('PATCH', `/api/v1/platform/plans/${growth.id}`, { pricePaise: 649900 }, sa); assert.equal(g2.razorpayPlanId, null);
  const pays = await call('GET', '/api/v1/platform/payments', null, sa); assert.ok(pays.filter(p => p.tenantId === tn.id).length === 3); step('price change re-creates Razorpay plan next time; platform sees all payments');

  /* ---------- Embedded Signup ---------- */
  const st = await call('GET', '/api/v1/settings', null, tk); assert.equal(st.embeddedSignup.enabled, true); assert.equal(st.embeddedSignup.configId, 'CFG_K3');
  await call('POST', '/api/v1/settings/whatsapp/embedded', { code: 'BADCODE', phoneNumberId: 'PNID' + stamp, wabaId: 'WABA_ES' }, tk, 400);
  const es = await call('POST', '/api/v1/settings/whatsapp/embedded', { code: 'GOODCODE', phoneNumberId: 'PNID' + stamp, wabaId: 'WABA_ES' }, tk);
  assert.equal(es.connected, true); assert.equal(es.whatsapp.phoneNumberId, 'PNID' + stamp); assert.ok(es.templatesSynced >= 1); assert.equal(es.whatsapp.hasAccessToken, true);
  const mlog = await (await fetch('http://localhost:9099/__log')).json();
  assert.ok(mlog.some(c => c.path === '/WABA_ES/subscribed_apps')); assert.ok(mlog.some(c => c.path === `/PNID${stamp}/register` && /^\d{6}$/.test(c.json.pin)));
  step('Embedded Signup: code exchanged, app subscribed to WABA, number registered, templates synced');

  /* ---------- backups ---------- */
  const b = await call('POST', '/api/v1/platform/backups', {}, sa); assert.equal(b.ok, true); assert.ok(b.counts.leads > 0);
  const list = await call('GET', '/api/v1/platform/backups', null, sa); assert.ok(list.backups.some(x => x.name === b.name));
  const dl = await fetch(`${A}/api/v1/platform/backups/${b.name}`, { headers: { Authorization: 'Bearer ' + sa } }); assert.equal(dl.status, 200); assert.ok(Buffer.from(await dl.arrayBuffer()).length > 100); step(`backup created (${b.counts.leads} leads, ${b.size} bytes) and downloadable`);
  const RDB = DBURL.replace(/\/[^/]+$/, '/k3restore');
  execFileSync('node', [path.join(__dirname, '..', 'server/scripts/restore-backup.js'), path.join('/tmp/k3backups', b.name), '--yes'], { env: Object.assign({}, process.env, { DATABASE_URL: RDB }), stdio: 'pipe' });
  const rdb = new Pool({ connectionString: RDB });
  for (const t of ['tenants', 'users', 'leads', 'messages', 'media', 'payments', 'timeline']) {
    const [x, y] = await Promise.all([db.query(`SELECT count(*)::int n FROM ${t}`), rdb.query(`SELECT count(*)::int n FROM ${t}`)]);
    assert.equal(y.rows[0].n, b.counts[t], t);
  }
  const mb = await rdb.query(`SELECT count(*)::int n FROM media WHERE data IS NOT NULL`); const ma = await db.query(`SELECT count(*)::int n FROM media WHERE data IS NOT NULL`);
  assert.ok(mb.rows[0].n > 0 && mb.rows[0].n <= ma.rows[0].n); await rdb.end(); step('restore into an empty database reproduces every table (incl. files)');

  await db.end(); console.log('\nALL COMMERCIAL TESTS PASSED'); process.exit(0);
})().catch(async e => { console.error('\n✗ COMMERCIAL TEST FAILED:', e.message); await db.end().catch(() => {}); process.exit(1); });
