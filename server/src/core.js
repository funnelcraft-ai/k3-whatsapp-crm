/* Core: config, database, crypto, realtime events, shared constants & helpers */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool, types } = require('pg');

types.setTypeParser(1700, v => (v == null ? null : parseFloat(v))); // numeric → number
types.setTypeParser(20, v => (v == null ? null : parseInt(v, 10)));  // bigint (count) → number

/* ---------------- Config ---------------- */
const env = (k, d) => (process.env[k] !== undefined && process.env[k] !== '' ? process.env[k] : d);
const config = {
  port: +env('PORT', 8080),
  databaseUrl: env('DATABASE_URL', 'postgres://k3:k3pass@localhost:5432/k3crm'),
  dbSsl: env('DATABASE_SSL', 'false') === 'true',
  jwtSecret: env('JWT_SECRET', ''),
  encryptionKey: env('ENCRYPTION_KEY', ''),
  publicUrl: env('PUBLIC_URL', 'http://localhost:8080').replace(/\/$/, ''),
  uploadDir: path.resolve(env('UPLOAD_DIR', path.join(__dirname, '..', 'uploads'))),
  graphBase: env('GRAPH_API_BASE', 'https://graph.facebook.com').replace(/\/$/, ''),
  graphVersion: env('GRAPH_API_VERSION', 'v23.0'),
  metaAppId: env('META_APP_ID', ''),
  metaAppSecret: env('META_APP_SECRET', ''),
  metaVerifyToken: env('META_VERIFY_TOKEN', ''),
  anthropicKey: env('ANTHROPIC_API_KEY', ''),
  aiModel: env('AI_MODEL', 'claude-haiku-5-5'),
  defaultCountryCode: env('DEFAULT_COUNTRY_CODE', '91'),
  workerEnabled: env('WORKER_ENABLED', 'true') === 'true',
  workerIntervalMs: +env('WORKER_INTERVAL_MS', 5000),
  sendRatePerTick: +env('SEND_RATE_PER_TICK', 40),
  corsOrigin: env('CORS_ORIGIN', ''),
  eventsBackplane: env('EVENTS_BACKPLANE', 'local').toLowerCase(),
  nodeEnv: env('NODE_ENV', 'development'),
  // number of reverse-proxy hops in front of the app (Railway / Caddy / Hostinger = 1). Needed for correct client IPs (login lockouts, audit log).
  trustProxy: env('TRUST_PROXY', '1'),
  allowInlineScripts: env('CSP_ALLOW_INLINE', 'false') === 'true',
};
/* Treat the app as "production" when NODE_ENV says so OR when it is clearly running on a public host —
   so a forgotten NODE_ENV can never leave a public site on well-known development secrets. */
