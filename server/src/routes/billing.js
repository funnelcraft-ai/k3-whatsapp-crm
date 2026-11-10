/* Billing API for institution admins (works even when the subscription has lapsed) */
const express = require('express');
const { q, one, HttpError, wrap } = require('../core');
const { requireRole, requireTenant } = require('../auth');
const Billing = require('../services/billing');

const r = express.Router();
r.use(requireTenant);
r.get('/', wrap(async (req, res) => res.json(await Billing.overview(req.tenant))));
r.put('/details', requireRole('admin'), wrap(async (req, res) => {
  const b = req.body || {};
  await q(`UPDATE tenants SET billing_email=$2, billing_gstin=$3, billing_address=$4 WHERE id=$1`, [req.tenant.id, String(b.billingEmail || '').trim() || null, String(b.gstin || '').trim().toUpperCase() || null, String(b.address || '').trim() || null]);
  res.json(await Billing.overview(await one(`SELECT * FROM tenants WHERE id=$1`, [req.tenant.id])));
}));
r.post('/checkout', requireRole('admin'), wrap(async (req, res) => res.json(await Billing.startCheckout(req.tenant, req.body.planId, req.user))));
r.post('/verify', requireRole('admin'), wrap(async (req, res) => {
  const t = await one(`SELECT * FROM tenants WHERE id=$1`, [req.tenant.id]);
  res.json(Object.assign(await Billing.verifyCheckout(t, req.body || {}), { overview: await Billing.overview(await one(`SELECT * FROM tenants WHERE id=$1`, [t.id])) }));
}));
r.post('/cancel', requireRole('admin'), wrap(async (req, res) => res.json(await Billing.cancel(req.tenant, req.body.immediately !== true))));
r.get('/invoices/:id', wrap(async (req, res) => res.type('html').send(await Billing.invoiceHTML(req.params.id, req.tenant.id))));

/* Razorpay webhook — raw body for signature verification */
const webhook = express.Router();
webhook.post('/', express.raw({ type: '*/*', limit: '1mb' }), wrap(async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!Billing.verifyWebhook(raw, req.headers['x-razorpay-signature'])) return res.sendStatus(401);
  let evt; try { evt = JSON.parse(raw); } catch (e) { return res.sendStatus(400); }
  try { await Billing.handleWebhook(evt); } catch (e) { console.error('razorpay webhook', e); await q(`INSERT INTO webhook_log(kind, payload, error) VALUES ('razorpay', $1, $2)`, [evt, e.message]).catch(() => {}); return res.sendStatus(500); }
  res.json({ ok: true });
}));
module.exports = { router: r, webhook };
