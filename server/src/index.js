/* K3 Solutions WhatsApp Admissions CRM — server entry */
const path = require('path');
const fs = require('fs');
const express = require('express');
const { config, migrate, one, q, HttpError, wrap, events } = require('./core');
const Storage = require('./services/storage');
const auth = require('./auth');
const api = require('./routes/api');
const admin = require('./routes/admin');
const hooks = require('./routes/webhooks');
const worker = require('./worker');
const billing = require('./routes/billing');

const crypto = require('crypto');
const { limiter } = require('./services/ratelimit');
const app = express();
app.set('trust proxy', /^\d+$/.test(String(config.trustProxy)) ? +config.trustProxy : config.trustProxy === 'true' ? true : config.trustProxy);   // hops of proxies we trust for req.ip (Railway = 1)
app.disable('x-powered-by');

/* The Angular build has exactly one tiny inline script. Allow it by hash instead of allowing all inline scripts. */
const pub = path.join(__dirname, '..', 'public');
let inlineHashes = [], hashStamp = 0;
function scriptHashes() {
  try {
    const f = path.join(pub, 'index.html'); const m = fs.statSync(f).mtimeMs;
    if (m !== hashStamp) {
      hashStamp = m; const html = fs.readFileSync(f, 'utf8');
      inlineHashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].filter(x => x[1].trim()).map(x => `'sha256-${crypto.createHash('sha256').update(x[1]).digest('base64')}'`);
    }
  } catch (e) { inlineHashes = []; }
  return inlineHashes;
}
const httpsPublic = /^https:/i.test(config.publicUrl || '');
app.use((req, res, next) => {
  const scriptSrc = ["'self'", ...(config.allowInlineScripts ? ["'unsafe-inline'"] : scriptHashes()), 'https://checkout.razorpay.com', 'https://connect.facebook.net'].join(' ');
  res.set({
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=(self "https://checkout.razorpay.com"), usb=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',     // popups are needed for Facebook / Razorpay flows
    'Cross-Origin-Resource-Policy': 'same-origin',
    // Razorpay Checkout + Facebook SDK (WhatsApp Embedded Signup) are allowed explicitly. No inline scripts (hash only), no plugins, no <base> hijack.
    'Content-Security-Policy': `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self' https://*.razorpay.com https://*.facebook.com https://graph.facebook.com; frame-src https://*.razorpay.com https://*.facebook.com https://*.facebook.net; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://*.razorpay.com`,
  });
  if (config.isProduction || httpsPublic) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (config.corsOrigin && req.path.startsWith('/api/')) {
    res.set({ 'Access-Control-Allow-Origin': config.corsOrigin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', Vary: 'Origin' });
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});

/* public endpoints */
app.get('/health', async (req, res) => {
  try { await one('SELECT 1'); res.json(config.isProduction ? { ok: true } : { ok: true, storage: Storage.DRIVER, realtime: events.status() }); }   // no internals on a public server
  catch (e) { res.status(503).json({ ok: false }); }
});
app.use('/webhooks/whatsapp', hooks.meta);      // raw body (signature check)
app.use('/webhooks/razorpay', billing.webhook);
app.use('/hooks', hooks.hooks);

/* Uploaded files. Names are 96-bit random (unguessable). Everything is served with a type WE choose from the extension, never one the uploader supplied,
   with nosniff + a sandboxing CSP, and anything that isn't plain media is forced to download — so an uploaded file can never run script on our origin. */
const INLINE_OK = /^(image\/(jpeg|png)|video\/(mp4|3gpp)|audio\/|application\/pdf$)/;
app.get('/uploads/:name', wrap(async (req, res) => {
  const name = req.params.name;
  if (!/^[a-f0-9]{24}(\.[a-z0-9]{1,8})?$/.test(name)) return res.sendStatus(404);
  const m = await one(`SELECT id, mime, path, storage, name FROM media WHERE path=$1 OR path LIKE $2 LIMIT 1`, [name, '%/' + name]);
  if (!m) return res.sendStatus(404);
  let buf; try { buf = await Storage.read(m); } catch (e) { return res.sendStatus(e.status === 410 ? 404 : 502); }
  const type = Storage.mimeForName(name);
  const inline = INLINE_OK.test(type);
  res.set({
    'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'; style-src 'unsafe-inline'",
    'Cache-Control': 'private, max-age=86400', 'Content-Disposition': (inline ? 'inline' : 'attachment') + `; filename="${String(m.name || name).replace(/[^\w.\- ]/g, '_').slice(0, 80)}"`,
  });
  res.send(buf);
}));
/* Cron-driven worker for hosts without always-on background processes (Hostinger shared/cloud):
   call every minute with the header  x-cron-key: CRON_SECRET  (the ?key= form still works but ends up in access logs) */
const safeEq = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); };
app.get('/cron/run', limiter({ windowMs: 60e3, max: 30, key: req => 'cron|' + req.ip }), wrap(async (req, res) => {
  if (!process.env.CRON_SECRET || !safeEq(req.headers['x-cron-key'] || req.query.key, process.env.CRON_SECRET)) return res.sendStatus(404);
  const until = Date.now() + Math.min(100, +(req.query.seconds || 50)) * 1000; let ticks = 0, work = 0;
  do { const n = await worker.tick(); ticks++; work += n; if (!n) break; } while (Date.now() < until);
  res.json({ ok: true, ticks, work });
}));

/* authenticated API */
app.use('/api/v1', express.json({ limit: '2mb' }));
/* brute-force / abuse brakes (per server instance): auth endpoints per IP, then everything else per signed-in user */
app.use('/api/v1/auth', limiter({ windowMs: 60e3, max: 60, key: req => 'auth|' + req.ip }), auth.router);
const perUser = limiter({ windowMs: 60e3, max: +(process.env.API_RATE_LIMIT || 600), key: req => req.user ? 'u|' + req.user.id : null });
const afterAuth = (req, res, next) => perUser(req, res, next);
app.use('/api/v1/platform', auth.authenticate, afterAuth, admin.platform);
app.use('/api/v1/billing', auth.authenticate, afterAuth, billing.router);
app.use('/api/v1/settings', auth.authenticate, afterAuth, auth.enforceBilling, admin.settings);
app.use('/api/v1/team', auth.authenticate, afterAuth, auth.enforceBilling, admin.team);
app.use('/api/v1', auth.authenticate, afterAuth, auth.requireTenant, auth.enforceBilling, api.router);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

/* web app */
/* Angular build: content-hashed chunks are immutable; index.html must always be revalidated */
app.use(express.static(pub, { index: false, setHeaders: (res, file) => res.setHeader('Cache-Control', /-[A-Za-z0-9_]{8}\.(js|css)$/.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache') }));
app.get('*', (req, res) => {
  if (/\.[a-z0-9]{2,5}$/i.test(req.path)) return res.status(404).send('Not found'); // missing asset (e.g. an old chunk after a redeploy) — never answer with HTML
  const f = path.join(pub, 'index.html');
  res.setHeader('Cache-Control', 'no-cache');
  if (fs.existsSync(f)) res.sendFile(f); else res.status(404).send('Web app not built. Run: npm run build:web');
});

/* errors */
app.use((err, req, res, next) => {
  const status = err.status || (err.type === 'entity.too.large' ? 413 : err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 && config.isProduction ? 'Something went wrong' : err.message, ...(err.publicCode ? { code: err.publicCode } : {}) });
});

async function bootstrap() {
  await migrate();
  const email = process.env.SUPER_ADMIN_EMAIL, password = process.env.SUPER_ADMIN_PASSWORD;
  if (email && password && !(await one(`SELECT 1 FROM users WHERE role='super_admin'`))) {
    await q(`INSERT INTO users(name, email, password_hash, role) VALUES ($1,$2,$3,'super_admin')`, [process.env.SUPER_ADMIN_NAME || 'K3 Solutions', email.toLowerCase(), await auth.hash(password)]);
    console.log('super admin created:', email);
  }
  // Forgot the platform admin password? Set SUPER_ADMIN_RESET=true, redeploy/restart once, sign in, then remove it.
  if (email && password && process.env.SUPER_ADMIN_RESET === 'true') {
    const u = await one(`SELECT id FROM users WHERE lower(email)=$1`, [email.toLowerCase()]);
    if (u) await q(`UPDATE users SET password_hash=$2, role='super_admin', tenant_id=NULL, active=true WHERE id=$1`, [u.id, await auth.hash(password)]);
    else await q(`INSERT INTO users(name, email, password_hash, role) VALUES ($1,$2,$3,'super_admin')`, [process.env.SUPER_ADMIN_NAME || 'K3 Solutions', email.toLowerCase(), await auth.hash(password)]);
    console.log('super admin password reset for', email);
  }
  await events.start();
  app.listen(config.port, () => console.log(`K3 CRM listening on :${config.port} (${config.publicUrl}) · storage=${Storage.DRIVER} · realtime=${events.backplane ? 'postgres' : 'local'}`));
  if (config.workerEnabled) await worker.start();
}
if (require.main === module) bootstrap().catch(e => { console.error(e); process.exit(1); });
module.exports = { app, bootstrap };
