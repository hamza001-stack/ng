import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
for (const [route, selector, name] of [
  ['/pricing', '#compare', 'compare-dark'],
  ['/pricing', '#plans', 'plans-light'],
  ['/pricing', '#compare', 'compare-light'],
  ['/case-studies', 'main', 'case-studies-light'],
]) {
  await page.goto('http://127.0.0.1:3100' + route, { waitUntil: 'networkidle' });
  if (name.endsWith('light')) await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  await page.addStyleTag({ content: '.cookie-banner,.nevie-loader-splash{display:none!important}' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
  });
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await el.screenshot({ path: `qa/sx-${name}.png` });
}
await browser.close();
