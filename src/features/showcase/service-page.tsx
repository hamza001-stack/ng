import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { Reveal, ShowcaseHero } from './motion';
import { FaqAccordion } from './pricing';
import { BookCallLink, RelatedServices, SimilarCta } from './sections';
import { Engage } from './engage';
import { processSteps, services as pricedServices } from '@/lib/editorial';
import { serviceCommercials, serviceContent, serviceFaqs, type ServiceContent } from '@/lib/service-content';
import { BreadcrumbSchema, JsonLd, siteUrl } from '@/lib/seo';

function relatedCards(content: ServiceContent) {
  return content.related
    .map((slug) => serviceContent[slug])
    .filter((item): item is ServiceContent => Boolean(item))
    .map((item) => ({ name: item.name, description: item.intro.split('. ')[0] + '.', href: `/${item.slug}` }));
}

export function ServicePage({ content }: { content: ServiceContent }) {
  const path = `/${content.slug}`;
  const quoteSlug = pricedServices.find((item) => item.page === content.slug)?.slug;
  const quoteHref = quoteSlug ? `/pricing?service=${quoteSlug}#quote` : '/pricing#quote';
  const faqs = serviceFaqs(content);

  return (
    <>
      <ShowcaseHero
        badge={content.eyebrow}
        title={content.headline}
        accent={content.accent}
        description={content.intro}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: content.name }]}
        actions={
          <>
            <Link className="sx-btn primary" href={quoteHref}>
              Request a Quote <ArrowUpRight size={16} />
            </Link>
            <BookCallLink label="Book Discovery Call" />
          </>
        }
        aside={
          <div className="sx-glass">
            <span className="sx-eyebrow">Engagement</span>
            <dl className="sx-fact-list">
              <div>
                <dt>Starting price</dt>
                <dd>{serviceCommercials.startingPrice}</dd>
              </div>
              <div>
                <dt>Typical timeline</dt>
                <dd>{serviceCommercials.timeline}</dd>
              </div>
              <div>
                <dt>How we engage</dt>
                <dd>{serviceCommercials.engagement}</dd>
              </div>
              <div>
                <dt>Market</dt>
                <dd>United Kingdom · GBP</dd>
              </div>
            </dl>
            <p className="sx-tbc-note">{serviceCommercials.note}</p>
          </div>
        }
      />

      <Reveal className="container">
        <div className="sx-detail-cover service">
          <Image src={content.image} alt={`${content.name} — NEVIE-GLOBAL UK`} fill priority sizes="(max-width: 1280px) 100vw, 1200px" />
        </div>
      </Reveal>

      <section className="container sx-section">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">Outcomes</span>
          <h2>What you should expect.</h2>
        </div>
        <div className="sx-principles three">
          {content.outcomes.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <div className="sx-principle">
                <span className="sx-icon">{index === 0 ? <Target size={18} /> : index === 1 ? <Sparkles size={18} /> : <CheckCircle2 size={18} />}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container sx-section">
        <div className="sx-service-split">
          <Reveal>
            <div className="sx-section-head">
              <span className="sx-eyebrow">Capabilities</span>
              <h2>Features.</h2>
            </div>
            <ul className="sx-feature-list">
              {content.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={16} /> {feature}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="sx-glass">
              <span className="sx-eyebrow">Deliverables</span>
              <h3>What you receive</h3>
              <ul className="sx-check-list">
                {content.deliverables.map((item) => (
                  <li key={item}>
                    <Check size={16} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container sx-section">
        <div className="sx-section-head">
          <span className="sx-eyebrow">Typical use cases</span>
          <h2>Where this helps.</h2>
        </div>
        <div className="sx-tags large">
          {content.useCases.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="container sx-section">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">Process</span>
          <h2>Seven steps from first call to support.</h2>
        </div>
        <ol className="sx-process">
          {processSteps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 0.05}>
              <span className="sx-process-num">{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {content.universe || content.course ? (
        <section className="container sx-section">
          <div className="sx-section-head">
            <span className="sx-eyebrow">NEVIE ecosystem</span>
            <h2>Related NEVIE products.</h2>
          </div>
          <div className="sx-related">
            {content.universe ? (
              <Reveal>
                <Link className="sx-related-card" href={content.universe.href || '/projects#roadmap'}>
                  <strong>{content.universe.name}</strong>
                  <p>{content.universe.copy}</p>
                  <span className="sx-tbc-note">
                    {content.universe.status === 'live' ? 'Live now' : 'On the roadmap · availability To Be Confirmed'}
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              </Reveal>
            ) : null}
            {content.course ? (
              <Reveal delay={0.06}>
                <Link className="sx-related-card" href={content.course.href}>
                  <strong>{content.course.title}</strong>
                  <p>A NEVIE Academy course that covers the foundations before you commission work.</p>
                  <span className="sx-tbc-note live">Live on NEVIE Academy</span>
                  <ArrowUpRight size={16} />
                </Link>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      <RelatedServices items={relatedCards(content)} />

      <section className="container sx-section" id="faq">
        <div className="sx-section-head center">
          <span className="sx-eyebrow">FAQ</span>
          <h2>Questions about {content.name}.</h2>
        </div>
        <FaqAccordion items={faqs} />
      </section>

      <SimilarCta title={`Planning ${content.name.toLowerCase()} work?`} />
      <Engage quoteHref={quoteHref} topic={content.name} />
      <BreadcrumbSchema name={content.name} path={path} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: content.name,
          serviceType: content.name,
          description: content.intro,
          url: `${siteUrl}${path}`,
          areaServed: { '@type': 'Country', name: 'United Kingdom' },
          provider: { '@type': 'Organization', name: 'NEVIE-GLOBAL UK', url: siteUrl },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${content.name} deliverables`,
            itemListElement: content.deliverables.map((item) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: item },
            })),
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
    </>
  );
}
