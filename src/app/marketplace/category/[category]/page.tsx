import { notFound } from 'next/navigation';
import { Marketplace } from '@/features/marketplace';
import { metadata, BreadcrumbSchema } from '@/lib/seo';
import { listPublishedProducts } from '@/server/catalog';

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await listPublishedProducts();
    const categories = [...new Set(products.map((product) => product.category))];
    return categories.map((category) => ({
      category: category.toLowerCase().replaceAll(' ', '-'),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const products = await listPublishedProducts();
  const value = products
    .map((product) => product.category)
    .find((item) => item.toLowerCase().replaceAll(' ', '-') === category);
  return value
    ? metadata(
        value + ' products',
        'Explore the NEVIE-GLOBAL ' + value + ' collection.',
        '/marketplace/category/' + category,
      )
    : {};
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const products = await listPublishedProducts();
  const value = products
    .map((product) => product.category)
    .find((item) => item.toLowerCase().replaceAll(' ', '-') === category);
  if (!value) notFound();
  return (
    <>
      <section className="category-banner">
        <div className="container">
          <span className="eyebrow">NEVIE-GLOBAL MARKETPLACE</span>
          <h1>{value}</h1>
          <p>Browse the {value.toLowerCase()} collection.</p>
        </div>
      </section>
      <div className="container page-body">
        <Marketplace initialCategory={value} />
      </div>
      <BreadcrumbSchema name={value} path={'/marketplace/category/' + category} />
    </>
  );
}