config.isProduction = config.nodeEnv === 'production' || /^https:\/\//i.test(config.publicUrl) || !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_PROJECT_ID);
const DEV_SECRETS = ['dev-jwt-secret-change-me', 'dev-encryption-key-change-me'];
if (!config.jwtSecret || !config.encryptionKey || DEV_SECRETS.includes(config.jwtSecret) || DEV_SECRETS.includes(config.encryptionKey)) {
  if (config.isProduction && process.env.ALLOW_INSECURE_DEV !== 'true') {
    console.error('FATAL: JWT_SECRET and ENCRYPTION_KEY must be set to long random values (generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"). Refusing to start with development defaults on a public deployment.');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SECRET / ENCRYPTION_KEY not set — using insecure development defaults. Never do this on a public server.');
  config.jwtSecret = config.jwtSecret || DEV_SECRETS[0];
  config.encryptionKey = config.encryptionKey || DEV_SECRETS[1];
}
if (config.isProduction && (config.jwtSecret.length < 32 || config.encryptionKey.length < 32)) console.warn('⚠️  JWT_SECRET / ENCRYPTION_KEY are shorter than 32 characters — rotate them to 64 random hex characters (rotating JWT_SECRET signs everyone out; ENCRYPTION_KEY must NOT change after go-live).');
fs.mkdirSync(config.uploadDir, { recursive: true });

/* ---------------- Database ---------------- */
// With DATABASE_SSL=true the TLS settings below win (works with Neon / Supabase / Railway poolers)
const dbUrl = config.dbSsl ? config.databaseUrl.replace(/([?&])(sslmode|ssl|sslrootcert)=[^&]*&?/g, '$1').replace(/[?&]$/, '') : config.databaseUrl;
const pool = new Pool({ connectionString: dbUrl, ssl: config.dbSsl ? { rejectUnauthorized: false } : undefined, max: +env('DB_POOL_MAX', 10), idleTimeoutMillis: 30000 });
pool.on('error', e => console.error('db pool error', e.message));
const q = (text, params) => pool.query(text, params);
const one = async (text, params) => (await pool.query(text, params)).rows[0] || null;
const many = async (text, params) => (await pool.query(text, params)).rows;
async function tx(fn) {
  const c = await pool.connect();
  try { await c.query('BEGIN'); const r = await fn(c); await c.query('COMMIT'); return r; }
  catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { c.release(); }
}
async function migrate() {
  await q(`CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, run_at timestamptz NOT NULL DEFAULT now())`);
  const dir = path.join(__dirname, 'migrations');
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
    if (await one('SELECT 1 FROM _migrations WHERE name=$1', [f])) continue;
    await tx(async c => { await c.query(fs.readFileSync(path.join(dir, f), 'utf8')); await c.query('INSERT INTO _migrations(name) VALUES ($1)', [f]); });
    console.log('migrated', f);
  }
}

/* ---------------- Secrets at rest (AES-256-GCM) ---------------- */
const KEY = crypto.createHash('sha256').update(config.encryptionKey).digest();
function encrypt(plain) {
  if (plain == null || plain === '') return null;
  const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  return [iv.toString('base64'), c.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}
function decrypt(blob) {
  if (!blob) return '';
  try { const [iv, tag, enc] = blob.split('.').map(s => Buffer.from(s, 'base64')); const d = crypto.createDecipheriv('aes-256-gcm', KEY, iv); d.setAuthTag(tag); return Buffer.concat([d.update(enc), d.final()]).toString('utf8'); }
  catch (e) { console.error('decrypt failed'); return ''; }
}

/* ---------------- Realtime (Server-Sent Events) ----------------
   Each server keeps its own browser connections. With EVENTS_BACKPLANE=postgres, events are also
   published through PostgreSQL LISTEN/NOTIFY so every server instance delivers them (multi-server setups).
   Needs a direct (non-transaction-pooled) database connection. */
const { Client } = require('pg');
const INSTANCE = crypto.randomBytes(6).toString('hex');
const CHANNEL = 'k3_events';
const clients = new Map(); // tenantId -> Set(res)
function deliver(tenantId, type, data) {
  const set = clients.get(tenantId); if (!set) return;
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const r of set) { try { r.write(payload); } catch (e) { /* closed */ } }
}
let listener = null, backplaneUp = false;
async function startListener() {
  try {
    listener = new Client({ connectionString: dbUrl, ssl: config.dbSsl ? { rejectUnauthorized: false } : undefined });
    listener.on('notification', async n => {
      try {
        const m = JSON.parse(n.payload); if (m.i === INSTANCE) return;
        if (m.o) { const row = await one(`SELECT tenant_id, type, data FROM event_outbox WHERE id=$1`, [m.o]); if (row) deliver(row.tenant_id, row.type, row.data); }
        else deliver(m.t, m.y, m.d);
      } catch (e) { console.error('backplane message', e.message); }
    });
    const retry = () => { backplaneUp = false; try { listener.removeAllListeners(); listener.end().catch(() => {}); } catch (e) { /* */ } setTimeout(startListener, 2000); };
    listener.on('error', e => { console.error('backplane error', e.message); retry(); });
    await listener.connect(); await listener.query(`LISTEN ${CHANNEL}`); backplaneUp = true;
    console.log('realtime backplane: PostgreSQL LISTEN/NOTIFY');
  } catch (e) { console.error('backplane connect failed', e.message); setTimeout(startListener, 5000); }
}
const events = {
  backplane: config.eventsBackplane === 'postgres',
  async start() {
    if (!this.backplane) return;
    await startListener();
    setInterval(() => q(`DELETE FROM event_outbox WHERE created_at < now() - interval '1 hour'`).catch(() => {}), 10 * 60e3).unref();
  },
  add(tenantId, res) { if (!clients.has(tenantId)) clients.set(tenantId, new Set()); clients.get(tenantId).add(res); res.on('close', () => clients.get(tenantId) && clients.get(tenantId).delete(res)); },
  emit(tenantId, type, data) {
    deliver(tenantId, type, data);
    if (!this.backplane) return;
    const msg = JSON.stringify({ i: INSTANCE, t: tenantId, y: type, d: data });
    (msg.length < 7500 ? q(`SELECT pg_notify($1, $2)`, [CHANNEL, msg])
      : one(`INSERT INTO event_outbox(tenant_id, type, data) VALUES ($1,$2,$3) RETURNING id`, [tenantId, type, data]).then(r => q(`SELECT pg_notify($1, $2)`, [CHANNEL, JSON.stringify({ i: INSTANCE, o: r.id })])))
      .catch(e => console.error('backplane publish', e.message));
  },
  status: () => ({ backplane: events.backplane ? (backplaneUp ? 'postgres' : 'postgres (reconnecting)') : 'local', instance: INSTANCE }),
};
setInterval(() => { for (const set of clients.values()) for (const r of set) { try { r.write(': ping\n\n'); } catch (e) { /* */ } } }, 25000).unref();

