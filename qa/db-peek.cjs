const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const cats = await p.category.findMany({ include: { _count: { select: { products: true } } } });
  console.log(JSON.stringify(cats.map(c => [c.slug ?? c.id, c.name, c._count.products])));
  const prods = await p.product.findMany({ select: { id: true, name: true, pricePence: true, published: true, tag: true, category: { select: { name: true } } } });
  console.log(JSON.stringify(prods));
  console.log('articles', await p.cmsArticle.count(), 'courses', await p.cmsCourse.count(), 'cases', await p.caseStudy.count(), 'projects', await p.deliveryProject.count());
  await p.$disconnect();
})();
