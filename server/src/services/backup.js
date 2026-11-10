/* Automated database backups.
   Daily gzip'd JSON-lines snapshot of every CRM table (no pg_dump needed — works on shared hosting).
   Destination: BACKUP_S3_BUCKET (or S3_BUCKET when STORAGE_DRIVER=s3) under "backups/", else BACKUP_DIR on disk.
   Env: BACKUP_ENABLED (true), BACKUP_HOUR_UTC (21 → 02:30 IST), BACKUP_KEEP_DAYS (14), BACKUP_INCLUDE_MEDIA (true). */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { pipeline } = require('stream/promises');
const { pool, q, one, config } = require('../core');
const Storage = require('./storage');

const TABLES = ['plans', 'tenants', 'users', 'platform_settings', 'counters', 'leads', 'media', 'messages', 'notes', 'timeline', 'followups',
  'templates', 'sequences', 'enrollments', 'broadcasts', 'broadcast_recipients', 'payments'];
const env = (k, d) => (process.env[k] !== undefined && process.env[k] !== '' ? process.env[k] : d);
const dir = () => { const d = path.resolve(env('BACKUP_DIR', path.join(config.uploadDir, '..', 'backups'))); fs.mkdirSync(d, { recursive: true, mode: 0o700 }); return d; };   // backups hold every school's data — owner-only
const s3Bucket = () => env('BACKUP_S3_BUCKET', (process.env.STORAGE_DRIVER || '').toLowerCase() === 's3' ? process.env.S3_BUCKET : '');
const PREFIX = 'backups/';
let running = null;

const encRow = row => { const o = {}; for (const k in row) o[k] = Buffer.isBuffer(row[k]) ? { $b64: row[k].toString('base64') } : row[k]; return o; };
async function create() {
  if (running) return running;
  running = (async () => {
    const started = Date.now(); const name = `k3crm-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.jsonl.gz`;
    const file = path.join(dir(), name); const counts = {};
    const c = await pool.connect();
    try {
      const gz = zlib.createGzip(); const out = fs.createWriteStream(file, { mode: 0o600 }); const done = pipeline(gz, out);
      const write = obj => new Promise(r => (gz.write(JSON.stringify(obj) + '\n') ? r() : gz.once('drain', r)));
      await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await write({ k3backup: 1, createdAt: new Date().toISOString(), tables: TABLES });
      for (const t of TABLES) {
        const cols = t === 'media' && env('BACKUP_INCLUDE_MEDIA', 'true') !== 'true' ? 'id, tenant_id, wa_media_id, name, mime, type, size, path, created_at, wa_uploaded_at, storage' : '*';
        await c.query(`DECLARE cur NO SCROLL CURSOR FOR SELECT ${cols} FROM ${t}`); counts[t] = 0;
        for (;;) { const r = await c.query('FETCH 500 FROM cur'); if (!r.rows.length) break; for (const row of r.rows) await write({ t, r: encRow(row) }); counts[t] += r.rows.length; }
        await c.query('CLOSE cur');
      }
      await c.query('COMMIT'); gz.end(); await done;
    } catch (e) { await c.query('ROLLBACK').catch(() => {}); try { fs.unlinkSync(file); } catch (x) { /* */ } throw e; }
    finally { c.release(); }
    const size = fs.statSync(file).size; let destination = 'disk';
    if (s3Bucket()) { await Storage.s3Put(s3Bucket(), PREFIX + name, fs.readFileSync(file), 'application/gzip'); destination = 's3://' + s3Bucket() + '/' + PREFIX + name; }
    await prune();
    const status = { lastRunAt: new Date().toISOString(), ok: true, name, size, destination, counts, seconds: Math.round((Date.now() - started) / 1000) };
    await q(`INSERT INTO platform_settings(key, value) VALUES ('backup_status', $1) ON CONFLICT (key) DO UPDATE SET value=$1`, [status]);
    console.log('backup created', name, size, 'bytes →', destination);
    return status;
  })().catch(async e => {
    const status = { lastRunAt: new Date().toISOString(), ok: false, error: e.message };
    await q(`INSERT INTO platform_settings(key, value) VALUES ('backup_status', $1) ON CONFLICT (key) DO UPDATE SET value=$1`, [status]).catch(() => {});
    console.error('backup failed', e); throw e;
  }).finally(() => { running = null; });
  return running;
}

async function prune() {
  const keepMs = +env('BACKUP_KEEP_DAYS', 14) * 864e5; const cutoff = Date.now() - keepMs;
  for (const f of fs.readdirSync(dir())) if (f.endsWith('.jsonl.gz') && fs.statSync(path.join(dir(), f)).mtimeMs < cutoff) fs.unlinkSync(path.join(dir(), f));
  if (s3Bucket()) for (const o of await Storage.s3List(s3Bucket(), PREFIX)) if (new Date(o.modified).getTime() < cutoff) await Storage.s3Delete(s3Bucket(), o.key);
}

