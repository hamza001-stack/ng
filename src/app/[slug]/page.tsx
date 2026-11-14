import { ServicesOverview } from '@/components/services-overview';
import { CompanyOverview } from '@/components/company-overview';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';
import { PageHead, InfoCards } from '@/components/page-head';
import { Button } from '@/components/ui/button';
import {
  services,
  routes,
  routeNames,
  slugify,
  privateRoutes,
  faqs,
} from '@/lib/catalogue';
import { JsonLd } from '@/lib/seo';
import { SitePageHtml } from '@/components/site-page-html';
import { getPageMetadata } from '@/server/site-content';
import { Marketplace, Cart } from '@/features/marketplace';
import { Account } from '@/features/account';
import { ContactForm } from '@/features/forms';
import { SocialLinks } from '@/components/social-links';
import { publishedContact } from '@/lib/company';
import { cachedArticles, cachedCaseStudies } from '@/server/cms-public';
import { serviceContent } from '@/lib/service-content';
import { ServicePage } from '@/features/showcase/service-page';
import { FaqPage } from '@/features/showcase/faq-page';
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routes.filter((slug) => slug !== 'portfolio' && slug !== 'marketplace' && slug !== 'academy').map((slug) => ({ slug }));
}
function titleFor(slug: string) {
  return (
    routeNames.find((n) => slugify(n) === slug) ||
    services.find((s) => s[0] === slug)?.[1] ||
    slug
  );
}
const descriptions: Record<string, string> = {
  about:
    'A dedicated UK commercial platform connecting technology expertise, digital products and practical learning.',
  services:
    'Specialist capabilities. One considered approach to your next business challenge.',
  solutions:
    'Start with the outcome. Build the right combination of technology, people and process.',
  industries:
    'The best technology decisions begin with an understanding of your operating environment.',
  marketplace: 'Find a starting point for your next digital idea.',
  academy: 'Practical knowledge for people shaping what comes next.',
  contact:
    'Tell us where you want to go. Let’s explore how technology can help you get there.',
  pricing:
    'Clear scope comes before a clear price. Choose the conversation that fits your next step.',
  blog: 'Ideas to help you make thoughtful technology decisions.',
  faq: 'Straightforward answers about the UK platform.',
  dashboard: 'Your products, learning and next steps in one place.',
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = serviceContent[slug];
  // Admin overrides (Admin → Pages & pricing) win over these code defaults.
  if (content) {
    return {
      ...(await getPageMetadata(
        slug,
        { title: `${content.name} Services UK`, description: content.intro },
        '/' + slug,
      )),
      keywords: content.keywords,
    };
  }
  if (slug === 'faq') {
    return getPageMetadata(
      slug,
      {
        title: 'FAQ — Products, Pre-orders, Academy & Services',
        description:
          'Answers about NEVIE-GLOBAL UK founder access, connected jewellery pre-orders, NEVIE Academy, checkout and services — with open points marked To Be Confirmed.',
      },
      '/faq',
    );
  }
  return getPageMetadata(
    slug,
    {
      title: titleFor(slug),
      description:
        descriptions[slug] ||
        `Explore ${titleFor(slug).toLowerCase()} at NEVIE-GLOBAL UK.`,
    },
    '/' + slug,
    privateRoutes.includes(slug),
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!routes.includes(slug)) notFound();
  const title = titleFor(slug);
  const content = serviceContent[slug];
  if (content || slug === 'faq') {
    return (
      <>
        {content ? <ServicePage content={content} /> : <FaqPage />}
        <div className="container">
          <SitePageHtml pageKey={slug} />
        </div>
      </>
    );
  }
  const service = services.find((s) => s[0] === slug);
  const [caseStudies, cmsArticles] = await Promise.all([
    ['portfolio', 'case-studies'].includes(slug) ? cachedCaseStudies() : Promise.resolve([]),
    slug === 'blog' || slug === 'resources' ? cachedArticles() : Promise.resolve([]),
  ]);
  return (
    <>
      <PageHead
        title={title}
        description={
          service?.[2] ||
          descriptions[slug] ||
          `Explore ${title.toLowerCase()} on the NEVIE-GLOBAL UK platform.`
        }
        path={'/' + slug}
      />
      <div className="container page-body">
        <SitePageHtml pageKey={slug} />
        {slug === 'marketplace' ||
        slug === 'products' ||
        slug === 'wishlist' ? (
          <Marketplace wishlistOnly={slug === 'wishlist'} />
        ) : slug === 'cart' || slug === 'checkout' ? (
          <Cart checkout={slug === 'checkout'} />
        ) : privateRoutes.includes(slug) ? (
          <Account page={slug} />
        ) : slug === 'contact' ? (
          <div className="split" style={{ alignItems: 'start' }}>
            <div>
              <div className="notice">
                Enquiries go to {publishedContact.email}. They are stored as CRM
                leads and emailed when delivery is configured. No public phone
                number is published on nevie-global.com.
              </div>
              <ContactForm />
            </div>
            <aside className="card">
              <span className="eyebrow">OFFICIAL CONTACT</span>
              <h3>NEVIE-GLOBAL</h3>
              <p>
                <a href={`mailto:${publishedContact.email}`}>{publishedContact.email}</a>
              </p>
              <p>Phone, WhatsApp and office address: To Be Confirmed.</p>
              <SocialLinks />
              <Link href="/services" className="text-link">
                Explore our capabilities <ArrowUpRight size={16} />
              </Link>
            </aside>
          </div>
        ) : slug === 'services' ? (
          <ServicesOverview />
        ) : service ? (
          <>
            <div className="split">
              <div>
                <h2>Start with the right problem.</h2>
                <p>
                  {service[2]} We begin by understanding your current workflows,
                  the people who use them and the outcomes you need.
                </p>
                <Button asChild>
                  <Link href="/contact">
                    Discuss your project <ArrowUpRight size={18} />
                  </Link>
                </Button>
              </div>
              <div className="card">
                <h3>Built into the approach</h3>
                {[
                  'Discovery and a clearly defined scope',
                  'Architecture and integration planning',
                  'Accessible, usable experiences',
                  'Validation, handover and ongoing ownership',
                ].map((t) => (
                  <div className="academy-line" key={t}>
                    <Check size={18} color="var(--electric)" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="section">
              <h2>From opportunity to operation.</h2>
              <InfoCards
                items={['Discover', 'Design', 'Deliver'].map((t, i) => ({
                  title: `0${i + 1} / ${t}`,
                  description: [
                    'Map goals, constraints, data and success measures.',
                    'Agree the architecture, experience and delivery scope.',
                    'Build in increments, validate behaviour and prepare the handover.',
                  ][i],
                  href: '/contact',
                }))}
              />
            </div>
          </>
        ) : slug === 'faq' ? (
          <>
            <div className="faq">
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <JsonLd
              data={{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map(([q, a]) => ({
                  '@type': 'Question',
                  name: q,
                  acceptedAnswer: { '@type': 'Answer', text: a },
                })),
              }}
            />
          </>
        ) : slug === 'blog' || slug === 'resources' ? (
          cmsArticles.length === 0 ? (
            <div className="notice">
              No published articles yet. New pieces appear here when they go live.
            </div>
          ) : (
            <InfoCards
              items={cmsArticles.map((article) => ({
                title: article.title,
                description: article.description,
                href: '/blog/' + article.id,
              }))}
            />
          )
        ) : slug === 'solutions' ? (
          <InfoCards
            items={[
              {
                title: 'Intelligent operations',
                description:
                  'Connect information and automate routine work with human approval where it matters.',
                href: '/automation',
              },
              {
                title: 'Customer experience',
                description:
                  'Bring customer journeys together across web, mobile and service.',
                href: '/web-development',
              },
              {
                title: 'Knowledge & intelligence',
                description:
                  'Make approved business knowledge easier to find and use.',
                href: '/private-llm',
              },
              {
                title: 'Digital product delivery',
                description:
                  'Move from an idea to a focused, maintainable software product.',
                href: '/software-development',
              },
              {
                title: 'Connected business systems',
                description:
                  'Improve the flow of information between core systems.',
                href: '/erp',
              },
              {
                title: 'Resilient infrastructure',
                description:
                  'Design for dependable operation, visibility and recovery.',
                href: '/cloud',
              },
            ]}
          />
        ) : slug === 'industries' ? (
          <InfoCards
            items={[
              'Professional services',
              'Retail & commerce',
              'Manufacturing',
              'Education',
              'Healthcare',
              'Financial services',
            ].map((t, i) => ({
              title: t,
              description: [
                'Knowledge access, client workflows and service delivery.',
                'Connected catalogues, customer journeys and operational insight.',
                'Work planning, operational visibility and connected systems.',
                'Learning experiences, administration and knowledge access.',
                'Administrative workflows with privacy and human oversight.',
                'Governed data workflows, reporting and customer operations.',
              ][i],
              href: '/contact',
            }))}
          />
        ) : slug === 'pricing' ? (
          <>
            <div className="notice">
              Service engagements are scoped individually. Marketplace prices
              are illustrative and are not offers for sale.
            </div>
            <InfoCards
              items={[
                {
                  title: 'Discovery',
                  description:
                    'Clarify your challenge, constraints and a practical delivery plan. Request a scoped proposal.',
                  href: '/contact',
                },
                {
                  title: 'Build',
                  description:
                    'A defined engagement to design, implement and validate your solution. Pricing follows agreed scope.',
                  href: '/contact',
                },
                {
                  title: 'Evolve',
                  description:
                    'Discuss an ongoing approach to product improvements, maintenance and operational support.',
                  href: '/contact',
                },
              ]}
            />
          </>
        ) : slug === 'about' ? (
          <CompanyOverview />
        ) : ['portfolio', 'case-studies'].includes(slug) ? (
          <>
            {caseStudies.length === 0 ? (
              <div className="notice">
                No published case studies yet. When an operator publishes from the admin CMS,
                they appear here.
              </div>
            ) : (
              <InfoCards
                items={caseStudies.map((item) => ({
                  title: item.title,
                  description: item.summary,
                  href: `/case-studies/${item.slug}`,
                }))}
              />
            )}
          </>
        ) : slug === 'partners' ? (
          <div className="split">
            <div>
              <h2>Build more, together.</h2>
              <p>
                Explore delivery, technology and learning partnerships around a
                shared customer outcome.
              </p>
              <Button asChild>
                <Link href="/contact">
                  Discuss a partnership <ArrowUpRight size={18} />
                </Link>
              </Button>
            </div>
            <div className="card">
              <h3>A considered partner network</h3>
              <p>
                Partner names and endorsements will be published after
                agreements and brand permissions are in place.
              </p>
            </div>
          </div>
        ) : slug === 'investors' ? (
          <div className="prose">
            <h2>A conversation about the future.</h2>
            <p>
              For enquiries about the UK commercial platform, its direction or
              potential strategic relationships, contact the team. No investment
              offer is made through this website.
            </p>
            <Button asChild>
              <Link href="/contact">
                Make a strategic enquiry <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        ) : slug === 'support' ? (
          <InfoCards
            items={[
              {
                title: 'Product help',
                description:
                  'Find product information and integration guidance.',
                href: '/documentation',
              },
              {
                title: 'Learning support',
                description:
                  'Explore lessons, progress and academy information.',
                href: '/academy',
              },
              {
                title: 'Contact the team',
                description:
                  'Discuss a service enquiry or ask about platform availability.',
                href: '/contact',
              },
              {
                title: 'Frequently asked questions',
                description:
                  'Read answers about purchases, learning and the platform.',
                href: '/faq',
              },
            ]}
          />
        ) : slug === 'documentation' ? (
          <div className="prose">
            <h2>Getting started</h2>
            <p>
              Browse the marketplace, save products to your wishlist and add
              them to your bag. Checkout is handled securely by Stripe in GBP,
              with UK VAT at the configured rate, and you receive an email
              confirmation once payment succeeds. Connected jewellery is sold
              as a pre-order; dispatch dates are To Be Confirmed.
            </p>
            <h2>Learning</h2>
            <p>
              Open a NEVIE Academy course, choose a lesson and mark it
              complete. Lesson progress currently lasts for your browsing
              session only. Saved progress across devices and verified
              certificates are To Be Confirmed.
            </p>
            <h2>Product integration</h2>
            <p>
              Live API documentation, licence details and versioned product
              guides will be published alongside released products.
            </p>
            <Button asChild variant="outline">
              <Link href="/support">
                Get support <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        ) : ['privacy', 'cookies', 'terms', 'legal'].includes(slug) ? (
          <div className="prose">
            <div className="notice">
              Pre-launch notice. Final UK legal documents require the confirmed
              operating entity, service providers and legal review before
              commercial launch.
            </div>
            <h2>
              {slug === 'cookies'
                ? 'Storage on this device'
                : slug === 'privacy'
                  ? 'Your information'
                  : slug === 'terms'
                    ? 'Using this preview'
                    : 'UK platform information'}
            </h2>
            <p>
              {slug === 'cookies'
                ? 'The preview uses local storage for your bag, saved products and lesson progress. It does not enable analytics or advertising cookies. You can clear preview data in Settings or through your browser.'
                : slug === 'privacy'
                  ? 'The preview keeps cart and learning data in your browser. Enquiry and newsletter forms are unavailable until their services are configured. Once connected, the final notice must identify the controller, processing purposes, retention periods, service providers and how to exercise your rights.'
                  : slug === 'terms'
                    ? 'This is a pre-launch frontend preview. Product prices are illustrative, purchases are disabled and lessons do not issue verified certificates. Final purchase, licence, refund and learning terms must be approved before sales begin.'
                    : 'This website represents the UK commercial platform. The registered UK entity name, company number, registered office and applicable tax information must be confirmed before commercial publication.'}
            </p>
            <Link
              href={slug === 'cookies' ? '/settings' : '/contact'}
              className="text-link"
            >
              {slug === 'cookies' ? 'Manage preview data' : 'Contact'}{' '}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : slug === 'blockchain' ? (
          <div className="prose">
            <h2>Start with trust and traceability.</h2>
            <p>
              Explore whether a shared ledger serves your business problem.
              Assess governance, data privacy and integration requirements
              before selecting a blockchain architecture.
            </p>
            <Button asChild>
              <Link href="/contact">
                Discuss your use case <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export const dynamicParams = false;
