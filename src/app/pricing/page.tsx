import Link from 'next/link';
import { ArrowUpRight, Check, Eye, Layers, Minus, ShieldCheck, Sparkles } from 'lucide-react';
import { Reveal, ShowcaseHero } from '@/features/showcase/motion';
import { FaqAccordion, LiveProducts, ServiceCards } from '@/features/showcase/pricing';
import { QuoteForm } from '@/features/showcase/quote-form';
import { BookCallLink, RelatedServices } from '@/features/showcase/sections';
import { Engage } from '@/features/showcase/engage';
import {
  comparisonRows,
  pricingFaqs,
  pricingPrinciples,
  processSteps,
  relatedServices,
  services,
  TBC,
} from '@/lib/editorial';
import { BreadcrumbSchema, JsonLd, siteUrl } from '@/lib/seo';
import { SitePageHtml } from '@/components/site-page-html';
import { cachedPlans, getPageMetadata } from '@/server/site-content';
import { cachedProductsWithStock } from '@/server/catalog';

export const dynamic = 'force-dynamic';

// SEO title/description can be overridden in Admin → Pages & pricing.
export async function generateMetadata() {
  return getPageMetadata(
    'pricing',
    {
      title: 'Pricing — Simple, Built Around Your Business',
      description:
        'Transparent NEVIE-GLOBAL UK engagement plans, a full feature comparison, service scopes and live marketplace prices.',
    },
    '/pricing',
  );
}

const principleIcons = [Eye, Layers, Sparkles, ShieldCheck];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} className="sx-yes" aria-label="Included" />;
  if (value === false) return <Minus size={16} className="sx-no" aria-label="Not included" />;
  return <span>{value}</span>;
}

