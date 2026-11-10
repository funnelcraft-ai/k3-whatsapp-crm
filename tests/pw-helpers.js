/* Shared Playwright helpers: offline fonts (FONTS_DIR) + error capture + screenshots */
const fs = require('fs'); const path = require('path');
const FONTS = process.env.FONTS_DIR;
const SHOTS = path.join(__dirname, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function preparePage(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  if (FONTS) {
    await page.route('https://fonts.googleapis.com/**', r => {
      const u = r.request().url(); let css = '';
      if (u.includes('Material+Symbols')) css = `@font-face{font-family:'Material Symbols Rounded';font-weight:100 700;font-display:block;src:url(https://fonts.gstatic.com/ms.woff2) format('woff2');}`;
      else if (u.includes('Roboto')) css = `@font-face{font-family:'Roboto';font-weight:400;src:url(https://fonts.gstatic.com/r4.woff2)}@font-face{font-family:'Roboto';font-weight:500;src:url(https://fonts.gstatic.com/r5.woff2)}@font-face{font-family:'Roboto';font-weight:600 700;src:url(https://fonts.gstatic.com/r5.woff2)}`;
      r.fulfill({ status: 200, contentType: 'text/css', body: css });
    });
    await page.route('https://fonts.gstatic.com/**', r => {
      const u = r.request().url();
      const f = u.endsWith('ms.woff2') ? FONTS + '/material-symbols/material-symbols-rounded.woff2' : FONTS + '/@fontsource/roboto/files/roboto-latin-' + (u.endsWith('r5.woff2') ? 500 : 400) + '-normal.woff2';
      r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) });
    });
  } else {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  }
  await page.route(/connect\.facebook\.net|checkout\.razorpay\.com/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '/* blocked in tests */' }));
  return errors;
}
const shot = (page, n) => page.screenshot({ path: path.join(SHOTS, n + '.png') });
module.exports = { preparePage, shot, sleep, SHOTS };
