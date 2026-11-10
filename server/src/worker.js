/* Background automation worker: nurture sequences + scheduled / throttled broadcasts.
   Safe to run on multiple instances (rows are claimed with FOR UPDATE SKIP LOCKED). */
const { config, q, one, many, events } = require('./core');
const CRM = require('./services/crm');
const WA = require('./services/whatsapp');

/* Exponential back-off for transient WhatsApp errors (rate limits, Meta 5xx, network) */
const MAX_ATTEMPTS = +(process.env.RETRY_MAX_ATTEMPTS || 6);
const BASE_MS = +(process.env.RETRY_BASE_MS || 30000);
const CAP_MS = +(process.env.RETRY_MAX_DELAY_MS || 30 * 60e3);
const backoff = attempt => { const d = Math.min(CAP_MS, BASE_MS * 2 ** Math.max(0, attempt - 1)); return Math.round(d * (0.8 + Math.random() * 0.4)); };

async function runSequences() {
  let done = 0;
  const due = await many(`UPDATE enrollments SET next_run_at = now() + interval '5 minutes' WHERE id IN (
      SELECT e.id FROM enrollments e JOIN sequences s ON s.id=e.sequence_id JOIN tenants t ON t.id=e.tenant_id
      WHERE e.status='active' AND s.active AND t.status='active' AND e.next_run_at <= now() ORDER BY e.next_run_at LIMIT 50 FOR UPDATE OF e SKIP LOCKED)
    RETURNING *`);
  for (const e of due) {
    done++;
    try {
      const [seq, t, lead] = await Promise.all([one(`SELECT * FROM sequences WHERE id=$1`, [e.sequence_id]), CRM.getTenant(e.tenant_id), one(`SELECT * FROM leads WHERE id=$1`, [e.lead_id])]);
      const steps = seq.steps || []; const step = steps[e.step];
      const finish = status => q(`UPDATE enrollments SET status=$2 WHERE id=$1`, [e.id, status]);
      if (!lead || !step) { await finish('completed'); continue; }
      if (lead.opted_out || ['admitted', 'lost'].includes(lead.stage)) { await finish('stopped'); continue; }
      if (step.kind === 'condition') {
        if (e.replied) { await finish('completed'); await CRM.timeline(t.id, lead.id, 'call_split', `“${seq.name}” stopped — parent replied`); continue; }
      } else if (step.kind === 'task') {
        await q(`INSERT INTO followups(tenant_id, lead_id, type, due_at, note, owner_id, auto) VALUES ($1,$2,$3, now(), $4, $5, true)`, [t.id, lead.id, step.taskType || 'call', `${step.title}${step.detail ? ' — ' + step.detail : ''}`, lead.counsellor_id]);
        await q(`UPDATE leads SET next_follow_up = LEAST(coalesce(next_follow_up, now()), now()) WHERE id=$1`, [lead.id]);
      } else if (step.kind === 'send') {
        try {
          const r = await CRM.sendToLead(t, lead, { type: 'template', template: step.template || step.title }, null, 'sequence', { headerMedia: step.mediaId ? { id: step.mediaId } : null, throwRetryable: true });
          if (r.status === 'sent') await CRM.timeline(t.id, lead.id, 'send', `“${seq.name}”: sent ${step.template || step.title}`);
        } catch (err) {
          if (WA.isRetryable(err) && e.attempts + 1 < MAX_ATTEMPTS) {   // keep the step, try again later
            await q(`UPDATE enrollments SET attempts=attempts+1, last_error=$2, next_run_at=now() + make_interval(secs => $3) WHERE id=$1`, [e.id, err.message, backoff(e.attempts + 1) / 1000]);
            continue;
          }
          await CRM.timeline(t.id, lead.id, 'error', `“${seq.name}” step skipped: ${err.message}`);
        }
      }
      const next = e.step + 1;
      if (next >= steps.length) await finish('completed');
      else await q(`UPDATE enrollments SET step=$2, attempts=0, last_error=NULL, next_run_at=now() + make_interval(mins => $3) WHERE id=$1`, [e.id, next, +steps[next].delayMinutes || 0]);
    } catch (err) { console.error('sequence step error', err); }
  }
  return done;
}

