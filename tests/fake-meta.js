/* Minimal fake of Meta Graph API for end-to-end tests (GRAPH_API_BASE=http://localhost:9099) */
const http = require('http');
const PORT = +process.env.FAKE_META_PORT || 9099;
const log = []; let n = 0; const tries = {}; const expired = new Set();
const templates = [
  { id: 'tpl1', name: 'welcome_enquiry', status: 'APPROVED', category: 'UTILITY', language: 'en', components: [{ type: 'BODY', text: 'Hi {{1}}, thanks for your enquiry about {{2}}.' }, { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Book visit' }] }] },
  { id: 'tpl2', name: 'open_house_invite', status: 'APPROVED', category: 'MARKETING', language: 'en', components: [{ type: 'HEADER', format: 'IMAGE' }, { type: 'BODY', text: 'Dear {{1}}, join our Open House for {{2}}!' }] },
  { id: 'tpl3', name: 'campus_visit_invite', status: 'APPROVED', category: 'MARKETING', language: 'en', components: [{ type: 'BODY', text: 'Dear {{1}}, visit our campus for {{2}}.' }] },
  { id: 'tpl5', name: 'fee_reminder', status: 'APPROVED', category: 'UTILITY', language: 'en', components: [{ type: 'BODY', text: 'Dear parent of {{1}}, roll no {{2}} has a pending fee of {{3}}. Please pay soon.' }] },
  { id: 'tpl4', name: 'fee_structure_share', status: 'PENDING', category: 'UTILITY', language: 'en', components: [{ type: 'BODY', text: 'Fees for {{2}}, {{1}}.' }] },
];
const server = http.createServer((req, res) => {
  let body = []; req.on('data', c => body.push(c)); req.on('end', () => {
    body = Buffer.concat(body); const u = new URL(req.url, 'http://x'); const p = u.pathname.replace(/^\/v\d+\.\d+/, '');
    let json = null; try { json = JSON.parse(body.toString()); } catch (e) { /* multipart or empty */ }
    log.push({ method: req.method, path: p, json, auth: req.headers.authorization });
    const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (p === '/__log') return send(200, log);
    if (p === '/__reset') { log.length = 0; for (const k in tries) delete tries[k]; return send(200, {}); }
    if (p === '/__expire') { expired.add(u.searchParams.get('id')); return send(200, {}); }
    if (req.method === 'GET' && p === '/oauth/access_token') return u.searchParams.get('code') === 'GOODCODE' && u.searchParams.get('client_secret') === 'meta_secret_K3' ? send(200, { access_token: 'TEST_TOKEN', token_type: 'bearer' }) : send(400, { error: { message: 'Invalid verification code', code: 100 } });
    if (req.headers.authorization !== 'Bearer TEST_TOKEN' && !(req.headers.authorization || '').startsWith('OAuth') && !p.startsWith('/file')) return send(401, { error: { message: 'Invalid OAuth access token', code: 190 } });
    let m;
    if (req.method === 'POST' && (m = p.match(/^\/(\w+)\/messages$/))) {
      if (json && json.status === 'read') return send(200, { success: true });
      if (json && json.to === '910000000000') return send(400, { error: { message: '(#131030) Recipient phone number not in allowed list', code: 131030 } });
      // reliability scenarios
      const t = tries[json.to] = (tries[json.to] || 0) + 1;
      if (json.to === '919999900001' && t <= 2) return send(429, { error: { message: '(#130429) Rate limit hit', code: 130429 } });
      if (json.to === '919999900002') return send(400, { error: { message: '(#131026) Message undeliverable', code: 131026 } });
      if (json.to === '919999900003') return send(503, { error: { message: 'Service temporarily unavailable', code: 131016 } });
      if (json.to === '919999900004' && t <= 2) return send(500, { error: { message: 'Something went wrong', code: 131000 } });
      const hdr = json.template && (json.template.components || []).find(c => c.type === 'header');
      const mid = hdr && hdr.parameters[0][hdr.parameters[0].type] && hdr.parameters[0][hdr.parameters[0].type].id;
      if (mid && expired.has(mid)) return send(400, { error: { message: '(#131053) Media upload error: media id not found', code: 131053 } });
      const id = 'wamid.T' + Date.now() + '.' + (++n); log[log.length - 1].ret = id;
      return send(200, { messaging_product: 'whatsapp', contacts: [{ wa_id: json.to }], messages: [{ id }] });
    }
    if (req.method === 'POST' && /^\/\w+\/subscribed_apps$/.test(p)) return send(200, { success: true });
    if (req.method === 'POST' && /^\/\w+\/register$/.test(p)) return send(200, { success: true });
    if (req.method === 'POST' && /^\/\w+\/media$/.test(p)) return send(200, { id: 'MEDIA' + (++n) });
    if (req.method === 'GET' && /^\/PNID\d+$/.test(p)) return send(200, { display_phone_number: '+91 82404 72003', verified_name: 'Greenfield Academy', quality_rating: 'GREEN' });
    if (req.method === 'GET' && /^\/\w+\/message_templates$/.test(p)) return send(200, { data: templates });
    if (req.method === 'POST' && /^\/\w+\/message_templates$/.test(p)) return send(200, { id: 'newtpl' + (++n), status: 'PENDING', category: json.category });
    if (req.method === 'POST' && /^\/\w+\/uploads$/.test(p)) return send(200, { id: 'upload:abc' });
    if (req.method === 'POST' && p.startsWith('/upload:')) return send(200, { h: 'HANDLE123' });
    if (req.method === 'GET' && p.startsWith('/INMEDIA')) return send(200, { url: `http://localhost:${PORT}/file/x.jpg`, mime_type: 'image/jpeg' });
    if (req.method === 'GET' && p.startsWith('/file/')) { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); return res.end(Buffer.from([0xff, 0xd8, 0xff, 0xd9])); }
    if (req.method === 'GET' && p.startsWith('/LEADGEN')) return send(200, { field_data: [{ name: 'full_name', values: ['Meta Parent'] }, { name: 'phone_number', values: ['+91 99887 76655'] }, { name: 'which_class', values: ['Class 6'] }], campaign_name: 'Admissions 2027 – Lead Form' });
    send(404, { error: { message: 'fake: no route ' + req.method + ' ' + p } });
  });
});
server.listen(PORT, () => console.log('fake meta on', PORT));
module.exports = server;
