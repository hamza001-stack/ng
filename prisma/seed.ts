import { PrismaClient, Role } from '@prisma/client';
import { products, articles, courses } from '../src/lib/catalogue';

const prisma = new PrismaClient();

async function main() {
  for (const product of products) {
    const category = await prisma.category.upsert({
      where: { slug: product.category.toLowerCase().replaceAll(' ', '-') },
      update: { name: product.category },
      create: {
        slug: product.category.toLowerCase().replaceAll(' ', '-'),
        name: product.category,
      },
    });
    const compareAtPence =
      'compareAtPrice' in product && typeof product.compareAtPrice === 'number'
        ? Math.round(product.compareAtPrice * 100)
        : null;
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.id,
        description: product.description,
        categoryId: category.id,
        pricePence: Math.round(product.price * 100),
        compareAtPence,
        stock: 25,
        published: true,
        tag: product.tag,
        features: [...product.features],
        imageUrl: `/products/${product.id}.webp`,
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.id,
        description: product.description,
        categoryId: category.id,
        pricePence: Math.round(product.price * 100),
        compareAtPence,
        stock: 25,
        published: true,
        tag: product.tag,
        features: [...product.features],
        imageUrl: `/products/${product.id}.webp`,
      },
    });
  }

  for (const article of articles) {
    await prisma.cmsArticle.upsert({
      where: { id: article.id },
      update: {
        title: article.title,
        category: article.category,
        description: article.description,
        body: article.body,
        published: true,
      },
      create: {
        id: article.id,
        title: article.title,
        category: article.category,
        description: article.description,
        body: article.body,
      },
    });
  }

  for (const course of courses) {
    await prisma.cmsCourse.upsert({
      where: { id: course.id },
      update: {
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        description: course.description,
        published: true,
      },
      create: {
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration,
        description: course.description,
      },
    });
    await prisma.cmsLesson.deleteMany({ where: { courseId: course.id } });
    await prisma.cmsLesson.createMany({
      data: course.lessons.map((lesson, index) => ({
        courseId: course.id,
        title: lesson.title,
        body: lesson.body,
        index,
      })),
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'FOUNDING10' },
    update: { percent: 10, active: true },
    create: { code: 'FOUNDING10', percent: 10, active: true },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
