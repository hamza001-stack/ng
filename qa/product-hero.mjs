import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
for (const [width, theme, id] of [
  [1440, 'dark', 'bracelet-weave'],
  [1440, 'light', 'bracelet-weave'],
  [1440, 'dark', 'founder-card'],
  [390, 'dark', 'bracelet-weave'],
]) {
  const context = await browser.newContext({ viewport: { width, height: width > 500 ? 900 : 844 } });
  await context.addInitScript((t) => {
    localStorage.setItem('nevie-theme', t);
    const original = console.error;
    let logged = 0;
    console.error = (...args) => {
      if (String(args[0]).includes('Maximum update') && logged++ < 1) original('STACK ' + new Error().stack);
      original(...args);
    };
  }, theme);
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.text().startsWith('STACK')) console.log(width, theme, m.text().split('\n').slice(0, 14).join('\n'));
    else if (m.type() === 'error') errors.push(`${width} ${theme} ${m.text().slice(0, 80)}`);
  });
  await page.goto(`http://127.0.0.1:3100/marketplace/${id}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.addStyleTag({ content: '.cookie-banner,.nevie-loader-splash,nextjs-portal{display:none!important}' });
  await page.waitForTimeout(1800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.screenshot({ path: `qa/pd-${id}-${theme}-${width}.png`, fullPage: width < 500 });
  console.log(width, theme, id, 'overflow', overflow);
  await context.close();
}
console.log('ERRORS', errors);
await browser.close();