const bcCache = new Map();
async function runBroadcasts() {
  let done = 0;
  // 1. scheduled → sending
  for (const b of await many(`SELECT id, tenant_id FROM broadcasts WHERE status='Scheduled' AND scheduled_at <= now() LIMIT 10`)) {
    done++;
    try { await CRM.startBroadcast(await CRM.getTenant(b.tenant_id), b.id); }
    catch (e) { await q(`UPDATE broadcasts SET status='Failed' WHERE id=$1`, [b.id]); console.error('broadcast start failed', e.message); }
  }
  // 2. send queued recipients (throttled)
  const batch = await many(`UPDATE broadcast_recipients SET status='sending' WHERE id IN (
      SELECT r.id FROM broadcast_recipients r JOIN broadcasts b ON b.id=r.broadcast_id WHERE r.status='queued' AND (r.next_attempt_at IS NULL OR r.next_attempt_at <= now()) AND b.status='Sending' ORDER BY r.attempts, b.sent_at, r.id LIMIT $1 FOR UPDATE OF r SKIP LOCKED) RETURNING *`, [config.sendRatePerTick]);
  const touched = new Set(); done += batch.length;
  const throttled = new Set(); // tenants that just hit a Meta rate limit → pause the rest of this batch
  for (let i = 0; i < batch.length; i += 10) {
    await Promise.all(batch.slice(i, i + 10).map(async r => {
      try {
        let b = bcCache.get(r.broadcast_id); if (!b) { b = await one(`SELECT * FROM broadcasts WHERE id=$1`, [r.broadcast_id]); bcCache.set(r.broadcast_id, b); }
        const [t, lead] = await Promise.all([CRM.getTenant(r.tenant_id), one(`SELECT * FROM leads WHERE id=$1`, [r.lead_id])]);
        touched.add(r.broadcast_id + '|' + r.tenant_id);
        if (!lead || lead.opted_out) { await q(`UPDATE broadcast_recipients SET status='failed', error='Opted out' WHERE id=$1`, [r.id]); return; }
        if (throttled.has(r.tenant_id)) { await q(`UPDATE broadcast_recipients SET status='queued', next_attempt_at=now() + make_interval(secs => $2) WHERE id=$1`, [r.id, BASE_MS / 1000]); return; }
        const out = await CRM.sendToLead(t, lead, { type: 'template', template: b.template, media: b.creative && b.creative.mediaId ? { id: b.creative.mediaId } : null }, b.created_by, 'broadcast', { recordFailure: true, silent: true, throwRetryable: true });
        await q(`UPDATE broadcast_recipients SET wa_message_id=$2, status=$3, error=$4, attempts=attempts+1, sent_at=now() WHERE id=$1`, [r.id, out.waId, out.status, out.error]);
      } catch (e) {
        const attempts = r.attempts + 1;
        if (WA.isRetryable(e) && attempts < MAX_ATTEMPTS) {
          if (+e.code === 130429 || +e.code === 80007 || e.httpStatus === 429) throttled.add(r.tenant_id);
          await q(`UPDATE broadcast_recipients SET status='queued', attempts=$2, error=$3, next_attempt_at=now() + make_interval(secs => $4) WHERE id=$1`, [r.id, attempts, e.message, backoff(attempts) / 1000]);
        } else {
          // dead-letter: permanently failed — listed under "Failed" on the broadcast with a Retry button
          await q(`UPDATE broadcast_recipients SET status='failed', attempts=$2, error=$3, sent_at=now() WHERE id=$1`, [r.id, attempts, (attempts >= MAX_ATTEMPTS ? `Gave up after ${attempts} attempts: ` : '') + e.message]);
        }
      }
    }));
  }
  // 3. finish + progress events
  for (const b of await many(`SELECT b.id, b.tenant_id FROM broadcasts b WHERE b.status='Sending' AND NOT EXISTS (SELECT 1 FROM broadcast_recipients r WHERE r.broadcast_id=b.id AND r.status IN ('queued','sending'))`)) {
    await q(`UPDATE broadcasts SET status='Completed' WHERE id=$1`, [b.id]); bcCache.delete(b.id); touched.add(b.id + '|' + b.tenant_id);
  }
  for (const k of touched) { const [id, tid] = k.split('|'); events.emit(tid, 'broadcast', await CRM.broadcastOut(id)); }
  return done;
}

/* housekeeping: diagnostic logs don't grow forever (the audit log is kept) */
let lastPrune = 0;
async function prune() {
  if (Date.now() - lastPrune < 6 * 36e5) return; lastPrune = Date.now();
  try { await q(`DELETE FROM webhook_log WHERE created_at < now() - interval '30 days'`); } catch (e) { console.warn('prune', e.message); }
}

let running = false;
async function tick() {
  if (running) return 0; running = true; let n = 0;
  try { n += await runSequences(); n += await runBroadcasts(); require('./services/backup').maybeRun().catch(() => {}); prune(); }
  catch (e) { console.error('worker tick', e); }
  finally { running = false; }
  return n;
}
async function start() {
  await q(`UPDATE broadcast_recipients SET status='queued' WHERE status='sending' AND wa_message_id IS NULL`); // recover after crash
  setInterval(tick, config.workerIntervalMs).unref();
  console.log(`worker running every ${config.workerIntervalMs}ms`);
}
module.exports = { start, tick, runSequences, runBroadcasts };
