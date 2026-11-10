/* End-to-end UI test (Angular Material 3 build) against the live server + fake Meta.
   node tests/ui.test.js     (BASE defaults to http://localhost:8080; FONTS_DIR optional for offline icons) */
const { chromium } = require('playwright');
const crypto = require('crypto');
const { preparePage, shot: snap, sleep } = require('./pw-helpers');
const BASE = process.env.BASE || 'http://localhost:8080';
const SECRET = 'ui-app-secret'; const PNID = 'PNID' + Date.now();
async function hook(key, payload) { const raw = JSON.stringify(payload); return fetch(`${BASE}/webhooks/whatsapp/${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': 'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex') }, body: raw }); }

(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = await preparePage(page);

  // Razorpay Checkout stub (test only): signs like Razorpay with the TEST key secret and calls the success handler
  await page.route(/checkout\.razorpay\.com/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: `
    window.Razorpay = function (o) { this.o = o; };
    window.Razorpay.prototype.on = function () {};
    window.Razorpay.prototype.open = async function () {
      const o = this.o; const pid = 'pay_UI' + Date.now(); const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode('rzp_secret_K3'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const msg = o.order_id ? o.order_id + '|' + pid : pid + '|' + o.subscription_id;
      const sig = [...new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)))].map(b => b.toString(16).padStart(2, '0')).join('');
      window.__rzpOpened = o; setTimeout(() => o.handler(Object.assign({ razorpay_payment_id: pid, razorpay_signature: sig }, o.order_id ? { razorpay_order_id: o.order_id } : { razorpay_subscription_id: o.subscription_id })), 300);
    };` }));
  const shot = n => snap(page, 'ui-' + n);
  const go = async p => { await page.goto(BASE + '/' + p); await sleep(1500); };
  const step = n => console.log('✓', n);
  const api = (path, opts = {}) => page.evaluate(async ([path, opts]) => { const t = sessionStorage.getItem('k3crm-imp') || localStorage.getItem('k3crm-token'); const r = await fetch('/api/v1' + path, Object.assign({}, opts, { headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } })); return r.json(); }, [path, opts]);
  const login = async (email, pw) => { await go('login'); await page.fill('input[name=email]', email); await page.fill('input[name=password]', pw); await page.click('button[type=submit]'); await sleep(2200); };
  const selectOption = async (label, text) => { await page.getByLabel(label).click(); await sleep(300); await page.click(`mat-option:has-text("${text}")`); await sleep(300); };

  // ---------- sign-in ----------
  await go('login'); await shot('01-login');
  await page.fill('input[name=email]', 'demo@k3solutions.in'); await page.fill('input[name=password]', 'wrong-pass'); await page.click('button[type=submit]'); await sleep(800);
  if (!(await page.isVisible('.err'))) throw new Error('no login error shown'); step('wrong password message');
  await page.fill('input[name=password]', 'Demo@12345'); await page.click('button[type=submit]'); await sleep(2500);
  if (!page.url().endsWith('/home')) throw new Error('not on home after login: ' + page.url());
  await page.waitForSelector('.kpi'); await shot('02-home'); step('admin signed in → home with KPIs');

  // ---------- connect WhatsApp manually ----------
  await go('settings/whatsapp');
  if (!(await page.isVisible('text=Manual setup'))) throw new Error('no manual setup panel');
  const panelOpen = await page.isVisible('input[placeholder="+91 98300 12345"]'); if (!panelOpen) { await page.click('mat-expansion-panel-header'); await sleep(500); }
  await page.getByLabel('Phone number ID').fill(PNID); await page.getByLabel('WhatsApp Business Account ID').fill('WABA1');
  await page.getByLabel('Display number').fill('+91 82404 72003'); await page.getByLabel('Meta app ID').fill('APP1');
  await page.getByLabel('Permanent access token').fill('TEST_TOKEN'); await page.getByLabel('App secret').fill(SECRET);
  await page.click('button:has-text("Save credentials")'); await sleep(2500); await shot('03-wa-connected');
  if (!(await page.isVisible('.banner.ok'))) throw new Error('WhatsApp test did not succeed: ' + await page.locator('.banner').last().textContent());
  const webhookUrl = (await page.locator('.copy-row .mono').first().textContent()).trim(); const key = webhookUrl.split('/').pop();
  step('WhatsApp connected via Settings (credentials + live test)');
  for (const t of ['sources', 'messaging', 'institution', 'team', 'billing']) { await go('settings/' + t); await shot('04-settings-' + t); }
  if (!(await page.isVisible('.plan-card'))) throw new Error('billing plans not shown'); step('all settings tabs render (incl. Plan & billing)');

  // ---------- templates ----------
  await go('templates'); await page.click('button:has-text("Sync from Meta")'); await sleep(1800); await shot('05-templates');
  if ((await page.locator('.tpl').count()) < 3) throw new Error('templates not synced'); step('templates synced from Meta');

  // ---------- lead sheet: template, realtime inbound, reply ----------
  await go('leads'); await shot('06-leads');
  const first = (await api('/leads'))[0]; const waId = first.phone.replace(/\D/g, '');
  await page.click('tr.mat-mdc-row >> nth=0'); await sleep(1500); await shot('07-sheet');
  await page.click('k3-lead-sheet .sh-actions button:has-text("WhatsApp")'); await sleep(1500);
  await page.click('k3-lead-sheet .composer button[mattooltip="Send template"], k3-lead-sheet .composer button:has(mat-icon:text-is("article"))'); await sleep(900);
  await page.click('k3-template-pick mat-radio-button >> nth=0'); await page.click('k3-template-pick button:has-text("Send")'); await sleep(1500);
  step('template sent from the lead’s WhatsApp tab');
  await hook(key, { entry: [{ id: 'WABA1', changes: [{ field: 'messages', value: { metadata: { phone_number_id: PNID }, contacts: [{ wa_id: waId, profile: { name: 'P' } }], messages: [{ from: waId, id: 'wamid.UI' + Date.now(), timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: 'Yes please, can we visit on Saturday? What are the fees?' } }] } }] }] });
  await page.waitForSelector('k3-lead-sheet .bub.in:has-text("visit on Saturday")', { timeout: 8000 }); await shot('08-realtime'); step('inbound WhatsApp appears in real time (SSE)');
  await page.waitForFunction(() => !document.querySelector('k3-lead-sheet .composer textarea').disabled, null, { timeout: 5000 });
  await page.fill('k3-lead-sheet .composer textarea', 'Saturday 11 AM is booked for you!'); await page.keyboard.press('Enter'); await sleep(1500);
  if (!(await page.isVisible('k3-lead-sheet .bub.out:has-text("Saturday 11 AM is booked")'))) throw new Error('reply not shown'); step('free-text reply after the 24h window opens');
  await page.click('k3-lead-sheet .sh-tabs .mdc-tab:has-text("Notes")'); await sleep(500); await page.getByLabel('Add a note for the admissions team').fill('UI test note'); await page.click('button:has-text("Add note")'); await sleep(1000);
  if (!(await page.isVisible('k3-lead-sheet :text("UI test note")'))) throw new Error('note not added'); step('note added');
  await page.keyboard.press('Escape'); await sleep(600);

  // ---------- kanban drag ----------
  await go('leads?view=board'); await shot('09-board');
  const card = page.locator('.board-col >> nth=0').locator('.kcard').first(); const target = page.locator('.board-col >> nth=2');
  if (await card.count()) {
    const name = (await card.locator('.n').textContent()).trim();
    const cb = await card.boundingBox(); const tb = await target.boundingBox();
    await page.mouse.move(cb.x + 30, cb.y + 20); await page.mouse.down(); await page.mouse.move(cb.x + 60, cb.y + 40, { steps: 5 }); await page.mouse.move(tb.x + 80, tb.y + 80, { steps: 15 }); await page.mouse.up(); await sleep(1800);
    if (!(await page.locator('.board-col >> nth=2').locator(`.kcard:has-text("${name}")`).count())) throw new Error('drag & drop did not move the card');
    step('kanban drag & drop changes stage');
  }

  // ---------- broadcast with starter creative ----------
  await go('broadcasts/new');
  await page.getByLabel('Campaign name').fill('UI test – Open House'); await page.click('mat-chip-option:has-text("Hot")'); await sleep(700);
  await selectOption('Template', 'open_house_invite'); await shot('10-composer');
  await page.click('button:has-text("Send broadcast")'); await page.waitForURL(/\/broadcasts$/, { timeout: 15000 }); await sleep(6000); await shot('11-broadcasts');
  const status = await page.locator('.bc', { hasText: 'UI test – Open House' }).locator('.pill').first().textContent();
  if (!/Completed|Sending/.test(status)) throw new Error('broadcast not sent: ' + status); step('broadcast with canvas-rendered creative: ' + status.trim());

  // ---------- other screens ----------
  await go('nurture'); await page.click('mat-slide-toggle button >> nth=0'); await sleep(1000); await shot('12-nurture'); step('sequence toggled');
  for (const v of ['inbox', 'followups', 'reports', 'ai-qualifier']) { await go(v); await shot('13-' + v); }
  await page.goto(BASE + '/home'); await sleep(1500);
  await page.fill('.gsearch input', first.parent.split(' ')[0]); await sleep(900);
  if (!(await page.isVisible('mat-option'))) throw new Error('global search returned nothing'); await page.click('mat-option >> nth=0'); await sleep(1200);
  if (!(await page.isVisible('k3-lead-sheet'))) throw new Error('search result did not open the lead'); await page.keyboard.press('Escape'); await sleep(400);
  step('inbox, follow-ups, reports, AI, global search');

  // ---------- platform owner ----------
  await page.click('.acct-btn'); await sleep(400); await page.click('button:has-text("Sign out")'); await sleep(1200);
  await login('owner@k3solutions.in', 'Owner@12345'); await shot('14-platform');
  if (!page.url().includes('/platform/institutions')) throw new Error('owner not on platform: ' + page.url()); step('platform owner → institutions console');
  await page.click('button:has-text("New institution")'); await sleep(500);
  await page.getByLabel('Institution name').fill('St. Paul’s Mission School'); await page.getByLabel('City').fill('Kolkata'); await page.getByLabel('Admin name').fill('Principal');
  await page.getByLabel('Admin email (sign-in ID)').fill(`principal${Date.now()}@stpauls.test`);
  await page.click('k3-tenant-dialog button:has-text("Create institution")'); await sleep(1200); await page.click('k3-confirm button:has-text("Done")'); await sleep(1200);
  if (!(await page.isVisible('td:has-text("St. Paul’s Mission School")'))) throw new Error('institution not listed'); step('institution created with 14-day trial');
  for (const t of ['plans', 'payments', 'backups', 'company', 'admins']) { await go('platform/' + t); await shot('15-platform-' + t); }
  await go('platform/backups'); await page.click('button:has-text("Back up now")'); await sleep(3000);
  if (!(await page.locator('td.mono').count())) throw new Error('backup not listed'); step('platform plans, payments, company, admins; backup created');
  await go('platform/institutions'); await page.click('tr:has-text("St. Paul’s Mission School") button:has-text("Open")'); await sleep(600); await page.fill('k3-support-dialog input', 'UI test support check'); await page.click('k3-support-dialog mat-select'); await sleep(300); await page.click('mat-option:has-text("Full access")'); await sleep(300); await page.click('k3-support-dialog button:has-text("Start session")'); await sleep(2500); await shot('16-support');
  if (!(await page.isVisible('.imp-banner'))) throw new Error('no support banner'); if (!(await page.isVisible('.banner:has-text("trial")'))) throw new Error('trial banner missing');
  step('support session (impersonation) with trial banner');

  // buy the one-time licence through the Plan & billing screen (Razorpay Checkout → signature verify → access)
  await go('settings/billing'); await page.locator('.plan-card', { hasText: 'licence' }).locator('button').click();
  await page.waitForSelector('text=Payment successful', { timeout: 10000 }); await sleep(1500); await shot('16b-paid');
  if (!(await page.locator('.plan-card.current', { hasText: 'licence' }).count())) throw new Error('licence not shown as current plan');
  if (!(await page.isVisible('button[aria-label="View invoice"]'))) throw new Error('no invoice listed');
  if (await page.isVisible('.banner:has-text("trial")')) throw new Error('trial banner still shown after payment');
  step('Razorpay checkout from Plan & billing → licence active, GST invoice listed, trial banner gone');
  await page.click('.imp-banner button'); await sleep(1800); if (await page.isVisible('.imp-banner')) throw new Error('support session did not end'); step('support session ended');

  // ---------- counsellor ----------
  await page.click('.acct-btn'); await sleep(400); await page.click('button:has-text("Sign out")'); await sleep(1000);
  await login('rupa.demo@k3solutions.in', 'Demo@12345');
  const navs = await page.locator('.nav-item .lbl').allTextContents(); if (navs.some(n => n.includes('Settings'))) throw new Error('counsellor sees settings');
  await go('settings'); if (!page.url().endsWith('/home')) throw new Error('counsellor reached settings'); await go('leads'); await shot('17-counsellor'); step('counsellor: no Settings, sees leads');

  // ---------- phone ----------
  await page.setViewportSize({ width: 390, height: 844 }); await go('home'); await shot('18-mobile');
  console.log('ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none');
  await browser.close(); if (errors.length) process.exit(1); console.log('UI TEST PASSED');
})().catch(e => { console.error('✗ UI TEST FAILED:', e.message); process.exit(1); });
