import { chromium } from '@playwright/test';

const base = 'http://127.0.0.1:3100';
const routes = (process.env.ROUTES || '/case-studies,/case-studies/nevie-global-uk-platform,/projects,/projects/connected-jewellery,/portfolio,/pricing,/ai,/automation,/faq,/marketplace/bague-aura')
  .split(',');
const widths = (process.env.WIDTHS || '1440,390').split(',').map(Number);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.cookie-banner,.nevie-loader-splash,nextjs-portal,.sx-sticky{display:none!important}' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width > 500 ? 960 : 844 } });
  page.on('pageerror', (e) => errors.push(`${width} ${page.url()} ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${width} ${page.url()} console ${m.text().slice(0, 200)}`));
  for (const route of routes) {
    const res = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
    await settle(page);
    const name = route.replace(/^\//, '').replace(/\//g, '_') || 'home';
    await page.screenshot({ path: `qa/ct-${name}${width < 500 ? '-mobile' : ''}.png`, fullPage: true });
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      tbc: (document.body.innerText.match(/To Be Confirmed|TBC/gi) || []).length,
    }));
    console.log(width, route, res?.status(), JSON.stringify(info));
  }
  await page.close();
}
console.log('ERRORS', JSON.stringify(errors, null, 1));
await browser.close();
