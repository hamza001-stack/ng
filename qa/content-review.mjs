import { chromium } from '@playwright/test';

const base = 'http://127.0.0.1:3100';
const width = Number(process.env.W || 1440);
const targets = [
  ['/case-studies/nevie-global-uk-platform', 'cs-top', null],
  ['/case-studies/nevie-global-uk-platform', 'cs-results', '#results'],
  ['/projects', 'pj-top', null],
  ['/projects', 'pj-builds', '#builds'],
  ['/projects', 'pj-roadmap', '#roadmap'],
  ['/projects/connected-jewellery', 'pj-detail', null],
  ['/pricing', 'pr-plans', '#plans'],
  ['/pricing', 'pr-services', '#services'],
  ['/ai', 'svc-top', null],
  ['/ai', 'svc-features', '.sx-service-split'],
  ['/ai', 'svc-faq', '#faq'],
  ['/faq', 'faq-top', null],
  ['/faq', 'faq-jewellery', '#jewellery'],
  ['/portfolio', 'portfolio', '.sx-portfolio-grid'],
  ['/marketplace/bague-aura', 'product-specs', '.product-detail-grid'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width, height: width > 500 ? 900 : 844 } });
let last = '';
for (const [route, name, selector] of targets) {
  if (route !== last) {
    await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
    await page.addStyleTag({ content: '.cookie-banner,.nevie-loader-splash,nextjs-portal,.sx-sticky,.sx-chat{display:none!important}' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
    });
    last = route;
  }
  if (selector) {
    await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
    }, selector);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `qa/rv-${name}${width < 500 ? '-m' : ''}.png` });
}
await browser.close();
console.log('done');
