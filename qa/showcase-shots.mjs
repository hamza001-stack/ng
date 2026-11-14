import { chromium } from '@playwright/test';

const base = 'http://127.0.0.1:3100';
const routes = [
  ['/case-studies', 'case-studies'],
  ['/case-studies/qa-layout-check', 'case-study-detail'],
  ['/projects', 'projects'],
  ['/projects/qa-layout-check', 'project-detail'],
  ['/pricing', 'pricing'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.cookie-banner,.nevie-loader-splash{display:none!important}' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

for (const [width, suffix] of [
  [1440, ''],
  [390, '-mobile'],
]) {
  const page = await browser.newPage({ viewport: { width, height: width > 500 ? 960 : 844 } });
  page.on('pageerror', (e) => errors.push(`${width} ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${width} console ${m.text()}`));
  for (const [route, name] of routes) {
    const res = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90000 });
    await settle(page);
    await page.addStyleTag({ content: '.sx-sticky{display:none!important}' });
    await page.screenshot({ path: `qa/sx-${name}${suffix}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(width, route, res?.status(), 'h1:', await page.locator('h1').count(), 'overflowX:', overflow);
  }
  if (width > 500) {
    await page.goto(base + '/pricing#quote', { waitUntil: 'networkidle' });
    await settle(page);
    await page.locator('#quote').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.locator('.sx-quote-card').screenshot({ path: 'qa/sx-quote-form.png' });
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa/sx-sticky-cta.png' });
    await page.locator('.sx-chat-toggle').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'qa/sx-chat.png' });
    await page.locator('.sx-chat-toggle').click();

    const form = page.locator('.sx-quote-form');
    await form.locator('button[type=submit]').first().click();
    await page.waitForTimeout(400);
    await page.locator('.sx-quote-card').screenshot({ path: 'qa/sx-quote-validation.png' });
    await form.locator('input[name=name]').fill('QA Layout');
    await form.locator('input[name=email]').fill('qa-layout@example.invalid');
    await form.locator('select[name=service]').selectOption('CRM');
    await form.locator('textarea[name=details]').fill('Automated QA submission to verify the quote pipeline.');
    await form.locator('input[name=privacy]').check();
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/api/quote')),
      form.locator('button[type=submit]').first().click(),
    ]);
    console.log('quote submit', response.status(), await response.text());
    await page.waitForTimeout(600);
    await page.locator('.sx-quote-card').screenshot({ path: 'qa/sx-quote-success.png' });
  }
  await page.close();
}
console.log('ERRORS', errors);
await browser.close();
