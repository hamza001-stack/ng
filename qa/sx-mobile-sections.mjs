import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const shots = [
  ['/pricing', '.sx-hero', 'pricing-hero'],
  ['/pricing', '#plans', 'pricing-plans'],
  ['/pricing', '#compare', 'pricing-compare'],
  ['/pricing', '#process', 'pricing-process'],
  ['/pricing', '#quote', 'pricing-quote'],
  ['/projects', '.sx-timeline', 'projects-timeline'],
  ['/case-studies/qa-layout-check', '.sx-hero', 'study-hero'],
];
let current = '';
for (const [route, selector, name] of shots) {
  if (route !== current) {
    await page.goto('http://127.0.0.1:3100' + route, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '.cookie-banner,.nevie-loader-splash,.sx-chat{display:none!important}' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
    });
    current = route;
  }
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await el.screenshot({ path: `qa/sx-m-${name}.png` });
  console.log(name, 'ok');
}
await browser.close();
