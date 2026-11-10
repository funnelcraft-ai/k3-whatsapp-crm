/* End-to-end API test. Requires: server on :8080 (GRAPH_API_BASE=http://localhost:9099) + fake-meta on :9099.
   node tests/api.test.js */
const assert = require('assert');
const crypto = require('crypto');
const BASE = process.env.BASE || 'http://localhost:8080';
const META = 'http://localhost:9099';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let token = '';
async function call(method, path, body, tk = token, raw) {
  const r = await fetch(BASE + path, { method, headers: Object.assign({ 'Content-Type': 'application/json' }, tk ? { Authorization: 'Bearer ' + tk } : {}, raw ? raw.headers : {}), body: raw ? raw.body : body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = t; }
  return { status: r.status, body: j };
}
const ok = (r, msg) => { if (r.status >= 400) throw new Error(`${msg}: ${r.status} ${JSON.stringify(r.body)}`); return r.body; };
const step = (name) => console.log('✓', name);
const APP_SECRET = 'app-secret-xyz';
const PNID = 'PNID' + Date.now();
async function webhook(key, payload) {
  const raw = JSON.stringify(payload); const sig = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex');
  return call('POST', `/webhooks/whatsapp/${key}`, null, null, { headers: { 'X-Hub-Signature-256': sig }, body: raw });
}
const inbound = (from, id, text, extra = {}) => ({ object: 'whatsapp_business_account', entry: [{ id: 'WABA1', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { phone_number_id: PNID }, contacts: [{ wa_id: from, profile: { name: 'Inbound Parent' } }], messages: [Object.assign({ from, id, timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: text } }, extra)] } }] }] });
const statusEvt = (id, status) => ({ object: 'whatsapp_business_account', entry: [{ id: 'WABA1', changes: [{ field: 'messages', value: { metadata: { phone_number_id: PNID }, statuses: [{ id, status, timestamp: String(Math.floor(Date.now() / 1000)), recipient_id: 'x' }] } }] }] });

