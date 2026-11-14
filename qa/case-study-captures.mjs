import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = 'http://127.0.0.1:3100';
const out = 'public/case-studies/nevie-platform';
mkdirSync(out, { recursive: true });

const shots = [
  ['/', 'storefront', 'dark'],
  ['/marketplace', 'marketplace', 'light'],
  ['/marketplace/bague-aura', 'product', 'light'],
  ['/academy', 'academy', 'dark'],
  ['/pricing', 'pricing', 'dark'],
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [route, name, theme] of shots) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme });
  const page = await context.newPage();
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
  await page.addStyleTag({
    content: '.cookie-banner,.nevie-loader-splash,.sx-sticky,.sx-chat,nextjs-portal{display:none!important}',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 82 });
  console.log('captured', route);
  await context.close();
}
await browser.close();