async function list() {
  const items = new Map();
  for (const f of fs.readdirSync(dir())) if (f.endsWith('.jsonl.gz')) { const st = fs.statSync(path.join(dir(), f)); items.set(f, { name: f, size: st.size, createdAt: st.mtime, local: true, s3: false }); }
  if (s3Bucket()) { try { for (const o of await Storage.s3List(s3Bucket(), PREFIX)) { const n = o.key.slice(PREFIX.length); items.set(n, Object.assign(items.get(n) || { name: n, size: o.size, createdAt: o.modified, local: false }, { s3: true })); } } catch (e) { console.warn('backup list s3', e.message); } }
  const status = await one(`SELECT value FROM platform_settings WHERE key='backup_status'`);
  return { backups: [...items.values()].sort((a, b) => String(b.name).localeCompare(a.name)), status: status ? status.value : null,
    destination: s3Bucket() ? `S3 bucket “${s3Bucket()}” (backups/)` : `Server disk (${dir()})`,
    warning: s3Bucket() ? null : 'Backups are stored on this server’s own disk. On Railway/Render/Heroku-style hosts the disk is wiped on every deploy — attach a volume or set BACKUP_S3_BUCKET so backups survive.', keepDays: +env('BACKUP_KEEP_DAYS', 14), enabled: env('BACKUP_ENABLED', 'true') === 'true', hourUtc: +env('BACKUP_HOUR_UTC', 21) };
}
async function openStream(name) {
  name = path.basename(name); if (!/^k3crm-[\w-]+\.jsonl\.gz$/.test(name)) throw Object.assign(new Error('Invalid backup name'), { status: 400 });
  const f = path.join(dir(), name); if (fs.existsSync(f)) return fs.createReadStream(f);
  if (s3Bucket()) return Storage.s3GetStream(s3Bucket(), PREFIX + name);
  throw Object.assign(new Error('Backup not found'), { status: 404 });
}

/* called from the worker tick (also on cron-driven hosts) — runs at most once a day, one server at a time */
async function maybeRun() {
  if (env('BACKUP_ENABLED', 'true') !== 'true' || running) return;
  const s = await one(`SELECT value FROM platform_settings WHERE key='backup_status'`); const last = s && s.value.lastRunAt ? new Date(s.value.lastRunAt).getTime() : 0;
  const age = Date.now() - last; const hourOk = new Date().getUTCHours() === +env('BACKUP_HOUR_UTC', 21);
  if (!((hourOk && age > 20 * 36e5) || age > 26 * 36e5)) return;
  const lock = await one(`SELECT pg_try_advisory_lock(73001) AS ok`); if (!lock.ok) return;
  try { await create(); } catch (e) { /* recorded in status */ } finally { await q(`SELECT pg_advisory_unlock(73001)`).catch(() => {}); }
}

/* restore (used by scripts/restore-backup.js) */
async function restore(input) {
  const rl = readline.createInterface({ input: input.pipe(zlib.createGunzip()), crlfDelay: Infinity });
  const c = await pool.connect(); const types = {}; const counts = {}; let header = null; let batch = []; let cur = null;
  const dec = v => (v && typeof v === 'object' && v.$b64 !== undefined ? Buffer.from(v.$b64, 'base64') : v);
  const flush = async () => {
    if (!batch.length) return; const t = cur; const cols = Object.keys(batch[0]);
    const vals = []; const rowsSql = batch.map(r => '(' + cols.map(col => { let v = dec(r[col]); if (types[t][col] === 'jsonb' && v !== null && !Buffer.isBuffer(v)) v = JSON.stringify(v); vals.push(v); return '$' + vals.length; }).join(',') + ')');
    await c.query(`INSERT INTO ${t} (${cols.map(x => '"' + x + '"').join(',')}) VALUES ${rowsSql.join(',')}`, vals); counts[t] = (counts[t] || 0) + batch.length; batch = [];
  };
  try {
    await c.query('BEGIN');
    for await (const line of rl) {
      if (!line.trim()) continue; const o = JSON.parse(line);
      if (!header) { if (!o.k3backup) throw new Error('Not a K3 CRM backup file'); header = o;
        await c.query(`TRUNCATE ${TABLES.join(', ')} CASCADE`);
        for (const t of TABLES) { types[t] = {}; (await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1`, [t])).rows.forEach(x => { types[t][x.column_name] = x.data_type; }); }
        continue; }
      if (o.t !== cur || batch.length >= 200) { await flush(); cur = o.t; }
      batch.push(o.r);
    }
    await flush();
    await c.query(`SELECT setval('timeline_id_seq', GREATEST(1, (SELECT COALESCE(max(id), 1) FROM timeline)))`);
    await c.query('COMMIT');
    return { createdAt: header && header.createdAt, counts };
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; } finally { c.release(); }
}

module.exports = { create, list, openStream, maybeRun, restore, TABLES };
