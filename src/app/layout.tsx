import type { Metadata } from 'next';
import { Orbitron, Roboto_Condensed } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { AppChrome } from '@/components/app-chrome';
import { Providers } from '@/components/providers';
import { CatalogProvider } from '@/components/catalog-provider';
import { JsonLd, siteUrl, metadata as makeMetadata } from '@/lib/seo';
import './globals.css';
import './storefront.css';
import './brand.css';
import './editorial.css';
import { getCommerce } from '@/lib/commerce-server';
import { CommerceProvider } from '@/components/commerce-provider';
import { ShoppingOverlays } from '@/features/shop';
import { SiteOverlays } from '@/components/site-overlays';
import { cachedPublishedProducts } from '@/server/catalog';
import { log } from '@/server/logger';
import type { ShopProduct } from '@/lib/commerce';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display-loaded',
});
const roboto = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body-loaded',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...makeMetadata(
    'NEVIE-GLOBAL UK | Build what comes next',
    'AI, software and automation for your next chapter. Explore the NEVIE-GLOBAL UK commercial platform.',
  ),
  title: {
    default: 'NEVIE-GLOBAL UK | Build what comes next',
    template: '%s | NEVIE-GLOBAL UK',
  },
  icons: { icon: '/icon.png', apple: '/icon.png' },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let products: ShopProduct[] = [];
  try {
    products = await cachedPublishedProducts();
  } catch (error) {
    log('error', 'catalogue_unavailable', {
      detail: error instanceof Error ? error.message : 'unknown',
    });
  }
  const catalogue = await getCommerce();
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale === 'fr' ? 'fr' : 'en-GB'} suppressHydrationWarning data-theme="dark" className={`${orbitron.variable} ${roboto.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('nevie-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}",
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CatalogProvider products={products}>
            <Providers>
              <CommerceProvider initialData={catalogue}>
                <AppChrome>{children}</AppChrome>
                <ShoppingOverlays />
                <SiteOverlays />
              </CommerceProvider>
            </Providers>
          </CatalogProvider>
        </NextIntlClientProvider>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'NEVIE-GLOBAL UK',
            url: siteUrl,
            logo: siteUrl + '/brand/logo.webp',
            email: process.env.LEGAL_CONTACT_EMAIL || 'contact@nevie-global.com',
            vatID: process.env.LEGAL_VAT_NUMBER,
            sameAs: [
              'https://www.instagram.com/nevie.global',
              'https://x.com/GlobalNevi52586',
              'https://www.linkedin.com/in/nevie-global-09361638b/',
            ],
            address: process.env.LEGAL_REGISTERED_OFFICE
              ? {
                  '@type': 'PostalAddress',
                  streetAddress: process.env.LEGAL_REGISTERED_OFFICE,
                  addressCountry: 'GB',
                }
              : undefined,
          }}
        />
      </body>
    </html>
  );
}
