/* TOTP two-factor authentication (RFC 6238 / RFC 4226) — no external dependencies.
   Works with Google Authenticator, Microsoft Authenticator, Authy, 1Password, etc. */
const crypto = require('crypto');

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32encode(buf) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) { value = (value << 8) | byte; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
function b32decode(str) {
  let bits = 0, value = 0; const out = [];
  for (const ch of String(str).toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')) {
    const i = B32.indexOf(ch); if (i < 0) throw new Error('Invalid base32');
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

const generateSecret = () => b32encode(crypto.randomBytes(20));          // 160-bit secret, 32 base32 chars

function code(secret, step, digits = 6) {
  const key = b32decode(secret); const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(step));
  const h = crypto.createHmac('sha1', key).update(buf).digest(); const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 10 ** digits).padStart(digits, '0');
}
const stepAt = (ms = Date.now(), period = 30) => Math.floor(ms / 1000 / period);

/* Returns the matched time step (so the caller can store it and refuse replays), or null. Accepts ±1 step of clock drift. */
function verify(secret, token, { lastStep = 0, now = Date.now(), window = 1 } = {}) {
  const t = String(token || '').replace(/\s+/g, ''); if (!/^\d{6}$/.test(t)) return null;
  const cur = stepAt(now);
  for (let d = -window; d <= window; d++) {
    const s = cur + d; if (s <= lastStep) continue;
    const c = code(secret, s); if (c.length === t.length && crypto.timingSafeEqual(Buffer.from(c), Buffer.from(t))) return s;
  }
  return null;
}

const otpauthUrl = (secret, account, issuer = 'K3 Admissions CRM') => `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

/* Recovery codes: shown once, stored only as SHA-256 hashes */
const newRecoveryCodes = (n = 8) => Array.from({ length: n }, () => { const r = crypto.randomBytes(5).toString('hex'); return r.slice(0, 5) + '-' + r.slice(5); });
const hashRecovery = c => crypto.createHash('sha256').update(String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '')).digest('hex');

module.exports = { generateSecret, verify, code, stepAt, otpauthUrl, newRecoveryCodes, hashRecovery, b32encode, b32decode };
