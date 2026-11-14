import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
page.on('console', (m) => console.log('console', m.type(), m.text()));
page.on('response', (r) => r.status() >= 400 && console.log('HTTP', r.status(), r.url()));
await page.goto('http://127.0.0.1:3100' + (process.argv[2] || '/projects'), { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 200));
  }
});
await page.waitForTimeout(1500);
console.log(
  await page.evaluate(() => ({
    roadmapOpacity: [...document.querySelectorAll('.sx-roadmap-card')].map((n) => getComputedStyle(n).opacity).join(','),
    cardOpacity: [...document.querySelectorAll('.sx-project-card')].map((n) => getComputedStyle(n).opacity).join(','),
    serviceHtml: document.querySelector('.sx-timeline')?.outerHTML.slice(0, 300),
  })),
);
console.log(
  await page.evaluate(() => ({
    stats: [...document.querySelectorAll('.sx-stat strong')].map((n) => n.outerHTML.slice(0, 120)),
    steps: [...document.querySelectorAll('.sx-timeline-step')].map((n) => getComputedStyle(n).opacity),
    roadmap: document.querySelectorAll('.sx-roadmap-card').length,
    cards: document.querySelectorAll('.sx-project-card').length,
  })),
);
await browser.close();
