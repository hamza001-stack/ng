import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { articles } from '@/lib/catalogue';
import { PageHead } from '@/components/page-head';
import { JsonLd, metadata, siteUrl } from '@/lib/seo';
export function generateStaticParams() {
  return articles.map((a) => ({ id: a.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = articles.find((v) => v.id === id);
  return a
    ? metadata(a.title, a.description, '/blog/' + id)
    : { title: 'Article not found' };
}
export default async function Article({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = articles.find((v) => v.id === id);
  if (!a) notFound();
  return (
    <>
      <PageHead
        title={a.title}
        description={a.description}
        path={'/blog/' + id}
        eyebrow={a.category}
      />
      <article className="container page-body prose">
        <p>{a.body}</p>
        <p>NEVIE-GLOBAL UK · Editorial</p>
        <Link href="/contact" className="text-link">
          Discuss your next project <ArrowUpRight size={16} />
        </Link>
      </article>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.description,
          author: {
            '@type': 'Organization',
            name: 'NEVIE-GLOBAL UK',
            url: siteUrl,
          },
          publisher: { '@type': 'Organization', name: 'NEVIE-GLOBAL UK' },
          mainEntityOfPage: siteUrl + '/blog/' + id,
        }}
      />
    </>
  );
}

export const dynamicParams = false;
