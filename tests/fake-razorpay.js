/* Minimal fake of the Razorpay API for tests (RAZORPAY_API_BASE=http://localhost:9098/v1) */
const http = require('http'); const PORT = +process.env.FAKE_RZP_PORT || 9098;
const db = { plans: {}, subs: {}, orders: {} }; const log = []; let n = 0;
http.createServer((req, res) => {
  let body = ''; req.on('data', c => (body += c)); req.on('end', () => {
    const p = req.url.replace(/^\/v1/, ''); const j = body ? JSON.parse(body) : {}; log.push({ method: req.method, path: p, json: j });
    const send = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    if (p === '/__log') return send(200, log);
    if (req.headers.authorization !== 'Basic ' + Buffer.from('rzp_test_K3:rzp_secret_K3').toString('base64')) return send(401, { error: { description: 'Authentication failed' } });
    const now = Math.floor(Date.now() / 1000); let m;
    if (req.method === 'POST' && p === '/plans') { const id = 'plan_' + (++n); db.plans[id] = j; return send(200, Object.assign({ id }, j)); }
    if (req.method === 'POST' && p === '/subscriptions') { const id = 'sub_' + (++n); db.subs[id] = Object.assign({ id, status: 'created' }, j); return send(200, Object.assign({ short_url: 'https://rzp.io/i/' + id }, db.subs[id])); }
    if (req.method === 'GET' && (m = p.match(/^\/subscriptions\/(\w+)$/))) { const s = db.subs[m[1]]; if (!s) return send(404, { error: { description: 'not found' } }); return send(200, Object.assign({}, s, { status: 'active', current_start: now, current_end: now + 30 * 86400 })); }
    if (req.method === 'POST' && (m = p.match(/^\/subscriptions\/(\w+)\/cancel$/))) { db.subs[m[1]].status = 'cancelled'; return send(200, db.subs[m[1]]); }
    if (req.method === 'POST' && p === '/orders') { const id = 'order_' + (++n); db.orders[id] = Object.assign({ id, status: 'created' }, j); return send(200, db.orders[id]); }
    if (req.method === 'GET' && (m = p.match(/^\/orders\/(\w+)$/))) return send(200, db.orders[m[1]]);
    send(404, { error: { description: 'fake: no route ' + p } });
  });
}).listen(PORT, () => console.log('fake razorpay on', PORT));
