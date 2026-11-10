/* Razorpay billing — monthly/yearly subscriptions (Razorpay Subscriptions) and one-time licences (Orders).
   Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, BILLING_GRACE_DAYS (default 5).
   Access is controlled by tenants.plan_expires_at = paid-until + grace days (null = no expiry). */
const crypto = require('crypto');
const { q, one, many, tx, HttpError } = require('../core');

const cfg = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || '', keySecret: process.env.RAZORPAY_KEY_SECRET || '', webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  apiBase: (process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com/v1').replace(/\/$/, ''), graceDays: +(process.env.BILLING_GRACE_DAYS || 5),
});
const enabled = () => !!(cfg().keyId && cfg().keySecret);
const DAY = 864e5;

async function rzp(method, path, body) {
  const c = cfg(); if (!enabled()) throw new HttpError(400, 'Online payments are not set up yet. Please contact K3 Solutions.');
  const r = await fetch(c.apiBase + path, { method, headers: { Authorization: 'Basic ' + Buffer.from(`${c.keyId}:${c.keySecret}`).toString('base64'), 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new HttpError(r.status >= 500 ? 502 : 400, 'Razorpay: ' + ((j.error && j.error.description) || r.status));
  return j;
}
const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex');
const safeEq = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); };

function price(plan) { const base = plan.price_paise; const tax = Math.round(base * (+plan.gst_percent || 0) / 100); return { base, tax, total: base + tax }; }
const planOut = p => { const pr = price(p); return { id: p.id, code: p.code, name: p.name, description: p.description, billing: p.billing, pricePaise: p.price_paise, gstPercent: +p.gst_percent, totalPaise: pr.total, taxPaise: pr.tax, currency: p.currency, maxUsers: p.max_users, maxContacts: p.max_contacts, features: p.features, active: p.active, sort: p.sort, razorpayPlanId: p.razorpay_plan_id }; };

async function company() { const r = await one(`SELECT value FROM platform_settings WHERE key='company'`); return Object.assign({ name: 'K3 Solutions', address: 'Kolkata, West Bengal, India', gstin: '', email: '', phone: '+91 82404 72003', invoicePrefix: 'K3', state: 'West Bengal' }, r ? r.value : {}); }
async function nextInvoiceNo() {
  const c = await company(); const now = new Date(); const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; const fy = `${y}-${String(y + 1).slice(2)}`;
  const r = await one(`INSERT INTO counters(key, value) VALUES ($1, 1) ON CONFLICT (key) DO UPDATE SET value = counters.value + 1 RETURNING value`, ['invoice:' + fy]);
  return `${c.invoicePrefix}/${fy}/${String(r.value).padStart(4, '0')}`;
}

/* grant access: paid until `until` (+grace); null = lifetime */
async function setAccess(tenantId, plan, status, until) {
  const exp = until ? new Date(new Date(until).getTime() + cfg().graceDays * DAY) : null;
  await q(`UPDATE tenants SET billing_status=$2, plan_id=$3, plan=$4, max_users=GREATEST(max_users, $5), max_contacts=GREATEST(max_contacts, $6), current_period_end=$7, plan_expires_at=$8 WHERE id=$1`,
    [tenantId, status, plan.id, plan.name, plan.max_users, plan.max_contacts, until, exp]);
}
async function recordPayment(tenantId, plan, kind, payment, extra = {}) {
  const exists = await one(`SELECT id FROM payments WHERE rzp_payment_id=$1`, [payment.id]); if (exists) return null;
  const pr = price(plan); const amount = payment.amount || pr.total; const tax = Math.round(amount - amount / (1 + (+plan.gst_percent || 0) / 100));
  return one(`INSERT INTO payments(tenant_id, plan_id, kind, status, rzp_payment_id, rzp_order_id, rzp_subscription_id, amount_paise, tax_paise, currency, invoice_no, period_start, period_end, description)
    VALUES ($1,$2,$3,'captured',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (rzp_payment_id) DO NOTHING RETURNING *`,
    [tenantId, plan.id, kind, payment.id, payment.order_id || extra.orderId || null, extra.subscriptionId || null, amount, tax, payment.currency || plan.currency, await nextInvoiceNo(), extra.start || null, extra.end || null,
      `${plan.name} — ${kind === 'one_time' ? 'one-time licence' : plan.billing + ' subscription'}`]);
}

async function ensureRzpPlan(plan) {
  if (plan.razorpay_plan_id) return plan.razorpay_plan_id;
  const pr = price(plan);
  const p = await rzp('POST', '/plans', { period: plan.billing === 'yearly' ? 'yearly' : 'monthly', interval: 1, item: { name: `${plan.name} (K3 CRM)`, amount: pr.total, currency: plan.currency, description: plan.description || plan.name }, notes: { k3_plan: plan.code } });
  await q(`UPDATE plans SET razorpay_plan_id=$2 WHERE id=$1`, [plan.id, p.id]); return p.id;
}

/* start checkout → returns options for Razorpay Standard Checkout */
async function startCheckout(t, planId, user) {
  const plan = await one(`SELECT * FROM plans WHERE id=$1 AND active`, [planId]); if (!plan) throw new HttpError(404, 'Plan not found');
  const base = { key: cfg().keyId, name: (await company()).name, prefill: { name: user.name, email: t.billing_email || user.email }, notes: { tenant_id: t.id, plan_id: plan.id } };
  if (plan.billing === 'one_time') {
    const pr = price(plan);
    const o = await rzp('POST', '/orders', { amount: pr.total, currency: plan.currency, receipt: ('k3_' + t.id.slice(0, 8) + '_' + Date.now()).slice(0, 40), notes: { tenant_id: t.id, plan_id: plan.id } });
    return Object.assign(base, { mode: 'order', order_id: o.id, amount: pr.total, currency: plan.currency, description: plan.name + ' — one-time licence' });
  }
  const rzpPlanId = await ensureRzpPlan(plan);
  const s = await rzp('POST', '/subscriptions', { plan_id: rzpPlanId, total_count: plan.billing === 'yearly' ? 10 : 120, quantity: 1, customer_notify: 1, notes: { tenant_id: t.id, plan_id: plan.id } });
  await q(`UPDATE tenants SET rzp_subscription_id=$2 WHERE id=$1`, [t.id, s.id]);
  return Object.assign(base, { mode: 'subscription', subscription_id: s.id, description: `${plan.name} — ${plan.billing} subscription` });
}

/* Checkout success handler → verify signature, activate immediately (webhooks also arrive and are idempotent) */
async function verifyCheckout(t, b) {
  const c = cfg();
  if (b.razorpay_subscription_id) {
    if (b.razorpay_subscription_id !== t.rzp_subscription_id) throw new HttpError(400, 'Subscription does not belong to this institution');
    if (!safeEq(hmac(c.keySecret, `${b.razorpay_payment_id}|${t.rzp_subscription_id}`), b.razorpay_signature)) throw new HttpError(400, 'Payment signature verification failed');
    const s = await rzp('GET', `/subscriptions/${t.rzp_subscription_id}`);
    const plan = await one(`SELECT * FROM plans WHERE id=$1`, [(s.notes && s.notes.plan_id) || t.plan_id]);
    const end = s.current_end ? new Date(s.current_end * 1000) : new Date(Date.now() + (plan.billing === 'yearly' ? 365 : 31) * DAY);
    const start = s.current_start ? new Date(s.current_start * 1000) : new Date();
    await setAccess(t.id, plan, 'active', end);
    await recordPayment(t.id, plan, 'subscription', { id: b.razorpay_payment_id, amount: price(plan).total }, { subscriptionId: s.id, start, end });
    return { status: 'active', paidUntil: end };
  }
  if (b.razorpay_order_id) {
    if (!safeEq(hmac(c.keySecret, `${b.razorpay_order_id}|${b.razorpay_payment_id}`), b.razorpay_signature)) throw new HttpError(400, 'Payment signature verification failed');
    const o = await rzp('GET', `/orders/${b.razorpay_order_id}`);
    if (!o.notes || o.notes.tenant_id !== t.id) throw new HttpError(400, 'Order does not belong to this institution');
    const plan = await one(`SELECT * FROM plans WHERE id=$1`, [o.notes.plan_id]);
    await setAccess(t.id, plan, 'lifetime', null);
    await recordPayment(t.id, plan, 'one_time', { id: b.razorpay_payment_id, amount: o.amount, order_id: o.id }, { orderId: o.id });
    return { status: 'lifetime' };
  }
  throw new HttpError(400, 'Missing payment details');
}

async function cancel(t, atCycleEnd = true) {
  if (!t.rzp_subscription_id) throw new HttpError(400, 'No active subscription');
  await rzp('POST', `/subscriptions/${t.rzp_subscription_id}/cancel`, { cancel_at_cycle_end: atCycleEnd ? 1 : 0 });
  await q(`UPDATE tenants SET billing_status='cancelled' WHERE id=$1`, [t.id]);
  return { status: 'cancelled', accessUntil: t.plan_expires_at };
}

/* Razorpay webhook (source of truth for renewals, halts, cancellations) */
function verifyWebhook(raw, sig) { const s = cfg().webhookSecret; return !!s && safeEq(hmac(s, raw), sig); }
async function handleWebhook(evt) {
  const p = evt.payload || {}; const sub = p.subscription && p.subscription.entity; const pay = p.payment && p.payment.entity; const order = p.order && p.order.entity;
  const notes = (sub && sub.notes) || (order && order.notes) || (pay && pay.notes) || {};
  const tenant = notes.tenant_id ? await one(`SELECT * FROM tenants WHERE id=$1`, [notes.tenant_id]) : sub ? await one(`SELECT * FROM tenants WHERE rzp_subscription_id=$1`, [sub.id]) : null;
  if (!tenant) return { ignored: 'no tenant' };
  const plan = await one(`SELECT * FROM plans WHERE id=$1`, [notes.plan_id || tenant.plan_id]);
  switch (evt.event) {
    case 'subscription.activated': case 'subscription.charged': case 'subscription.resumed': {
      const end = sub.current_end ? new Date(sub.current_end * 1000) : null; const start = sub.current_start ? new Date(sub.current_start * 1000) : null;
      if (plan && end) await setAccess(tenant.id, plan, 'active', end);
      if (plan && pay && evt.event === 'subscription.charged') await recordPayment(tenant.id, plan, 'subscription', pay, { subscriptionId: sub.id, start, end });
      return { ok: true };
    }
    case 'subscription.pending': case 'subscription.halted':
      await q(`UPDATE tenants SET billing_status='past_due' WHERE id=$1`, [tenant.id]); return { ok: true }; // access continues until paid-until + grace
    case 'subscription.cancelled': case 'subscription.completed':
      await q(`UPDATE tenants SET billing_status='cancelled' WHERE id=$1 AND billing_status <> 'lifetime'`, [tenant.id]); return { ok: true };
    case 'payment.captured': case 'order.paid':
      if (plan && plan.billing === 'one_time' && pay) { await setAccess(tenant.id, plan, 'lifetime', null); await recordPayment(tenant.id, plan, 'one_time', pay, { orderId: pay.order_id }); }
      return { ok: true };
    default: return { ignored: evt.event };
  }
}

async function overview(t) {
  const [plans, payments, cur] = await Promise.all([
    many(`SELECT * FROM plans WHERE active ORDER BY sort, price_paise`),
    many(`SELECT * FROM payments WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 50`, [t.id]),
    t.plan_id ? one(`SELECT * FROM plans WHERE id=$1`, [t.plan_id]) : null,
  ]);
  return {
    enabled: enabled(), keyId: cfg().keyId, status: t.billing_status, plan: cur ? planOut(cur) : { name: t.plan }, currentPeriodEnd: t.current_period_end, accessUntil: t.plan_expires_at, trialEndsAt: t.trial_ends_at,
    locked: !!(t.plan_expires_at && new Date(t.plan_expires_at) < new Date()), graceDays: cfg().graceDays, hasSubscription: !!t.rzp_subscription_id && t.billing_status === 'active',
    billingEmail: t.billing_email || '', gstin: t.billing_gstin || '', address: t.billing_address || '',
    plans: plans.map(planOut), payments: payments.map(paymentOut),
  };
}
const paymentOut = p => ({ id: p.id, invoiceNo: p.invoice_no, kind: p.kind, status: p.status, amountPaise: p.amount_paise, taxPaise: p.tax_paise, currency: p.currency, description: p.description, periodStart: p.period_start, periodEnd: p.period_end, paymentId: p.rzp_payment_id, createdAt: p.created_at });

async function invoiceHTML(paymentId, tenantId) {
  const p = await one(`SELECT p.*, t.name AS tname, t.city, t.billing_gstin, t.billing_address, t.billing_email FROM payments p JOIN tenants t ON t.id=p.tenant_id WHERE p.id=$1 ${tenantId ? 'AND p.tenant_id=$2' : ''}`, tenantId ? [paymentId, tenantId] : [paymentId]);
  if (!p) throw new HttpError(404, 'Invoice not found');
  const c = await company(); const e = s => String(s ?? '').replace(/[&<>"]/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));
  const inr = v => '₹' + (v / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const base = p.amount_paise - p.tax_paise; const intra = !p.billing_gstin || p.billing_gstin.slice(0, 2) === (c.gstin || '').slice(0, 2);
  const taxRows = p.tax_paise ? (intra ? `<tr><td>CGST</td><td class="r">${inr(p.tax_paise / 2)}</td></tr><tr><td>SGST</td><td class="r">${inr(p.tax_paise / 2)}</td></tr>` : `<tr><td>IGST</td><td class="r">${inr(p.tax_paise)}</td></tr>`) : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${e(p.invoice_no)}</title><style>body{font-family:Roboto,Arial,sans-serif;color:#1f1f1f;max-width:760px;margin:32px auto;padding:0 24px}h1{font-weight:400;margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:10px 8px;border-bottom:1px solid #e0e3e7;text-align:left}.r{text-align:right}.muted{color:#5e5e5e;font-size:13px}.grid{display:flex;justify-content:space-between;gap:24px;margin-top:24px}.tot td{font-weight:700;border-bottom:0}@media print{button{display:none}}</style></head><body>
  <div class="grid" style="margin-top:0;align-items:flex-start"><div><h1>Tax Invoice</h1><div class="muted">${e(p.invoice_no)} · ${new Date(p.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div></div><div style="text-align:right"><b>${e(c.name)}</b><div class="muted">${e(c.address)}${c.gstin ? '<br>GSTIN ' + e(c.gstin) : ''}<br>${e(c.email)} ${e(c.phone)}</div></div></div>
  <div class="grid"><div><div class="muted">Billed to</div><b>${e(p.tname)}</b><div class="muted">${e(p.billing_address || p.city || '')}${p.billing_gstin ? '<br>GSTIN ' + e(p.billing_gstin) : ''}${p.billing_email ? '<br>' + e(p.billing_email) : ''}</div></div><div style="text-align:right"><div class="muted">Payment</div>${e(p.rzp_payment_id || '')}<div class="muted">Status: ${e(p.status)}</div></div></div>
  <table><tr><th>Description</th><th class="r">Amount</th></tr><tr><td>${e(p.description)}${p.period_start ? `<div class="muted">${new Date(p.period_start).toLocaleDateString('en-IN')} – ${new Date(p.period_end).toLocaleDateString('en-IN')}</div>` : ''}<div class="muted">SAC 998314 · Software as a service</div></td><td class="r">${inr(base)}</td></tr>${taxRows}<tr class="tot"><td>Total</td><td class="r">${inr(p.amount_paise)}</td></tr></table>
  <p class="muted" style="margin-top:32px">This is a computer-generated invoice.</p><button onclick="window.print()" style="padding:10px 20px;border-radius:20px;border:0;background:#0b57d0;color:#fff;font-weight:500;cursor:pointer">Print / Save as PDF</button></body></html>`;
}

module.exports = { enabled, price, planOut, company, startCheckout, verifyCheckout, cancel, verifyWebhook, handleWebhook, overview, invoiceHTML, paymentOut, setAccess };