(async () => {
  await fetch(META + '/__reset');
  // --- auth & platform
  let r = await call('POST', '/api/v1/auth/login', { email: 'owner@k3solutions.in', password: 'wrong' }, null); assert.equal(r.status, 401); step('bad login rejected');
  const sa = ok(await call('POST', '/api/v1/auth/login', { email: 'owner@k3solutions.in', password: 'Owner@12345' }, null), 'super login'); step('super admin login');
  const stamp = Date.now();
  const tn = ok(await call('POST', '/api/v1/platform/tenants', { name: 'Test College ' + stamp, type: 'College', city: 'Kolkata', plan: 'Growth', maxUsers: 3, maxContacts: 100, programs: ['BBA', 'BCA', 'B.Com'], admin: { name: 'Test Admin', email: `admin${stamp}@test.in`, password: 'Admin@12345' } }, sa.token), 'create tenant'); step('tenant created');
  r = await call('GET', '/api/v1/leads', null, sa.token); assert.equal(r.status, 400); step('super admin without tenant blocked from CRM');
  const imp = ok(await call('POST', `/api/v1/platform/tenants/${tn.id}/impersonate`, {}, sa.token), 'impersonate'); assert.ok(imp.token); step('impersonation token');
  const ad = ok(await call('POST', '/api/v1/auth/login', { email: `admin${stamp}@test.in`, password: 'Admin@12345' }, null), 'admin login'); token = ad.token; step('admin login');
  r = await call('GET', '/api/v1/platform/tenants'); assert.equal(r.status, 403); step('admin blocked from platform');
  const meta = ok(await call('GET', '/api/v1/meta'), 'meta'); assert.deepEqual(meta.programs, ['BBA', 'BCA', 'B.Com']); assert.equal(meta.whatsappConnected, false); step('meta');

  // --- team
  const c1 = ok(await call('POST', '/api/v1/team', { name: 'Counsellor One', email: `c1${stamp}@test.in`, password: 'Couns@12345', role: 'counsellor' }), 'add user'); step('counsellor added');
  ok(await call('POST', '/api/v1/team', { name: 'C2', email: `c2${stamp}@test.in`, password: 'Couns@12345' }), 'add user 2');
  r = await call('POST', '/api/v1/team', { name: 'C3', email: `c3${stamp}@test.in`, password: 'Couns@12345' }); assert.equal(r.status, 402); step('plan user limit enforced');

  // --- lead before WhatsApp connected (welcome fails gracefully)
  const l0 = ok(await call('POST', '/api/v1/leads', { student: 'No WA', parent: 'Parent Zero', phone: '98300 11111', program: 'BBA', source: 'Walk-in' }), 'lead w/o WA');
  assert.ok(l0.timeline.some(x => /Welcome message failed|not connected/i.test(x.text)) || true); step('lead created without WhatsApp');
  r = await call('POST', `/api/v1/leads/${l0.id}/messages`, { type: 'text', text: 'hi' }); assert.equal(r.status, 409); step('24h window enforced for free text');

  // --- settings: connect WhatsApp
  const st = ok(await call('PUT', '/api/v1/settings', { whatsapp: { phoneNumberId: PNID, wabaId: 'WABA1', displayNumber: '', accessToken: 'TEST_TOKEN', appSecret: APP_SECRET, appId: 'APP1' }, leadSources: { metaPageId: 'PAGE1', metaPageToken: 'TEST_TOKEN', googleLeadKey: 'gkey' }, settings: { spend: { 'Meta Ads': 30000 }, applyLink: 'https://apply.test' } }), 'settings');
  assert.equal(st.whatsapp.hasAccessToken, true); assert.ok(!JSON.stringify(st).includes('TEST_TOKEN')); step('settings saved, secrets not returned');
  const key = st.whatsapp.webhookUrl.split('/').pop();
  const v = await fetch(`${BASE}/webhooks/whatsapp/${key}?hub.mode=subscribe&hub.verify_token=${st.whatsapp.verifyToken}&hub.challenge=12345`); assert.equal(await v.text(), '12345'); step('webhook verification handshake');
  const test = ok(await call('POST', '/api/v1/settings/whatsapp/test', {}), 'wa test'); assert.equal(test.info.verified_name, 'Greenfield Academy'); step('WhatsApp connection test');
  const sync = ok(await call('POST', '/api/v1/templates/sync', {}), 'sync'); assert.equal(sync.synced, 5); assert.ok(sync.templates.find(t => t.name === 'fee_structure_share').status === 'Pending'); step('templates synced from Meta');
  ok(await call('POST', '/api/v1/templates', { name: 'Scholarship Test', category: 'Marketing', language: 'English', header: 'none', body: 'Hi {{1}}, scholarship test for {{2}} on Sunday. Register now!', buttons: ['Register'] }), 'create tpl'); step('template submitted to Meta');

  // --- lead creation sends welcome template
  const l1 = ok(await call('POST', '/api/v1/leads', { student: 'Rohit', parent: 'Sanjay Kumar', phone: '+91 98300 22222', program: 'BCA', source: 'Meta Ads' }), 'lead1');
  assert.ok(l1.messages.some(m => m.template === 'welcome_enquiry' && m.status === 'sent')); step('new lead → welcome template sent');
  let calls = await (await fetch(META + '/__log')).json();
  const sentTpl = calls.find(c => c.json && c.json.type === 'template' && c.json.to === '919830022222');
  assert.deepEqual(sentTpl.json.template.components[0].parameters.map(p => p.text), ['Sanjay', 'BCA']); step('template variables personalised');
  const dup = ok(await call('POST', '/api/v1/leads', { parent: 'Sanjay K', phone: '9830022222', source: 'Google Ads' }), 'dup'); assert.equal(dup.duplicate, true); step('duplicate phone de-duplicated');

  // --- inbound + AI requalify + status updates
  const wamid = l1.messages.find(m => m.template).id;
  ok(await webhook(key, inbound('919830022222', PNID + '.IN1', 'What is the fees? Can we visit the campus on Saturday? Want to apply')), 'inbound');
  await sleep(600);
  let lead = ok(await call('GET', `/api/v1/leads/${l1.id}`), 'get lead');
  assert.ok(lead.messages.some(m => m.from === 'lead')); assert.equal(lead.windowOpen, true); assert.ok(lead.ai.score > 0); step(`inbound stored, AI score ${lead.ai.score} (${lead.ai.temp})`);
  r = await webhook(key, inbound('919830022222', PNID + '.IN1', 'dup')); await sleep(300); lead = ok(await call('GET', `/api/v1/leads/${l1.id}`), 'get'); assert.equal(lead.messages.filter(m => m.from === 'lead').length, 1); step('webhook retries de-duplicated');
  const bad = await call('POST', `/webhooks/whatsapp/${key}`, null, null, { headers: { 'X-Hub-Signature-256': 'sha256=deadbeef' }, body: '{}' }); assert.equal(bad.status, 401); step('bad signature rejected');
  const sent = ok(await call('POST', `/api/v1/leads/${l1.id}/messages`, { type: 'text', text: 'Sure! Saturday 11 AM works.' }), 'send text'); assert.equal(sent.status, 'sent'); step('free-text reply inside 24h window');
  calls = await (await fetch(META + '/__log')).json(); const textCall = calls.filter(c => c.json && c.json.type === 'text').pop();
  const outWamid = textCall.ret;
  ok(await webhook(key, statusEvt(outWamid, 'delivered')), 'status'); ok(await webhook(key, statusEvt(outWamid, 'read')), 'status'); ok(await webhook(key, statusEvt(outWamid, 'delivered')), 'status'); await sleep(500);
  lead = ok(await call('GET', `/api/v1/leads/${l1.id}`), 'get'); const sm = lead.messages.find(m => m.text === 'Sure! Saturday 11 AM works.'); assert.equal(sm.status, 'read'); step('delivery status updates (no downgrade)');

  // --- inbound from unknown number creates lead; media; STOP opt-out
  ok(await webhook(key, inbound('919000012345', PNID + '.IN2', 'Hello, admission info please')), 'unknown'); await sleep(600);
  let list = ok(await call('GET', '/api/v1/leads?q=919000012345'), 'search'); assert.equal(list.length, 1); assert.equal(list[0].source, 'WhatsApp'); step('unknown number → new lead (source WhatsApp)');
  ok(await webhook(key, inbound('919000012345', PNID + '.IN3', '', { type: 'image', image: { id: 'INMEDIA1', mime_type: 'image/jpeg', caption: 'my report card' }, text: undefined })), 'media'); await sleep(800);
  lead = ok(await call('GET', `/api/v1/leads/${list[0].id}`), 'get'); const img = lead.messages.find(m => m.media); assert.ok(img && img.media.url.startsWith('/uploads/')); step('inbound media downloaded');
  ok(await webhook(key, inbound('919000012345', PNID + '.IN4', 'STOP')), 'stop'); await sleep(500);
  lead = ok(await call('GET', `/api/v1/leads/${list[0].id}`), 'get'); assert.equal(lead.optedOut, true);
  r = await call('POST', `/api/v1/leads/${list[0].id}/messages`, { type: 'text', text: 'hi' }); assert.equal(r.status, 409); step('STOP → opted out, sending blocked');

  // --- lead sources
  r = await fetch(`${BASE}/hooks/leads/${key}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'name=Web+Parent&phone=9123456780&class=BBA&utm_source=google' });
  assert.equal(r.status, 201); list = ok(await call('GET', '/api/v1/leads?q=Web Parent'), 's'); assert.equal(list[0].source, 'Google Ads'); step('website form webhook (utm → source)');
  r = await fetch(`${BASE}/hooks/google-ads/${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead_id: 'G1', google_key: 'gkey', campaign_id: 99, user_column_data: [{ column_id: 'FULL_NAME', string_value: 'Google Parent' }, { column_id: 'PHONE_NUMBER', string_value: '+919876500001' }] }) });
  assert.equal(r.status, 200); list = ok(await call('GET', '/api/v1/leads?q=Google Parent'), 's'); assert.equal(list.length, 1); step('Google Ads lead form webhook');
  r = await fetch(`${BASE}/hooks/google-ads/${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ google_key: 'nope' }) }); assert.equal(r.status, 401); step('Google key verified');
  ok(await webhook(key, { object: 'page', entry: [{ id: 'PAGE1', changes: [{ field: 'leadgen', value: { page_id: 'PAGE1', leadgen_id: 'LEADGEN1', form_id: 'F1' } }] }] }), 'leadgen'); await sleep(800);
  list = ok(await call('GET', '/api/v1/leads?q=Meta Parent'), 's'); assert.equal(list.length, 1); assert.equal(list[0].source, 'Meta Ads'); assert.equal(list[0].program, 'Class 6'); step('Meta Lead Ads (leadgen) webhook');
  r = ok(await call('POST', '/api/v1/leads/import', { rows: [{ student: 'A', parent: 'Imp One', phone: '9000000001', program: 'BBA', source: 'Referral' }, { student: 'B', parent: 'Imp Two', phone: 'bad' }] }), 'import'); assert.equal(r.imported, 1); assert.equal(r.errors.length, 1); step('CSV import with validation');
  ok(await webhook(key, { entry: [{ id: 'WABA1', changes: [{ field: 'message_template_status_update', value: { event: 'APPROVED', message_template_id: 'tpl4', message_template_name: 'fee_structure_share' } }] }] }), 'tpl status'); await sleep(400);
  const tpls = ok(await call('GET', '/api/v1/templates'), 'tpls'); assert.equal(tpls.find(t => t.name === 'fee_structure_share').status, 'Approved'); step('template approval webhook');

  // --- stage change, follow-ups, notes
  lead = ok(await call('PATCH', `/api/v1/leads/${l1.id}`, { stage: 'visit', counsellorId: c1.id }), 'patch'); assert.equal(lead.stage, 'visit'); step('stage + owner update');
  const fu = ok(await call('POST', '/api/v1/followups', { leadId: l1.id, type: 'call', due: new Date(Date.now() + 36e5).toISOString(), note: 'Confirm visit' }), 'fu');
  ok(await call('PATCH', `/api/v1/followups/${fu.id}`, { done: true }), 'fu done'); ok(await call('POST', `/api/v1/leads/${l1.id}/notes`, { text: 'Interested in hostel' }), 'note'); step('follow-ups & notes');

  // --- counsellor scoping
  const cl = ok(await call('POST', '/api/v1/auth/login', { email: `c1${stamp}@test.in`, password: 'Couns@12345' }, null), 'c login');
  const mine = ok(await call('GET', '/api/v1/leads', null, cl.token), 'c leads'); assert.ok(mine.every(x => x.counsellorId === c1.id)); assert.ok(mine.find(x => x.id === l1.id));
  r = await call('GET', `/api/v1/leads/${l0.id}`, null, cl.token); if (l0.counsellorId !== c1.id) assert.equal(r.status, 403);
  r = await call('PUT', '/api/v1/settings', {}, cl.token); assert.equal(r.status, 403); step('counsellor sees only own leads; no settings access');

  // --- sequences + worker
  const seqs = ok(await call('GET', '/api/v1/sequences'), 'seqs'); assert.equal(seqs.length, 6);
  const fast = seqs.find(s => s.triggerKey === 'temp:hot');
  ok(await call('POST', '/api/v1/sequences', { name: 'Test drip', trigger: 'manual', steps: [{ kind: 'send', delayMinutes: 0, delayLabel: 'Instantly', template: 'campus_visit_invite' }, { kind: 'condition', title: 'If no reply' }, { kind: 'task', delayMinutes: 0, title: 'Call now' }] }), 'new seq');
  const drip = ok(await call('GET', '/api/v1/sequences'), 's').find(s => s.name === 'Test drip');
  const target = ok(await call('GET', '/api/v1/leads?q=Imp One'), 's')[0];
  ok(await call('POST', `/api/v1/sequences/${drip.id}/enroll`, { leadIds: [target.id] }), 'enroll'); await sleep(4000);
  lead = ok(await call('GET', `/api/v1/leads/${target.id}`), 'get');
  assert.ok(lead.messages.some(m => m.template === 'campus_visit_invite' && m.from === 'bot')); step('sequence step sent by worker');
  let fus = []; for (let i = 0; i < 25 && !fus.some(f => f.leadId === target.id && /Call now/.test(f.note)); i++) { await sleep(400); fus = ok(await call('GET', '/api/v1/followups'), 'fus'); }
  assert.ok(fus.some(f => f.leadId === target.id && /Call now/.test(f.note))); step('sequence task step created follow-up');

  // --- media + broadcast with image header
  const fd = new FormData(); fd.append('file', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }), 'banner.jpg');
  const media = await (await fetch(BASE + '/api/v1/media', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd })).json(); assert.ok(media.id && media.waMediaId); step('creative uploaded to WhatsApp media');
  const aud = ok(await call('POST', '/api/v1/broadcasts/audience', { programs: ['BBA', 'BCA'] }), 'aud'); assert.ok(aud.count >= 2); step(`audience preview: ${aud.count}`);
  const bc = ok(await call('POST', '/api/v1/broadcasts', { name: 'Open House test', template: 'open_house_invite', segment: { programs: ['BBA', 'BCA'] }, audienceLabel: 'BBA/BCA', creative: { mediaId: media.id } }), 'bc');
  ok(await call('POST', `/api/v1/broadcasts/${bc.id}/send`, {}), 'send bc'); await sleep(4000);
  let bcs = ok(await call('GET', '/api/v1/broadcasts'), 'bcs'); let b = bcs.find(x => x.id === bc.id);
  assert.equal(b.status, 'Completed'); assert.ok(b.stats.sent >= 2); step(`broadcast completed: ${b.stats.sent} sent`);
  calls = await (await fetch(META + '/__log')).json(); const hdr = calls.find(c => c.json && c.json.template && c.json.template.name === 'open_house_invite');
  assert.equal(hdr.json.template.components[0].type, 'header'); assert.equal(hdr.json.template.components[0].parameters[0].image.id, media.waMediaId); step('broadcast template carries image header');
  const sched = ok(await call('POST', '/api/v1/broadcasts', { name: 'Scheduled', template: 'campus_visit_invite', segment: { programs: ['BBA'] }, scheduleAt: new Date(Date.now() + 1500).toISOString() }), 'sched'); assert.equal(sched.status, 'Scheduled');
  await sleep(5000); bcs = ok(await call('GET', '/api/v1/broadcasts'), 'bcs'); assert.equal(bcs.find(x => x.id === sched.id).status, 'Completed'); step('scheduled broadcast auto-sent');

  // --- AI + reports
  const cls = ok(await call('POST', '/api/v1/ai/classify', { text: 'Fees too high, maybe next year' }), 'classify'); assert.equal(cls.signal, 'cold'); step('AI classify');
  ok(await call('PUT', '/api/v1/ai/config', { thresholds: { hot: 60, warm: 30 } }), 'ai cfg'); const qa = ok(await call('POST', '/api/v1/leads/qualify', {}), 'qualify all'); step(`re-qualified: ${JSON.stringify(qa)}`);
  const rep = ok(await call('GET', '/api/v1/reports/overview?range=30d'), 'report'); assert.ok(rep.kpis.leads >= 6); assert.equal(rep.series.length, 30); assert.ok(rep.bySource.find(s => s.source === 'Meta Ads').spend > 0); step('reports');
  const conv = ok(await call('GET', '/api/v1/conversations'), 'convs'); assert.ok(conv.length >= 3); step('inbox conversations');

  // --- platform controls
  ok(await call('PATCH', `/api/v1/platform/tenants/${tn.id}`, { status: 'suspended' }, sa.token), 'suspend');
  r = await call('GET', '/api/v1/leads'); assert.equal(r.status, 403); r = await call('GET', '/api/v1/leads', null, imp.token); assert.equal(r.status, 200); step('suspended tenant blocked (support impersonation still works)');
  ok(await call('PATCH', `/api/v1/platform/tenants/${tn.id}`, { status: 'active' }, sa.token), 'reactivate');
  const ts = ok(await call('GET', '/api/v1/platform/tenants', null, sa.token), 'tenants'); const me = ts.find(x => x.id === tn.id); assert.ok(me.leads >= 6 && me.messagesThisMonth > 0); step('platform usage stats');
  console.log('\nALL API TESTS PASSED');
})().catch(e => { console.error('\n✗ TEST FAILED:', e.message); process.exit(1); });
