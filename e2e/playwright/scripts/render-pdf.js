const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const file = path.resolve(__dirname, '../../docs/presentation.html');
  await page.goto('file://' + file, { waitUntil: 'load' });
  // small pause to ensure fonts/styles applied
  await page.waitForTimeout(300);
  const out = path.resolve(__dirname, '../../presentatioon.pdf');
  await page.pdf({ path: out, printBackground: true, width: '1000px', height: '700px' });
  console.log('Wrote PDF to', out);
  await browser.close();
})();
