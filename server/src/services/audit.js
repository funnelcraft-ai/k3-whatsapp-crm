/* Audit trail. Never throws — a logging problem must not break the request. */
const { q, many } = require('../core');

const clip = (v, n = 2000) => { try { const s = JSON.stringify(v ?? {}); return s.length > n ? { truncated: true, preview: s.slice(0, n) } : v ?? {}; } catch (e) { return {}; } };

/* req may be null (system events). opts: { tenantId, action, target, detail, actor: {id,email,role} } */
async function audit(req, { tenantId, action, target, detail, actor, support } = {}) {
  try {
    const u = actor || (req && req.user ? { id: req.user.id, email: req.user.email, role: req.user.role } : {});
    const t = tenantId !== undefined ? tenantId : (req && req.tenant ? req.tenant.id : null);
    await q(`INSERT INTO audit_log(tenant_id, actor_id, actor_email, actor_role, support, action, target, detail, ip, ua) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [t || null, u.id || null, u.email || null, u.role || null, support !== undefined ? !!support : !!(req && req.impersonating), action, target || null, clip(detail), req ? req.ip : null, req && req.headers ? String(req.headers['user-agent'] || '').slice(0, 300) : null]);
  } catch (e) { console.error('audit failed', e.message); }
}

const out = r => ({ id: r.id, at: r.at, tenantId: r.tenant_id, tenantName: r.tenant_name, actor: r.actor_email, actorRole: r.actor_role, support: r.support, action: r.action, target: r.target, detail: r.detail, ip: r.ip });
async function list({ tenantId, limit = 200, before, support } = {}) {
  const p = []; const w = [];
  if (tenantId) { p.push(tenantId); w.push(`a.tenant_id=$${p.length}`); }
  if (before) { p.push(before); w.push(`a.id < $${p.length}`); }
  if (support) w.push(`a.support`);
  p.push(Math.max(1, Math.min(500, parseInt(limit, 10) || 200)));
  return (await many(`SELECT a.*, t.name AS tenant_name FROM audit_log a LEFT JOIN tenants t ON t.id=a.tenant_id ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY a.id DESC LIMIT $${p.length}`, p)).map(out);
}
module.exports = { audit, list };