export default async function PricingPage() {
  // Plan text/prices: code defaults in src/lib/editorial.ts, overridden by the PricingPlan table.
  const plans = await cachedPlans();
  let products: Awaited<ReturnType<typeof cachedProductsWithStock>> = [];
  try {
    products = await cachedProductsWithStock();
  } catch {
    products = [];
  }

  return (
    <>
      <ShowcaseHero
        badge="Transparent engagements"
        title="Simple Pricing"
        accent="Built Around Your Business"
        description="Four ways to work with us. Service fees are To Be Confirmed and written into each proposal after discovery; marketplace products show their live GBP price."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
        actions={
          <>
            <Link className="sx-btn primary" href="#quote">
              Request a Quote <ArrowUpRight size={16} />
            </Link>
            <BookCallLink label="Book Discovery Call" />
          </>
        }
        aside={
          <div className="sx-glass">
            <span className="sx-eyebrow">Every proposal includes</span>
            <ul className="sx-check-list">
              {['Itemised scope and exclusions', 'Milestones you approve', 'Named contact', 'Support window after launch'].map(
                (item) => (
                  <li key={item}>
                    <Check size={16} /> {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        }
      />

      <div className="container">
        <SitePageHtml pageKey="pricing" />
      </div>

      <section className="container sx-section">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">Why our pricing</span>
          <h2>Priced around the work, not a template.</h2>
        </div>
        <div className="sx-principles">
          {pricingPrinciples.map((item, index) => {
            const Icon = principleIcons[index];
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="sx-principle">
                  <span className="sx-icon">
                    <Icon size={18} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container sx-section" id="plans">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">Plans</span>
          <h2>Choose how you want to engage.</h2>
        </div>
        <div className="sx-plans">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.07}>
              <article className={`sx-plan plan-${plan.id}${plan.featured ? ' featured' : ''}`}>
                {plan.featured ? <span className="sx-plan-badge">Recommended</span> : null}
                <h3>{plan.name}</h3>
                <p className="sx-plan-tagline">{plan.tagline}</p>
                <div className="sx-plan-price">
                  <strong className={plan.price === TBC ? 'tbc' : undefined}>{plan.price}</strong>
                  <span>{plan.priceNote}</span>
                </div>
                <ul>
                  {plan.points.map((point) => (
                    <li key={point}>
                      <Check size={16} /> {point}
                    </li>
                  ))}
                </ul>
                <Link
                  className={plan.featured ? 'sx-btn primary' : 'sx-btn ghost'}
                  href={`/pricing?plan=${plan.id}#quote`}
                >
                  {plan.cta} <ArrowUpRight size={16} />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container sx-section" id="compare">
        <div className="sx-section-head">
          <span className="sx-eyebrow">Compare</span>
          <h2>Feature comparison.</h2>
          <p>“As scoped” and “Optional” items are confirmed in your proposal.</p>
          <p className="sx-tbc-note">Plan inclusions are indicative — final package contents To Be Confirmed.</p>
        </div>
        <Reveal>
          <div className="sx-compare-wrap">
            <table className="sx-compare">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {plans.map((plan) => (
                    <th scope="col" key={plan.id} className={plan.featured ? 'featured' : undefined}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {row.values.map((value, index) => (
                      <td key={plans[index].id} className={plans[index].featured ? 'featured' : undefined}>
                        <CellValue value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      <section className="container sx-section" id="services">
        <div className="sx-section-head">
          <span className="sx-eyebrow">Services</span>
          <h2>What we build.</h2>
          <p>
            Starting prices and typical timelines are To Be Confirmed. Each service is scoped in discovery and the figures
            appear in your proposal.
          </p>
        </div>
        <ServiceCards items={services} />
      </section>

      {products.length ? (
        <section className="container sx-section" id="products">
          <div className="sx-section-head split">
            <div>
              <span className="sx-eyebrow">Marketplace</span>
              <h2>Ready-made products, live prices.</h2>
              <p>These come straight from the shop catalogue and can be bought today.</p>
            </div>
            <Link className="sx-btn ghost" href="/marketplace">
              Open marketplace <ArrowUpRight size={16} />
            </Link>
          </div>
          <LiveProducts products={products.slice(0, 8)} />
        </section>
      ) : null}

      <section className="container sx-section" id="process">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">Process</span>
          <h2>Seven steps from first call to support.</h2>
        </div>
        <ol className="sx-process">
          {processSteps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 0.06}>
              <span className="sx-process-num">{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container sx-section sx-quote" id="quote">
        <div className="sx-quote-intro">
          <span className="sx-eyebrow">Request a quote</span>
          <h2>Tell us about the work.</h2>
          <p>
            The more context you share, the more precise the proposal. Attach a brief if you have one — files are stored
            privately and only visible to our team. Published contact:{' '}
            <a href="mailto:contact@nevie-global.com">contact@nevie-global.com</a>.
          </p>
          <ul className="sx-check-list">
            <li>
              <Check size={16} /> Confirmation email straight away
            </li>
            <li>
              <Check size={16} /> Reviewed by a person, not a bot
            </li>
            <li>
              <Check size={16} /> Attach your own NDA if you need one first
            </li>
          </ul>
        </div>
        <div className="sx-quote-card">
          <QuoteForm />
        </div>
      </section>

      <RelatedServices title="Often added to a build" items={relatedServices(['seo', 'hosting', 'maintenance'])} />

      <section className="container sx-section" id="faq">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">FAQ</span>
          <h2>Questions about pricing.</h2>
        </div>
        <FaqAccordion items={pricingFaqs} />
      </section>

      <Engage quoteHref="#quote" topic="pricing" />
      <BreadcrumbSchema name="Pricing" path="/pricing" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: pricingFaqs.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: 'NEVIE-GLOBAL UK',
          url: `${siteUrl}/pricing`,
          areaServed: 'GB',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Services',
            itemListElement: services.map((service) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: service.name,
                description: service.description,
                url: `${siteUrl}/pricing#service-${service.slug}`,
              },
            })),
          },
        }}
      />
    </>
  );
}
