import assert from 'node:assert/strict';
import { routes, products, courses, articles } from '../src/lib/catalogue';
const origin = 'http://localhost:3001';
const paths = [
  '/',
  ...routes.map((r) => '/' + r),
  ...products.map((p) => '/marketplace/' + p.id),
  ...courses.map((c) => '/academy/' + c.id),
  ...articles.map((a) => '/blog/' + a.id),
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
  '/rss.xml',
  '/image-sitemap.xml',
];
async function main() {
  let passed = 0;
  for (let i = 0; i < paths.length; i += 6) {
    await Promise.all(
      paths.slice(i, i + 6).map(async (path) => {
        const r = await fetch(origin + path);
        assert.equal(r.status, 200, path);
        passed++;
      }),
    );
  }
  assert.equal((await fetch(origin + '/not-a-real-route')).status, 404);
  const page = await fetch(origin + '/dashboard');
  assert.match(await page.text(), /noindex/);
  const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  assert.ok(!sitemap.includes(origin + '/dashboard'));
  assert.ok(!sitemap.includes('/dashboard</loc>'));
  const valid = {
    name: 'Alex',
    email: 'alex@example.com',
    company: 'Example',
    message: 'We would like to discuss a new software project.',
    consent: true,
  };
  const post = (data: unknown, requestOrigin = origin) =>
    fetch(origin + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: requestOrigin },
      body: JSON.stringify(data),
    });
  assert.equal((await post({})).status, 400);
  assert.equal((await post(valid, 'https://untrusted.example')).status, 403);
  assert.equal((await post(valid)).status, 503);
  console.log(
    JSON.stringify(
      {
        successfulRoutes: passed,
        unknownRoute: 404,
        invalidForm: 400,
        crossOrigin: 403,
        unconfiguredService: 503,
        privateMetadata: 'noindex',
      },
      null,
      2,
    ),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
