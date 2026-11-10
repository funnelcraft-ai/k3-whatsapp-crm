/* Responsive audit (Angular build): screenshots + horizontal-overflow detection for every screen at common device sizes.
   Demo build:  DEMO=http://localhost:8090/index.html node tests/responsive.test.js   (serve web/dist/demo)
   Live server: BASE=http://localhost:8080 LOGIN=demo@k3solutions.in:Demo@12345 node tests/responsive.test.js */
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const { preparePage, sleep } = require('./pw-helpers');
const BASE = process.env.BASE; const DEMO = process.env.DEMO || 'http://localhost:8090/index.html'; const ONLY = process.env.ONLY;
const OUT = path.join(__dirname, 'shots', 'responsive'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = [
  ['phone-se', { width: 360, height: 740, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['phone', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['tablet', { width: 768, height: 1024, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }],
  ['tablet-land', { width: 1024, height: 768, hasTouch: true, deviceScaleFactor: 1 }],
  ['laptop', { width: 1280, height: 800, deviceScaleFactor: 1 }],
  ['desktop', { width: 1920, height: 1080, deviceScaleFactor: 1 }],
].filter(s => !ONLY || ONLY.split(',').includes(s[0]));
const VIEWS = ['home', 'leads', 'leads?view=board', 'inbox', 'followups', 'nurture', 'broadcasts', 'broadcasts/new', 'templates', 'reports', 'ai-qualifier', 'settings/whatsapp', 'settings/sources', 'settings/messaging', 'settings/team', 'settings/billing', ...(BASE ? [] : ['api'])];

(async () => {
  const browser = await chromium.launch(); const problems = [];
  for (const [name, vp] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor });
    const page = await ctx.newPage(); const errs = await preparePage(page);
    const nav = async v => {
      if (BASE) await page.goto(BASE + '/' + v);
      else { await page.evaluate(n => { location.hash = '#' + n; }, v.split('?')[0].replace(/\//g, '-')); await sleep(900); if (v.includes('view=board')) await page.click('mat-button-toggle:has(mat-icon:text-is("view_kanban")) button'); }
      await sleep(1400);
    };
    if (BASE) {
      await page.goto(BASE + '/login'); await sleep(1000); await page.screenshot({ path: path.join(OUT, `${name}-login.png`) });
      const [e, p] = (process.env.LOGIN || 'demo@k3solutions.in:Demo@12345').split(':');
      await page.fill('input[name=email]', e); await page.fill('input[name=password]', p); await page.click('button[type=submit]'); await sleep(2200);
    } else { await page.goto(DEMO); await sleep(2000); }
    const check = async label => {
      const r = await page.evaluate(() => {
        const W = document.documentElement.clientWidth; const bad = [];
        const docOver = document.documentElement.scrollWidth > W + 1;
        document.querySelectorAll('body *').forEach(el => {
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return;
          const b = el.getBoundingClientRect(); if (!b.width || !b.height) return;
          let p = el.parentElement, clipped = false;
          while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) { const pb = p.getBoundingClientRect(); if (pb.right <= W + 1) { clipped = true; break; } } p = p.parentElement; }
          if (!clipped && b.right > W + 2) bad.push((el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase()) + ` → ${Math.round(b.right)}px`);
        });
        return { docOver, bad: [...new Set(bad)].slice(0, 6) };
      });
      if (r.docOver || r.bad.length) problems.push(`${name} ${label}: ${r.docOver ? 'PAGE SCROLLS SIDEWAYS; ' : ''}${r.bad.join(', ')}`);
    };
    const snap = n => page.screenshot({ path: path.join(OUT, `${name}-${n}.png`) });
    for (const v of VIEWS) { await nav(v); const n = v.replace(/[/?=]/g, '_'); await snap(n); await check(v); }
    // lead side sheet + its chat
    await nav('leads');
    const row = await page.$(vp.width <= 760 ? '.mcard' : 'tr.mat-mdc-row');
    if (row) {
      await row.click(); await sleep(1400); await snap('sheet'); await check('lead sheet');
      await page.click('k3-lead-sheet .sh-actions button:has-text("WhatsApp")'); await sleep(1200); await snap('sheet-chat'); await check('lead sheet chat');
      await page.keyboard.press('Escape'); await sleep(500);
    } else problems.push(`${name}: no lead rows`);
    // dialog
    await page.click('.page-head button:has-text("New enquiry")'); await sleep(700); await snap('dialog'); await check('new-lead dialog'); await page.keyboard.press('Escape'); await sleep(400);
    // inbox → chat (phones show list first)
    await nav('inbox'); const conv = await page.$('.conv'); if (conv) { await conv.click(); await sleep(1400); await snap('inbox-chat'); await check('inbox chat'); }
    if (vp.width <= 860) { await page.click('.menu-btn'); await sleep(600); await snap('menu'); await page.keyboard.press('Escape'); }
    if (errs.length) problems.push(`${name} JS errors: ${errs.join(' | ')}`);
    await ctx.close(); console.log('checked', name);
  }
  await browser.close();
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'NO OVERFLOW PROBLEMS');
  if (problems.length) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
