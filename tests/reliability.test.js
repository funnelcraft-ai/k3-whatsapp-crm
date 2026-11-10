/* Reliability tests: media-ID expiry (B), retries/back-off/dead-letter (D), template variable mapping (C),
   multi-server realtime via PostgreSQL LISTEN/NOTIFY (A), S3 storage (E).
   Needs: fake-meta on :9099; server A :8080 (EVENTS_BACKPLANE=postgres, RETRY_BASE_MS=300, RETRY_MAX_ATTEMPTS=4);
          server B :8086 (EVENTS_BACKPLANE=postgres, WORKER_ENABLED=false); server S :8087 (STORAGE_DRIVER=s3 → s3rver :4568). */
const assert = require('assert'); const crypto = require('crypto');
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://k3:k3pass@localhost:5432/k3crm' });
const A = 'http://localhost:8080', B = 'http://localhost:8086', SS = process.env.S3_BASE || 'http://localhost:8087', META = 'http://localhost:9099';
const sleep = ms => new Promise(r => setTimeout(r, ms)); const step = n => console.log('✓', n);
const SECRET = 'rel-secret'; const PNID = 'PNID' + Date.now(); const stamp = Date.now();
async function call(base, method, path, body, tk) {
  const r = await fetch(base + path, { method, headers: Object.assign({ 'Content-Type': 'application/json' }, tk ? { Authorization: 'Bearer ' + tk } : {}), body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = t; } if (r.status >= 400) throw new Error(`${method} ${path} → ${r.status} ${t}`); return j;
}
async function hook(key, payload) { const raw = JSON.stringify(payload); return fetch(`${A}/webhooks/whatsapp/${key}`, { method: 'POST', headers: { 'X-Hub-Signature-256': 'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex') }, body: raw }); }
const metaLog = async () => (await fetch(META + '/__log')).json();
async function waitFor(fn, ms = 20000, label = 'condition') { const end = Date.now() + ms; while (Date.now() < end) { const v = await fn(); if (v) return v; await sleep(400); } throw new Error('timeout waiting for ' + label); }
async function upload(base, tk, bytes = [0xff, 0xd8, 0xff, 0xd9], name = 'banner.jpg') {
  const fd = new FormData(); fd.append('file', new Blob([Buffer.from(bytes)], { type: 'image/jpeg' }), name);
  const r = await fetch(base + '/api/v1/media', { method: 'POST', headers: { Authorization: 'Bearer ' + tk }, body: fd }); const j = await r.json(); if (r.status >= 400) throw new Error(JSON.stringify(j)); return j;
}

