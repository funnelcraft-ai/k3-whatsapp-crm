/* UI test for the new security screens: sign-in with a 2FA code, Security tab, support-access switch, activity log, password change.
   Needs the seeded demo school (node server/scripts/seed-demo.js) and the server on :8080.  node tests/security-ui.test.js */
const { chromium } = require('playwright');
const { preparePage, shot: snap, sleep } = require('./pw-helpers');
const totp = require('../server/src/services/totp');
const BASE = process.env.BASE || 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = await preparePage(page);
  const step = n => console.log('✓', n);
  const go = async p => { await page.goto(BASE + '/' + p); await sleep(1500); };
  const login = async (email, pw, otp) => {
    await go('login'); await page.fill('input[name=email]', email); await page.fill('input[name=password]', pw); await page.click('button[type=submit]'); await sleep(1200);
    if (otp) { await page.fill('input[name=otp]', otp); await page.click('button[type=submit]'); await sleep(2200); }
  };
  const email = 'demo@k3solutions.in', pw = 'Demo@12345';

  await login(email, pw); await sleep(1000);
  await go('settings/security'); await snap(page, 'sec-1-tab');
  if (!(await page.isVisible('text=Two-factor authentication')) || !(await page.isVisible('text=Activity log'))) throw new Error('security tab did not render'); step('Security tab renders');

  // two-factor set-up
  await page.fill('input[name=spw]', pw); await page.click('button:has-text("Set up two-factor")'); await sleep(1000);
  const secret = (await page.textContent('code.break')).trim(); if (!/^[A-Z2-7]{32}$/.test(secret)) throw new Error('no setup key shown: ' + secret);
  await page.fill('input[name=ecode]', totp.code(secret, totp.stepAt())); await page.click('button:has-text("Turn on")'); await sleep(1200);
  if (!(await page.isVisible('text=Save these recovery codes'))) throw new Error('recovery codes not shown'); await snap(page, 'sec-2-recovery');
  const recovery = (await page.textContent('.copy-row code')).trim().split(/\s+/); if (recovery.length !== 8) throw new Error('expected 8 recovery codes');
  await page.click('button:has-text("I have saved them")'); await sleep(500);
  if (!(await page.isVisible('text=recovery codes left'))) throw new Error('2FA not shown as on'); step('2FA set up from the Security tab, recovery codes shown once');

  // support-access switch + activity log
  await page.click('mat-slide-toggle:has-text("Allow K3 support")'); await sleep(1000);
  if (!(await page.isVisible('mat-slide-toggle:has-text("Allow K3 support")'))) throw new Error('toggle missing');
  await page.click('mat-slide-toggle:has-text("Allow K3 support")'); await sleep(800);
  await page.click('mat-slide-toggle:has-text("K3 support only")'); await sleep(800); await page.click('mat-slide-toggle:has-text("K3 support only")'); await sleep(800);
  if (!(await page.isVisible('td:has-text("Two-factor turned on")'))) throw new Error('activity log missing the 2FA event'); await snap(page, 'sec-3-log'); step('support-access switch and activity log work');

  // sign out, sign in again: password alone is not enough
  await page.click('.acct-btn'); await sleep(400); await page.click('button[role=menuitem]:has-text("Sign out")'); await sleep(1000);
  await go('login'); await page.fill('input[name=email]', email); await page.fill('input[name=password]', pw); await page.click('button[type=submit]'); await sleep(1200);
  if (!(await page.isVisible('input[name=otp]'))) throw new Error('code field not requested'); if (page.url().endsWith('/home')) throw new Error('signed in without a code');
  await page.fill('input[name=otp]', recovery[0]); await page.click('button:has-text("Verify")'); await sleep(2500);
  if (!page.url().endsWith('/home')) throw new Error('recovery code did not sign in: ' + page.url()); step('sign-in asks for the code; a recovery code signs in');

  // turn 2FA off again so the demo login stays usable for the other tests
  await go('settings/security'); await page.fill('input[name=dpw]', pw);
  const secretNext = totp.code(secret, totp.stepAt() + 1); await page.fill('input[name=dcode]', secretNext); await page.click('button:has-text("Turn off two-factor")'); await sleep(1800);
  if (!page.url().includes('/login')) throw new Error('not signed out after turning 2FA off: ' + page.url()); step('2FA turned off (signs out every session)');
  await login(email, pw); if (!page.url().endsWith('/home')) throw new Error('password-only sign-in should work again'); step('password-only sign-in works again');

  await browser.close();
  if (errors.length) { console.log('ERRORS:', errors.slice(0, 5)); process.exit(1); }
  console.log('ERRORS: none\nSECURITY UI TEST PASSED');
})().catch(e => { console.error('✗ SECURITY UI TEST FAILED:', e.message); process.exit(1); });