/* ---------------- Constants & helpers ---------------- */
const STAGES = ['new', 'contacted', 'counselling', 'visit', 'application', 'admitted', 'lost'];
const STAGE_LABEL = { new: 'New enquiry', contacted: 'Contacted', counselling: 'Counselling', visit: 'Campus visit', application: 'Application', admitted: 'Admitted', lost: 'Lost' };
const SOURCES = ['Meta Ads', 'Google Ads', 'Website Form', 'Walk-in', 'Referral', 'JustDial', 'Event / Seminar', 'WhatsApp'];
const DEFAULT_PROGRAMS = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11 – Science', 'Class 11 – Commerce', 'Class 11 – Humanities'];
const COLORS = ['#1a73e8', '#188038', '#e37400', '#9334e6', '#d93025', '#12a4af', '#c2185b', '#5f6368'];

function normalizePhone(input, cc = config.defaultCountryCode) {
  let d = String(input || '').replace(/[^\d]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = cc + d;
  if (d.length < 8 || d.length > 15) return null;
  return d;
}
function displayPhone(waId) {
  if (waId.startsWith('91') && waId.length === 12) return `+91 ${waId.slice(2, 7)} ${waId.slice(7)}`;
  return '+' + waId;
}
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const initials = n => String(n || '?').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();

/* ---------------- Media files (disk cache + database copy) ---------------- */
const fileName = p => path.basename(String(p || ''));
const localPath = row => path.join(config.uploadDir, fileName(row.path));
async function ensureLocalFile(row) {
  const p = localPath(row);
  if (fs.existsSync(p)) return p;
  const r = row.data ? row : await one(`SELECT data FROM media WHERE id=$1`, [row.id]);
  if (!r || !r.data) throw new HttpError(410, 'Media file is no longer available');
  fs.writeFileSync(p, r.data); return p;
}

module.exports = { fileName, localPath, ensureLocalFile, config, pool, q, one, many, tx, migrate, encrypt, decrypt, events, STAGES, STAGE_LABEL, SOURCES, DEFAULT_PROGRAMS, COLORS, normalizePhone, displayPhone, HttpError, wrap, initials };
