/* Free / open-source AI engine tests — uses LOCAL fake Ollama and Hugging Face servers (no real network, no real keys).
   Needs DATABASE_URL (the seeded demo school). node tests/ai.test.js */
const assert = require('assert');
const http = require('http');
const step = n => console.log('✓', n);

function fake(port, handler) {
  const calls = [];
  const srv = http.createServer((req, res) => {
    let b = ''; req.on('data', c => b += c); req.on('end', () => {
      let json = null; try { json = JSON.parse(b); } catch (e) { /* */ }
      calls.push({ url: req.url, auth: req.headers.authorization, json });
      const out = handler(req.url, json, calls.length); res.writeHead(out.status || 200, { 'content-type': 'application/json' }); res.end(JSON.stringify(out.body));
    });
  });
  return new Promise(r => srv.listen(port, () => r({ srv, calls })));
}

(async () => {
  const AI = require('../server/src/services/ai');
  const CRM = require('../server/src/services/crm');
  const { one, many, pool } = require('../server/src/core');

  /* rules only (default): nothing leaves the server */
  delete process.env.AI_PROVIDER; delete process.env.ANTHROPIC_API_KEY;
  assert.equal(AI.provider(), 'rules'); assert.equal(AI.engineInfo().external, false); step('default engine is the built-in rules engine (no external calls)');
  const lead = { stage: 'counselling', source: 'Meta Ads', created_at: new Date(), last_activity_at: new Date(), avg_reply_mins: 20 };
  const msgs = ['What is the fee for class 6?', 'Can we visit the campus tomorrow'];
  const base = AI.score(lead, msgs, AI.cfgOf({}));
  const hot = AI.score(lead, msgs, AI.cfgOf({}), Date.now(), { signal: 'hot', confidence: 0.9, summary: 'ready to visit', provider: 'ollama', model: 'm' });
  const cold = AI.score(lead, msgs, AI.cfgOf({}), Date.now(), { signal: 'cold', confidence: 0.9, summary: 'browsing', provider: 'ollama', model: 'm' });
  assert.ok(hot.score > base.score && cold.score < base.score); assert.ok(hot.reasons[0].text.startsWith('AI read of replies')); step('the model\'s read nudges the rule-based score up or down, and says why');
  assert.ok(Math.abs(hot.score - base.score) <= 20); step('the model can only adjust the intent factor — it cannot override the whole score');

  /* masking */
  const masked = AI.maskPII('call me on +91 98300 11111 or mail a.b@school.in, ref 123456789');
  assert.ok(!/98300|a\.b@|123456789/.test(masked)); step('phone numbers and e-mail addresses are masked before any model sees them');

  /* Ollama */
  const ol = await fake(9097, (url, j) => url === '/api/generate' ? { body: { response: '{"signal":"hot","confidence":0.8,"summary":"asked about fees and a visit"}' } } : { status: 404, body: {} });
  process.env.AI_PROVIDER = 'ollama'; process.env.OLLAMA_URL = 'http://localhost:9097'; process.env.OLLAMA_MODEL = 'qwen2.5:3b';
  assert.equal(AI.engineInfo().configured, true); assert.equal(AI.engineInfo().external, false);
  const a = await AI.assessLead(lead, ['fees? my number is 9830011111', 'visit tomorrow'], { institution: 'Test School' });
  assert.equal(a.signal, 'hot'); assert.equal(a.provider, 'ollama'); step('Ollama (self-hosted open-source model) reads the replies');
  assert.ok(!/9830011111/.test(ol.calls[0].json.prompt)); assert.equal(ol.calls[0].json.format, 'json'); assert.equal(ol.calls[0].json.stream, false); step('…and never receives the phone number');
  const c = await AI.classify('What are the fees for Class 5?', { institution: 'X' }); assert.ok(c.intent && c.suggestedReply); step('reply classification works through Ollama');

  /* Hugging Face */
  const hf = await fake(9096, (url, j) => url === '/v1/chat/completions' ? { body: { choices: [{ message: { content: 'Sure! ```json\n{"signal":"warm","confidence":0.6,"summary":"interested, undecided"}\n``` ' } }] } } : { status: 404, body: {} });
  process.env.AI_PROVIDER = 'huggingface'; process.env.HF_BASE_URL = 'http://localhost:9096/v1'; delete process.env.HF_API_TOKEN;
  assert.equal(AI.engineInfo().configured, false); await assert.rejects(AI.assessLead(lead, ['hello'])); step('Hugging Face needs a token; without one it is reported as not configured');
  process.env.HF_API_TOKEN = 'hf_test_token';
  const h = await AI.assessLead(lead, ['we are thinking about it'], {}); assert.equal(h.signal, 'warm'); assert.equal(hf.calls[0].auth, 'Bearer hf_test_token'); step('Hugging Face open models read the replies (JSON extracted from chatty output)');

  /* failure → rules fallback */
  const bad = await fake(9095, () => ({ status: 500, body: { error: 'down' } }));
  process.env.AI_PROVIDER = 'ollama'; process.env.OLLAMA_URL = 'http://localhost:9095';
  await assert.rejects(AI.assessLead(lead, ['hello']));
  const fb = await AI.classify('fees?'); assert.equal(fb.engine, 'rules'); step('a model outage falls back to the rules engine silently');
  const junk = await fake(9094, () => ({ body: { response: 'I am not JSON' } })); process.env.OLLAMA_URL = 'http://localhost:9094';
  await assert.rejects(AI.assessLead(lead, ['hello'])); step('garbage model output is rejected, not trusted');

  /* end-to-end through the CRM: cached by message hash, bulk never calls the model */
  process.env.OLLAMA_URL = 'http://localhost:9097'; const before = ol.calls.length;
  const t = await one(`SELECT * FROM tenants WHERE plan='Demo' ORDER BY created_at LIMIT 1`);
  const l = await one(`SELECT l.id FROM leads l WHERE l.tenant_id=$1 AND EXISTS (SELECT 1 FROM messages m WHERE m.lead_id=l.id AND m.sender='lead') ORDER BY l.created_at LIMIT 1`, [t.id]);
  await one(`UPDATE leads SET ai='{}'::jsonb WHERE id=$1 RETURNING id`, [l.id]);
  const r1 = await CRM.requalify(t, l.id, { silent: true }); assert.ok(r1.ai.llm && r1.ai.llm.signal === 'hot'); assert.equal(ol.calls.length, before + 1); step('requalify stores the model\'s read on the lead');
  await CRM.requalify(t, l.id, { silent: true }); assert.equal(ol.calls.length, before + 1); step('unchanged messages reuse the cached read (no repeat model call)');
  await CRM.requalify(t, l.id, { silent: true, deep: false }); assert.equal(ol.calls.length, before + 1); step('bulk re-qualify never calls the model');
  await one(`UPDATE tenants SET ai_config = coalesce(ai_config,'{}'::jsonb) || '{"useLLM":false}'::jsonb WHERE id=$1 RETURNING id`, [t.id]);
  const t2 = await one(`SELECT * FROM tenants WHERE id=$1`, [t.id]); await one(`UPDATE leads SET ai='{}'::jsonb WHERE id=$1 RETURNING id`, [l.id]);
  const r3 = await CRM.requalify(t2, l.id, { silent: true }); assert.ok(!r3.ai.llm); assert.equal(ol.calls.length, before + 1); step('a school can switch the AI engine off for its own data');
  await one(`UPDATE tenants SET ai_config = ai_config - 'useLLM' WHERE id=$1 RETURNING id`, [t.id]);

  for (const s of [ol, hf, bad, junk]) s.srv.close();
  await pool.end();
  console.log('\nALL AI TESTS PASSED');
})().catch(e => { console.error('\n✗ FAILED:', e.message); process.exit(1); });
