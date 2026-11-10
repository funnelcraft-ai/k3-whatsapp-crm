/* AI qualification — transparent rules-based scoring + optional LLM message classification */
const crypto = require('crypto');
const { config, STAGE_LABEL } = require('../core');

/* ---------------- engines ----------------
   AI_PROVIDER = rules (default, no external calls) | ollama (self-hosted, free & open source) | huggingface (free tier, open models) | anthropic
   The rules engine ALWAYS runs and always produces the score. An LLM, when configured, only adds a read of what the parent actually wrote
   (hot / warm / cold + confidence) that is blended into the "intent" factor — so a provider outage never breaks ranking. */
const provider = () => {
  const p = String(process.env.AI_PROVIDER || '').toLowerCase();
  if (['rules', 'ollama', 'huggingface', 'anthropic'].includes(p)) return p;
  return config.anthropicKey ? 'anthropic' : 'rules';
};
const OLLAMA_URL = () => String(process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = () => process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const HF_BASE = () => String(process.env.HF_BASE_URL || 'https://router.huggingface.co/v1').replace(/\/$/, '');
const HF_MODEL = () => process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const LLM_TIMEOUT = () => +(process.env.AI_TIMEOUT_MS || 12000);
function engineInfo() {
  const p = provider();
  const model = p === 'ollama' ? OLLAMA_MODEL() : p === 'huggingface' ? HF_MODEL() : p === 'anthropic' ? config.aiModel : 'k3-qualifier-rules-v1';
  const configured = p === 'rules' || p === 'ollama' || (p === 'huggingface' && !!process.env.HF_API_TOKEN) || (p === 'anthropic' && !!config.anthropicKey);
  return { provider: p, model, configured, external: p === 'huggingface' || p === 'anthropic', note: p === 'rules' ? 'Rules only — no data leaves the server.' : p === 'ollama' ? 'Self-hosted open-source model — data stays on your infrastructure.' : 'Hosted model — phone numbers and e-mail addresses are masked before sending.' };
}
/* phone numbers, e-mail addresses and long digit runs never go to a model */
const maskPII = s => String(s || '').replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]').replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[phone]').replace(/\d{6,}/g, '[number]');
const parseJson = out => { const a = out.indexOf('{'), b = out.lastIndexOf('}'); if (a < 0 || b < a) throw new Error('no JSON in model output'); return JSON.parse(out.slice(a, b + 1)); };

