/* Small in-memory rate limiter (per server instance). key(req) → bucket; sends 429 + Retry-After when exceeded. */
const { HttpError } = require('../core');

function limiter({ windowMs, max, key, message = 'Too many requests. Please slow down.' }) {
  const hits = new Map();
  const sweep = setInterval(() => { const now = Date.now(); for (const [k, a] of hits) { const keep = a.filter(t => now - t < windowMs); if (keep.length) hits.set(k, keep); else hits.delete(k); } }, Math.max(30e3, windowMs)).unref();
  const mw = (req, res, next) => {
    const k = key(req); if (k == null) return next();
    const now = Date.now(); const a = (hits.get(k) || []).filter(t => now - t < windowMs);
    if (a.length >= max) { res.set('Retry-After', String(Math.ceil((windowMs - (now - a[0])) / 1000))); return next(new HttpError(429, message)); }
    a.push(now); hits.set(k, a); next();
  };
  mw.sweep = sweep; return mw;
}

/* Failure counter (for login lockouts): count only failures, reset on success. */
function failureCounter({ windowMs, max }) {
  const fails = new Map();
  const live = k => { const now = Date.now(); const a = (fails.get(k) || []).filter(t => now - t < windowMs); if (a.length) fails.set(k, a); else fails.delete(k); return a; };
  setInterval(() => { for (const k of [...fails.keys()]) live(k); }, Math.max(60e3, windowMs)).unref();
  return {
    blocked: k => live(k).length >= max,
    retryAfter: k => { const a = live(k); return a.length ? Math.max(1, Math.ceil((windowMs - (Date.now() - a[0])) / 1000)) : 0; },
    fail: k => { const a = live(k); a.push(Date.now()); fails.set(k, a); },
    reset: k => fails.delete(k),
  };
}
module.exports = { limiter, failureCounter };
