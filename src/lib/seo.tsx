import type { Metadata } from 'next';
import { publicSiteUrl } from '@/lib/site';
export const siteUrl = publicSiteUrl();
export function metadata(
  title: string,
  description: string,
  path = '/',
  privatePage = false,
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { 'en-GB': path, 'x-default': path },
    },
    robots: privatePage
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'NEVIE-GLOBAL UK',
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: '/brand/og.jpg',
          width: 1200,
          height: 630,
          alt: 'NEVIE-GLOBAL',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/brand/og.jpg'],
      site: '@GlobalNevi52586',
    },
  };
}
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
export function BreadcrumbSchema({
  name,
  path,
}: {
  name: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name, item: siteUrl + path },
        ],
      }}
    />
  );
}