/* Send one prompt, get one parsed JSON object back (or throw) */
async function llmJson(prompt, { maxTokens = 300 } = {}) {
  const p = provider(); const signal = AbortSignal.timeout(LLM_TIMEOUT());
  if (p === 'ollama') {
    const r = await fetch(OLLAMA_URL() + '/api/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, signal, body: JSON.stringify({ model: OLLAMA_MODEL(), prompt, stream: false, format: 'json', options: { temperature: 0.1, num_predict: maxTokens } }) });
    if (!r.ok) throw new Error('Ollama ' + r.status);
    return parseJson(String((await r.json()).response || ''));
  }
  if (p === 'huggingface') {
    if (!process.env.HF_API_TOKEN) throw new Error('HF_API_TOKEN is not set');
    const r = await fetch(HF_BASE() + '/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.HF_API_TOKEN }, signal, body: JSON.stringify({ model: HF_MODEL(), messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.1 }) });
    if (!r.ok) throw new Error('HuggingFace ' + r.status);
    const j = await r.json(); return parseJson(String((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''));
  }
  if (p === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': config.anthropicKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: config.aiModel, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }), signal });
    if (!r.ok) throw new Error('LLM ' + r.status);
    const j = await r.json(); return parseJson((j.content || []).map(c => c.text || '').join(''));
  }
  throw new Error('no LLM provider configured');
}

/* Read the parent's recent messages → { signal, confidence, summary }. The caller caches it against hashMsgs(). */
async function assessLead(lead, inbound, ctx = {}) {
  const msgs = inbound.slice(0, 8).map(t => maskPII(String(t || '').slice(0, 400))).filter(Boolean); if (!msgs.length) return null;
  const prompt = 'You rank admission enquiries for an Indian school or college. Below are WhatsApp messages from a parent or student (newest first). Judge how likely they are to take admission soon.\n'
    + 'Messages:\n' + msgs.map((m, i) => (i + 1) + '. "' + m.replace(/"/g, "'") + '"').join('\n')
    + '\nRespond ONLY with JSON: {"signal": "hot"|"warm"|"cold", "confidence": number between 0 and 1, "summary": "max 14 words"}\n'
    + 'hot = ready to apply, pay or visit; warm = interested but undecided; cold = not interested or only browsing.';
  const j = await llmJson(prompt, { maxTokens: 120 });
  const signal = ['hot', 'warm', 'cold'].includes(String(j.signal).toLowerCase()) ? String(j.signal).toLowerCase() : null;
  if (!signal) throw new Error('bad signal from model');
  return { signal, confidence: Math.max(0, Math.min(1, +j.confidence || 0.5)), summary: String(j.summary || '').slice(0, 140), model: engineInfo().model, provider: provider() };
}
const hashMsgs = inbound => crypto.createHash('sha1').update(JSON.stringify(inbound.slice(0, 8))).digest('hex').slice(0, 16);

const HOT_WORDS = ['fee', 'fees', 'visit', 'seat', 'seats', 'apply', 'application', 'admission form', 'documents', 'book', 'payment', 'pay', 'scholarship', 'when can', 'interested', 'enrol', 'enroll', 'confirm', 'saturday', 'tomorrow', 'form', 'prospectus', 'registration'];
const NEG_WORDS = ['not now', 'next year', 'too high', 'expensive', 'later', 'not interested', 'stop', 'no thanks', 'already admitted', 'other school', 'just checking', 'will let you know'];
const SOURCE_Q = { 'Walk-in': 15, 'Referral': 14, 'Event / Seminar': 12, 'Website Form': 11, 'Google Ads': 10, 'WhatsApp': 10, 'Meta Ads': 7, 'JustDial': 6 };
const STAGE_Q = { new: 0, contacted: 4, counselling: 8, visit: 12, application: 15, admitted: 15, lost: 0 };
const MAX = { intent: 25, engagement: 20, responsiveness: 15, source: 15, stage: 15, recency: 10 };

const DEFAULT_CONFIG = {
  weights: { intent: 1, engagement: 1, responsiveness: 1, source: 1, stage: 1, recency: 1 },
  thresholds: { hot: 70, warm: 40 },
  autoQualifyOnReply: true,
  autoAssignHot: true,
  useLLM: true,          // allow the configured AI engine (if any) to read replies; the rules still decide the score
};
const cfgOf = t => {
  const c = Object.assign({}, DEFAULT_CONFIG, t.ai_config || {});
  c.weights = Object.assign({}, DEFAULT_CONFIG.weights, c.weights || {});
  c.thresholds = Object.assign({}, DEFAULT_CONFIG.thresholds, c.thresholds || {});
  return c;
};

/* lead: row from leads table; inbound: array of inbound message texts */
function score(lead, inbound, cfg, now = Date.now(), llm = null) {
  const w = cfg.weights;
  const text = inbound.map(t => String(t || '').toLowerCase()).join(' \n ');
  const hotHits = HOT_WORDS.filter(k => text.includes(k));
  const negHits = NEG_WORDS.filter(k => text.includes(k));
  const n = inbound.length; const mins = +lead.avg_reply_mins || 0;
  const f = {
    intent: Math.max(0, Math.min(25, hotHits.length * 7 - negHits.length * 9)),
    engagement: [0, 9, 15, 20][Math.min(3, n)],
    responsiveness: n === 0 ? 0 : mins < 15 ? 15 : mins < 60 ? 11 : mins < 240 ? 6 : 2,
    source: SOURCE_Q[lead.source] ?? 8,
    stage: STAGE_Q[lead.stage] ?? 0,
  };
  if (llm && llm.signal) { const d = ({ hot: 10, warm: 4, cold: -6 })[llm.signal] * (0.4 + 0.6 * (llm.confidence ?? 0.5)); f.intent = Math.max(0, Math.min(25, Math.round(f.intent + d))); }
  const days = (now - new Date(lead.last_activity_at || lead.created_at).getTime()) / 864e5;
  f.recency = days <= 2 ? 10 : days <= 7 ? 6 : days <= 14 ? 3 : 0;
  let num = 0, den = 0; for (const k in MAX) { num += f[k] * w[k]; den += MAX[k] * w[k]; }
  let s = den ? Math.round((num / den) * 100) : 0;
  if (lead.stage === 'lost' || lead.opted_out) s = Math.min(s, 15);
  if (lead.stage === 'admitted') s = Math.max(s, 90);
  const temp = s >= cfg.thresholds.hot ? 'hot' : s >= cfg.thresholds.warm ? 'warm' : 'cold';

  const reasons = [];
  if (hotHits.length) reasons.push({ good: true, text: `Asked about ${hotHits.slice(0, 3).map(h => `“${h}”`).join(', ')}` });
  if (negHits.length) reasons.push({ good: false, text: `Hesitation signals: ${negHits.slice(0, 2).map(h => `“${h}”`).join(', ')}` });
  if (n >= 2) reasons.push({ good: true, text: `${n} replies on WhatsApp — actively engaged` });
  if (n === 0) reasons.push({ good: false, text: 'No reply to WhatsApp messages yet' });
  if (n && mins < 15) reasons.push({ good: true, text: `Replies fast (avg ${Math.round(mins)} min)` });
  if (n && mins >= 240) reasons.push({ good: false, text: `Slow replies (avg ${Math.round(mins / 60)} h)` });
  if (f.source >= 12) reasons.push({ good: true, text: `High-intent source: ${lead.source}` });
  if (f.stage >= 12) reasons.push({ good: true, text: `Progressed to ${STAGE_LABEL[lead.stage]}` });
  if (f.recency === 0) reasons.push({ good: false, text: `No activity for ${Math.round(days)} days` });
  if (lead.opted_out) reasons.push({ good: false, text: 'Opted out of WhatsApp messages' });
  if (llm && llm.signal) reasons.unshift({ good: llm.signal !== 'cold', text: `AI read of replies: ${llm.signal}${llm.summary ? ' — ' + llm.summary : ''}` });

  const nextAction = lead.stage === 'admitted' ? 'Send welcome kit & onboarding checklist'
    : lead.stage === 'lost' ? 'Add to next-session re-engagement list'
    : temp === 'hot' ? (['visit', 'application'].includes(lead.stage) ? 'Call today and close the application / fee payment' : 'Call within 1 hour and book a campus visit')
    : temp === 'warm' ? 'Share fee structure + virtual tour; enroll in Warm Nurture'
    : 'Move to monthly re-engagement drip (Open House invites)';
  return { score: s, temp, factors: f, max: MAX, reasons: reasons.slice(0, 5), nextAction, updatedAt: new Date(now).toISOString(), model: llm && llm.signal ? `k3-qualifier-rules-v1 + ${llm.provider}:${llm.model}` : 'k3-qualifier-rules-v1', llm: llm && llm.signal ? llm : undefined };
}

function classifyRules(text) {
  const t = (text || '').toLowerCase(); const has = a => a.some(k => t.includes(k));
  let intent = 'General enquiry', reply = 'Thank you for reaching out! A counsellor will get back to you shortly. 🙏';
  if (has(['fee', 'fees', 'cost', 'payment', 'scholarship'])) { intent = 'Fee enquiry'; reply = 'Sharing the fee structure for {{program}}. Would you like a counsellor to walk you through instalment options?'; }
  if (has(['visit', 'campus', 'tour', 'saturday', 'come and see'])) { intent = 'Campus visit request'; reply = 'We’d love to host you! Campus tours run Mon–Sat, 10 AM–1 PM. Which day and time suits you?'; }
  if (has(['seat', 'apply', 'form', 'documents', 'admission'])) { intent = 'Ready to apply'; reply = 'Seats for {{program}} are filling fast. I’ll share the application link and the list of documents needed.'; }
  if (has(['bus', 'transport', 'van'])) { intent = 'Transport enquiry'; reply = 'Yes, we offer transport. Could you share your area so I can send the route & timings?'; }
  if (has(['not now', 'next year', 'not interested', 'stop', 'no thanks', 'later'])) { intent = 'Not interested / later'; reply = 'No problem at all! We’ll keep you posted about our Open House. Reply STOP anytime to opt out.'; }
  const pos = has(['great', 'thanks', 'thank you', 'good', 'interested', 'yes', 'sure', 'ok']);
  const neg = has(['expensive', 'too high', 'bad', 'not ', 'worst', 'disappoint']);
  const sentiment = pos && !neg ? 'Positive' : neg && !pos ? 'Negative' : 'Neutral';
  const signal = ['Ready to apply', 'Campus visit request', 'Fee enquiry'].includes(intent) ? 'hot' : intent === 'Not interested / later' ? 'cold' : 'warm';
  return { intent, sentiment, signal, suggestedReply: reply, confidence: 0.75, engine: 'rules' };
}

/* Reply classification + suggested reply, using the configured engine (falls back to rules on any failure) */
async function classify(text, ctx = {}) {
  if (provider() === 'rules' || !engineInfo().configured || !text) return classifyRules(text);
  try {
    const prompt = 'You are an admissions assistant for an Indian educational institution (' + String(ctx.institution || 'school').slice(0, 60) + '). Classify this WhatsApp message from a parent/student and draft a short, warm reply (max 45 words, same language as the message, no placeholders except {{program}}).\n'
      + 'Message: "' + maskPII(String(text).slice(0, 1500)).replace(/"/g, "'") + '"\n'
      + 'Respond ONLY with JSON: {"intent": one of ["Fee enquiry","Campus visit request","Ready to apply","Transport enquiry","Not interested / later","General enquiry"], "sentiment": "Positive"|"Neutral"|"Negative", "signal": "hot"|"warm"|"cold", "confidence": 0-1, "suggestedReply": "..."}';
    const j = await llmJson(prompt, { maxTokens: 300 }); const base = classifyRules(text);
    const INTENTS = ['Fee enquiry', 'Campus visit request', 'Ready to apply', 'Transport enquiry', 'Not interested / later', 'General enquiry'];
    return Object.assign(base, {
      intent: INTENTS.includes(j.intent) ? j.intent : base.intent,
      sentiment: ['Positive', 'Neutral', 'Negative'].includes(j.sentiment) ? j.sentiment : base.sentiment,
      signal: ['hot', 'warm', 'cold'].includes(j.signal) ? j.signal : base.signal,
      confidence: Math.max(0, Math.min(1, +j.confidence || base.confidence)),
      suggestedReply: typeof j.suggestedReply === 'string' && j.suggestedReply.trim() ? j.suggestedReply.slice(0, 600) : base.suggestedReply,
      engine: engineInfo().model,
    });
  } catch (e) { console.warn('AI classify fallback:', e.message); return classifyRules(text); }
}

module.exports = { score, classify, classifyRules, cfgOf, DEFAULT_CONFIG, provider, engineInfo, assessLead, hashMsgs, maskPII };