(async () => {
  await fetch(META + '/__reset');
  const sa = await call(A, 'POST', '/api/v1/auth/login', { email: 'owner@k3solutions.in', password: 'Owner@12345' });
  const tn = await call(A, 'POST', '/api/v1/platform/tenants', { name: 'Reliability School ' + stamp, plan: 'Growth', maxUsers: 5, maxContacts: 1000, admin: { email: `rel${stamp}@test.in`, password: 'Admin@12345' } }, sa.token);
  const tk = (await call(A, 'POST', '/api/v1/auth/login', { email: `rel${stamp}@test.in`, password: 'Admin@12345' })).token;
  const st = await call(A, 'PUT', '/api/v1/settings', { whatsapp: { phoneNumberId: PNID, wabaId: 'WABA1', accessToken: 'TEST_TOKEN', appSecret: SECRET, appId: 'APP1' }, settings: { welcomeTemplate: '' } }, tk);
  const key = st.whatsapp.webhookUrl.split('/').pop();
  await call(A, 'POST', '/api/v1/templates/sync', {}, tk);
  const mk = async (phone, extra = {}) => (await call(A, 'POST', '/api/v1/leads', Object.assign({ parent: 'Parent ' + phone.slice(-4), student: 'Kid ' + phone.slice(-4), phone, program: 'REL', source: 'Walk-in' }, extra), tk));

  /* ---------- B: media ID refresh ---------- */
  await mk('9876512001'); await mk('9876512002');
  const m1 = await upload(A, tk); assert.ok(m1.waMediaId);
  await db.query(`UPDATE media SET wa_uploaded_at = now() - interval '26 days' WHERE id=$1`, [m1.id]);
  let bc = await call(A, 'POST', '/api/v1/broadcasts', { name: 'B1', template: 'open_house_invite', segment: { programs: ['REL'] }, creative: { mediaId: m1.id } }, tk);
  await call(A, 'POST', `/api/v1/broadcasts/${bc.id}/send`, {}, tk);
  await waitFor(async () => (await call(A, 'GET', '/api/v1/broadcasts', null, tk)).find(x => x.id === bc.id).status === 'Completed', 20000, 'B1 complete');
  let row = (await db.query(`SELECT wa_media_id, wa_uploaded_at FROM media WHERE id=$1`, [m1.id])).rows[0];
  assert.notEqual(row.wa_media_id, m1.waMediaId); assert.ok(Date.now() - new Date(row.wa_uploaded_at) < 60e3);
  const sentHdr = (await metaLog()).filter(c => c.json && c.json.template && c.json.template.name === 'open_house_invite').map(c => c.json.template.components[0].parameters[0].image.id);
  assert.ok(sentHdr.length >= 2 && sentHdr.every(id => id === row.wa_media_id)); step('B: media older than 25 days is re-uploaded before sending');
  await fetch(`${META}/__expire?id=${row.wa_media_id}`);
  bc = await call(A, 'POST', '/api/v1/broadcasts', { name: 'B2', template: 'open_house_invite', segment: { programs: ['REL'] }, creative: { mediaId: m1.id } }, tk);
  await call(A, 'POST', `/api/v1/broadcasts/${bc.id}/send`, {}, tk);
  const b2 = await waitFor(async () => { const x = (await call(A, 'GET', '/api/v1/broadcasts', null, tk)).find(y => y.id === bc.id); return x.status === 'Completed' && x; }, 20000, 'B2 complete');
  assert.equal(b2.stats.failed, 0); const row2 = (await db.query(`SELECT wa_media_id FROM media WHERE id=$1`, [m1.id])).rows[0]; assert.notEqual(row2.wa_media_id, row.wa_media_id);
  step('B: media rejected by Meta (expired) → re-uploaded automatically and resent, 0 failures');

  /* ---------- D: retries, back-off, dead-letter ---------- */
  for (const p of ['9999900001', '9999900002', '9999900003']) await mk(p, { program: 'RETRY' });
  bc = await call(A, 'POST', '/api/v1/broadcasts', { name: 'D1', template: 'campus_visit_invite', segment: { programs: ['RETRY'] } }, tk);
  await call(A, 'POST', `/api/v1/broadcasts/${bc.id}/send`, {}, tk);
  const seenRetrying = await waitFor(async () => (await call(A, 'GET', '/api/v1/broadcasts', null, tk)).find(x => x.id === bc.id).stats.retrying > 0, 15000, 'retrying state');
  const d1 = await waitFor(async () => { const x = (await call(A, 'GET', '/api/v1/broadcasts', null, tk)).find(y => y.id === bc.id); return x.status === 'Completed' && x; }, 40000, 'D1 complete');
  const rcp = (await db.query(`SELECT l.wa_id, r.status, r.attempts, r.error FROM broadcast_recipients r JOIN leads l ON l.id=r.lead_id WHERE r.broadcast_id=$1 ORDER BY l.wa_id`, [bc.id])).rows;
  const byPhone = Object.fromEntries(rcp.map(x => [x.wa_id, x]));
  assert.equal(byPhone['919999900001'].status, 'sent'); assert.equal(byPhone['919999900001'].attempts, 3);
  assert.equal(byPhone['919999900002'].status, 'failed'); assert.equal(byPhone['919999900002'].attempts, 1);
  assert.equal(byPhone['919999900003'].status, 'failed'); assert.equal(byPhone['919999900003'].attempts, 4); assert.ok(/Gave up after 4/.test(byPhone['919999900003'].error));
  assert.equal(d1.stats.failed, 2); step('D: rate-limited message retried (sent on attempt 3); invalid number fails once; outage gives up after max attempts');
  const failed = await call(A, 'GET', `/api/v1/broadcasts/${bc.id}/failed`, null, tk); assert.equal(failed.length, 2);
  const rq = await call(A, 'POST', `/api/v1/broadcasts/${bc.id}/retry-failed`, {}, tk); assert.equal(rq.requeued, 2); step('D: dead-letter list + "Retry failed" re-queues');
  const msgsForRetried = (await db.query(`SELECT count(*)::int n FROM messages m JOIN leads l ON l.id=m.lead_id WHERE l.wa_id='919999900001' AND m.sender='broadcast'`)).rows[0].n;
  assert.equal(msgsForRetried, 1); step('D: retried message recorded once in the chat (no duplicates)');
  const l4 = await mk('9999900004', { program: 'SEQ' });
  await call(A, 'POST', '/api/v1/sequences', { name: 'Retry drip', trigger: 'manual', steps: [{ kind: 'send', delayMinutes: 0, delayLabel: 'Instantly', template: 'campus_visit_invite' }] }, tk);
  const seq = (await call(A, 'GET', '/api/v1/sequences', null, tk)).find(s => s.name === 'Retry drip');
  await call(A, 'POST', `/api/v1/sequences/${seq.id}/enroll`, { leadIds: [l4.id] }, tk);
  await waitFor(async () => (await call(A, 'GET', `/api/v1/leads/${l4.id}`, null, tk)).messages.some(m => m.template === 'campus_visit_invite' && m.status === 'sent'), 30000, 'sequence retry');
  const en = (await db.query(`SELECT status, attempts FROM enrollments WHERE lead_id=$1`, [l4.id])).rows[0]; assert.equal(en.status, 'completed'); step('D: sequence step retried after Meta 500s, then sent');

  /* ---------- C: per-template variables + custom fields ---------- */
  const lc = await mk('9876512099', { student: 'Ishaan Roy', custom: { 'Roll No': 'R-17', fee_balance: '₹12,500' } });
  assert.deepEqual(lc.custom, { roll_no: 'R-17', fee_balance: '₹12,500' }); step('C: custom fields stored (keys normalised)');
  const tpl = (await call(A, 'GET', '/api/v1/templates', null, tk)).find(t => t.name === 'fee_reminder'); assert.equal(tpl.vars, 3);
  const vars = await call(A, 'GET', '/api/v1/templates/variables', null, tk); assert.ok(vars.customFields.includes('roll_no'));
  await call(A, 'PATCH', `/api/v1/templates/${tpl.id}`, { varMap: ['student_first', 'field:roll_no', 'field:fee_balance'] }, tk);
  const pv = await call(A, 'POST', `/api/v1/templates/${tpl.id}/preview`, { leadId: lc.id }, tk); assert.deepEqual(pv.params, ['Ishaan', 'R-17', '₹12,500']);
  await call(A, 'POST', `/api/v1/leads/${lc.id}/messages`, { type: 'template', template: 'fee_reminder' }, tk);
  const fc = (await metaLog()).filter(c => c.json && c.json.template && c.json.template.name === 'fee_reminder').pop();
  assert.deepEqual(fc.json.template.components.find(c => c.type === 'body').parameters.map(p => p.text), ['Ishaan', 'R-17', '₹12,500']); step('C: template sent with mapped variables {{1}} student, {{2}} roll no, {{3}} fee balance');
  const imp = await call(A, 'POST', '/api/v1/leads/import', { rows: [{ parent: 'CSV Parent', phone: '9876512098', program: 'REL', roll_no: 'R-22', exam_date: '12 Dec' }] }, tk);
  assert.equal(imp.imported, 1); const li = (await call(A, 'GET', '/api/v1/leads?q=CSV Parent', null, tk))[0];
  assert.deepEqual((await call(A, 'GET', `/api/v1/leads/${li.id}`, null, tk)).custom, { roll_no: 'R-22', exam_date: '12 Dec' });
  await fetch(`${A}/hooks/leads/${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Form Parent', phone: '9876512097', class: 'REL', father_occupation: 'Engineer' }) });
  const lw = (await call(A, 'GET', '/api/v1/leads?q=Form Parent', null, tk))[0]; assert.equal((await call(A, 'GET', `/api/v1/leads/${lw.id}`, null, tk)).custom.father_occupation, 'Engineer');
  step('C: extra CSV columns and website form fields become custom fields');

  /* ---------- A: realtime across two servers ---------- */
  const ac = new AbortController(); const got = [];
  const sres = await fetch(`${B}/api/v1/events?token=${encodeURIComponent(tk)}`, { signal: ac.signal });
  (async () => { const rd = sres.body.getReader(); const dec = new TextDecoder(); let buf = ''; try { for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value); let i; while ((i = buf.indexOf('\n\n')) >= 0) { const chunk = buf.slice(0, i); buf = buf.slice(i + 2); const ev = /event: (\w+)/.exec(chunk); const da = /data: (.*)/.exec(chunk); if (ev && da) got.push({ type: ev[1], data: JSON.parse(da[1]) }); } } } catch (e) { /* aborted */ } })();
  await sleep(500);
  await hook(key, { entry: [{ id: 'WABA1', changes: [{ field: 'messages', value: { metadata: { phone_number_id: PNID }, contacts: [{ wa_id: '919876512099', profile: { name: 'x' } }], messages: [{ from: '919876512099', id: 'wamid.REL' + stamp, timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: 'Realtime across servers? ' + 'x'.repeat(9000) } }] } }] }] });
  await waitFor(async () => got.some(g => g.type === 'message' && g.data.leadId === lc.id), 8000, 'cross-server event');
  ac.abort(); step('A: webhook on server A → live update delivered to a browser on server B (large payload via outbox)');

  /* ---------- E: S3 storage ---------- */
  const bytes = [0xff, 0xd8, 0xff, 0xe0, ...crypto.randomBytes(64), 0xff, 0xd9];
  const ms = await upload(SS, tk, bytes, 's3-banner.jpg');
  const mrow = (await db.query(`SELECT storage, path, data FROM media WHERE id=$1`, [ms.id])).rows[0];
  assert.equal(mrow.storage, 's3'); assert.equal(mrow.data, null); assert.ok(mrow.path.startsWith(tn.id + '/'));
  const fs = require('fs'); assert.ok(fs.existsSync('/tmp/s3data/k3-media/' + mrow.path + '._S3rver_object')); step('E: upload stored in S3 bucket (not in database)');
  fs.rmSync('/tmp/k3s3cache', { recursive: true, force: true }); fs.mkdirSync('/tmp/k3s3cache');
  const fr = await fetch(SS + ms.url); const fb = Buffer.from(await fr.arrayBuffer()); assert.equal(fr.status, 200); assert.ok(fb.equals(Buffer.from(bytes)));
  step('E: file served from S3 after local cache wiped');
  await db.query(`UPDATE media SET wa_media_id=NULL, wa_uploaded_at=NULL WHERE id=$1`, [ms.id]); fs.rmSync('/tmp/k3s3cache', { recursive: true, force: true }); fs.mkdirSync('/tmp/k3s3cache');
  await call(SS, 'POST', `/api/v1/leads/${lc.id}/messages`, { type: 'template', template: 'open_house_invite', media: { id: ms.id } }, tk);
  assert.ok((await db.query(`SELECT wa_media_id FROM media WHERE id=$1`, [ms.id])).rows[0].wa_media_id); step('E: WhatsApp upload pulls the file from S3 when needed');

  await db.end(); console.log('\nALL RELIABILITY TESTS PASSED'); process.exit(0);
})().catch(async e => { console.error('\n✗ RELIABILITY TEST FAILED:', e.message); await db.end().catch(() => {}); process.exit(1); });
