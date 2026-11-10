/* Demo-only extra endpoints (settings, team, billing) answered in the browser */
window.DemoExtra = (() => {
  const KEY = 'k3crm-demo-extra';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* */ } };
  const plan = (id, name, billing, rupees, users, contacts, desc, features) => ({ id, code: id, name, billing, description: desc, pricePaise: rupees * 100, gstPercent: 18, taxPaise: Math.round(rupees * 18), totalPaise: Math.round(rupees * 118), currency: 'INR', maxUsers: users, maxContacts: contacts, features, active: true });
  let st = load() || {
    institution: { name: 'Greenfield Academy', type: 'School', city: 'Kolkata', session: '2027–28', plan: 'Growth', maxUsers: 8, maxContacts: 10000 },
    settings: { programs: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 3', 'Class 5', 'Class 6', 'Class 8', 'Class 9', 'Class 11 – Science', 'Class 11 – Commerce'], spend: { 'Meta Ads': 45000, 'Google Ads': 60000, 'JustDial': 8000 }, deadlineText: '30 November', applyLink: 'greenfield.edu/apply', welcomeTemplate: 'welcome_enquiry', countryCode: '91', counsellorSeesAll: true },
    whatsapp: { phoneNumberId: '1098765432109', wabaId: '2233445566', displayNumber: '+91 82404 72003', appId: '', hasAccessToken: true, hasAppSecret: true, webhookUrl: 'https://crm.greenfield.edu/webhooks/whatsapp/9f3c…', verifyToken: 'a71c2e9b04d5' },
    team: [
      { id: 'c1', name: 'Admissions Office', email: 'admissions@greenfield.edu', role: 'admin', color: '#1a5fb4', active: true, lastLoginAt: new Date().toISOString() },
      { id: 'c2', name: 'Rupa Sen', email: 'rupa@greenfield.edu', role: 'counsellor', color: '#188038', active: true, lastLoginAt: new Date(Date.now() - 3600e3).toISOString() },
      { id: 'c3', name: 'Arijit Das', email: 'arijit@greenfield.edu', role: 'counsellor', color: '#e37400', active: true, lastLoginAt: new Date(Date.now() - 86400e3).toISOString() },
      { id: 'c4', name: 'Neha Kapoor', email: 'neha@greenfield.edu', role: 'counsellor', color: '#9334e6', active: true, lastLoginAt: new Date(Date.now() - 2 * 86400e3).toISOString() },
    ],
    billing: { billingEmail: 'accounts@greenfield.edu', gstin: '19AABCG1234F1Z5', address: 'Salt Lake Sector V, Kolkata 700091' },
  };
  const settingsOut = () => ({ institution: st.institution, settings: st.settings, whatsapp: st.whatsapp,
    embeddedSignup: { enabled: true, appId: 'demo', configId: 'demo', graphVersion: 'v21.0' },
    leadSources: { metaPageId: '1122334455', hasPageToken: true, googleLeadKey: 'gf-ads-key', websiteWebhook: 'https://crm.greenfield.edu/hooks/leads/9f3c…', googleWebhook: 'https://crm.greenfield.edu/hooks/google-ads/9f3c…', metaWebhook: st.whatsapp.webhookUrl } });
  const plans = [plan('p1', 'Starter', 'monthly', 2999, 3, 2000, 'For pre-schools and small institutes', ['WhatsApp inbox & templates', 'AI lead qualification']), plan('p2', 'Growth', 'monthly', 5999, 8, 10000, 'For schools running admissions campaigns', ['Everything in Starter', 'Broadcasts with creatives', 'Nurture sequences']), plan('p3', 'Growth (yearly)', 'yearly', 59990, 8, 10000, 'Growth billed yearly — 2 months free', ['Everything in Growth']), plan('p4', 'Lifetime licence', 'one_time', 49999, 10, 20000, 'One-time payment, no monthly fee', ['Everything in Growth', 'Pay once'])];
  const now = Date.now();
  const payments = [0, 1, 2].map(i => ({ id: 'pay' + i, invoiceNo: `K3/2026-27/00${12 - i}`, kind: 'subscription', status: 'captured', amountPaise: 707882, taxPaise: 107982, currency: 'INR', description: 'Growth — monthly subscription', createdAt: new Date(now - i * 30 * 864e5).toISOString() }));
  const clone = o => JSON.parse(JSON.stringify(o));
  function handle(method, path, body) {
    const p = path.split('?')[0];
    if (p === '/settings' && method === 'GET') return settingsOut();
    if (p === '/settings' && method === 'PUT') {
      if (body.institution) Object.assign(st.institution, body.institution);
      if (body.settings) Object.assign(st.settings, body.settings);
      if (body.whatsapp) { const w = Object.assign({}, body.whatsapp); if (w.accessToken) st.whatsapp.hasAccessToken = true; if (w.appSecret) st.whatsapp.hasAppSecret = true; delete w.accessToken; delete w.appSecret; Object.assign(st.whatsapp, w); }
      save(); return settingsOut();
    }
    if (p === '/settings/whatsapp/test') return { ok: true, info: { display_phone_number: st.whatsapp.displayNumber, verified_name: st.institution.name, quality_rating: 'GREEN' } };
    if (p === '/settings/rotate-webhook-key') return settingsOut();
    if (p === '/team' && method === 'GET') return clone(st.team);
    if (p === '/team' && method === 'POST') { const u = { id: 'u' + Date.now(), name: body.name, email: body.email, role: body.role, phone: body.phone, color: '#12a4af', active: true, lastLoginAt: null }; st.team.push(u); save(); return u; }
    let m = p.match(/^\/team\/([^/]+)$/); if (m && method === 'PATCH') { const u = st.team.find(x => x.id === m[1]); const b = Object.assign({}, body); delete b.password; Object.assign(u, b); save(); return clone(u); }
    if (p === '/billing' && method === 'GET') return Object.assign({ enabled: true, keyId: 'rzp_demo', status: 'active', plan: plans[1], currentPeriodEnd: new Date(now + 18 * 864e5).toISOString(), accessUntil: new Date(now + 18 * 864e5).toISOString(), locked: false, graceDays: 5, hasSubscription: true, plans, payments }, st.billing);
    if (p === '/billing/details') { Object.assign(st.billing, body); save(); return { ok: true }; }
    if (p === '/templates/recommended') return { results: [] };
    m = p.match(/^\/templates\/([^/]+)\/preview$/); if (m) return { text: '' };
    if (p.startsWith('/billing/invoices/')) return '<!DOCTYPE html><html><body style="font-family:Roboto,Arial;padding:40px"><h1>Tax Invoice (demo)</h1><p>K3 Solutions · GST invoice preview.</p></body></html>';
    return undefined;
  }
  return { handle, reset: () => { try { localStorage.removeItem(KEY); } catch (e) { /* */ } } };
})();
