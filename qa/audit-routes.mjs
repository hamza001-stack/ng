const base = 'http://127.0.0.1:3100';
const routes = [
  '/',
  '/marketplace',
  '/marketplace/bague-aura',
  '/marketplace/category/founder-access',
  '/marketplace/category/connected-jewellery',
  '/academy',
  '/blog',
  '/resources',
  '/services',
  '/ai',
  '/crm',
  '/saas',
  '/automation',
  '/about',
  '/contact',
  '/faq',
  '/documentation',
  '/support',
  '/pricing',
  '/solutions',
  '/industries',
  '/partners',
  '/investors',
  '/case-studies',
  '/privacy',
  '/cookies',
  '/terms',
  '/legal',
  '/sign-in',
  '/sign-up',
  '/dashboard',
  '/my-account',
  '/orders',
  '/cart',
  '/checkout',
  '/wishlist',
  '/products',
  '/settings',
  '/subscriptions',
  '/not-a-real-page',
];
const out = [];
for (const path of routes) {
  const res = await fetch(base + path, { redirect: 'manual' });
  const html = await res.text();
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  out.push({
    path,
    status: res.status,
    title: title.slice(0, 64),
    desc: html.includes('name="description"'),
    canon: html.includes('rel="canonical"'),
    og: html.includes('property="og:title"'),
    h1: (html.match(/<h1/gi) || []).length,
    jsonld: html.includes('application/ld+json'),
  });
}
console.table(out);
