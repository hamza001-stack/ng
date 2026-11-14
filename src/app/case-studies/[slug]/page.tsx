import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Download, TrendingUp } from 'lucide-react';
import { ShowcaseHero, Reveal } from '@/features/showcase/motion';
import { BookCallLink, RelatedServices, SimilarCta } from '@/features/showcase/sections';
import { StudyToc } from '@/features/showcase/study-toc';
import { RichText } from '@/features/showcase/rich-text';
import { Engage } from '@/features/showcase/engage';
import { parseStudyBody, readingMinutes, relatedForLabels } from '@/lib/editorial';
import { JsonLd, metadata as makeMetadata, siteUrl } from '@/lib/seo';
import { cachedCaseStudies, getPublishedCaseStudy } from '@/server/cms-public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getPublishedCaseStudy(slug);
  if (!study) return makeMetadata('Case study', 'Published delivery write-up.', '/case-studies');
  const base = makeMetadata(`${study.title} — Case Study`, study.summary, `/case-studies/${study.slug}`);
  if (!study.coverUrl) return base;
  return {
    ...base,
    openGraph: { ...base.openGraph, type: 'article', images: [{ url: study.coverUrl, alt: study.title }] },
    twitter: { ...base.twitter, images: [study.coverUrl] },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getPublishedCaseStudy(slug);
  if (!study) notFound();
  const { intro, sections } = parseStudyBody(study.body);
  const minutes = readingMinutes(study.body);
  const related = (await cachedCaseStudies()).filter((item) => item.slug !== study.slug).slice(0, 3);
  const hasResultsSection = sections.some((section) => section.id === 'results');
  const toc = [
    ...(intro ? [{ id: 'overview', title: 'Overview' }] : []),
    ...sections.map((section) => ({ id: section.id, title: section.title })),
    ...(study.results.length && !hasResultsSection ? [{ id: 'results-summary', title: 'Results' }] : []),
  ];
  const resultCards = study.results.length ? (
    <div className="sx-result-grid">
      {study.results.map((result, index) => (
        <Reveal key={result} delay={index * 0.06}>
          <div className="sx-result-card">
            <TrendingUp size={18} />
            <p>{result}</p>
          </div>
        </Reveal>
      ))}
    </div>
  ) : null;
  const facts = [
    ['Client', study.client],
    ['Industry', study.industry],
    ['Country', study.country],
    ['Year', study.year ? String(study.year) : null],
    ['Duration', study.duration],
    ['Reading time', `${minutes} min`],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <>
      <ShowcaseHero
        badge={study.industry ? `Case Study · ${study.industry}` : 'Case Study'}
        title={study.title}
        description={study.summary}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Case Studies', href: '/case-studies' }, { label: study.title }]}
        actions={
          <>
            <Link className="sx-btn primary" href="/pricing#quote">
              Request Similar Project <ArrowUpRight size={16} />
            </Link>
            <BookCallLink label="Book Discovery Call" />
          </>
        }
        aside={
          <dl className="sx-glass sx-fact-list">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        }
      />

      {study.coverUrl ? (
        <Reveal className="container">
          <div className="sx-detail-cover">
            <Image src={study.coverUrl} alt={study.title} fill priority sizes="(max-width: 1280px) 100vw, 1200px" />
          </div>
        </Reveal>
      ) : null}

      <div className="container sx-detail">
        <aside className="sx-detail-side">
          <StudyToc items={toc} />
          {study.technologies.length ? (
            <div className="sx-side-block">
              <span className="sx-eyebrow">Tech stack</span>
              <div className="sx-tags">
                {study.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>
          ) : null}
          {study.services.length ? (
            <div className="sx-side-block">
              <span className="sx-eyebrow">Services used</span>
              <ul className="sx-plain-list">
                {study.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {study.duration || study.year ? (
            <div className="sx-side-block">
              <span className="sx-eyebrow">Timeline</span>
              <p>{[study.year, study.duration].filter(Boolean).join(' · ')}</p>
            </div>
          ) : null}
        </aside>

        <article className="sx-prose">
          {intro ? (
            <section id="overview">
              <h2>Overview</h2>
              <RichText text={intro} />
            </section>
          ) : null}
          {sections.map((section) => (
            <Reveal as="section" key={section.id}>
              <div id={section.id} className="sx-anchor">
                <h2>{section.title}</h2>
                <RichText text={section.body} />
                {section.id === 'results' ? resultCards : null}
              </div>
            </Reveal>
          ))}
          {resultCards && !hasResultsSection ? (
            <section id="results-summary">
              <h2>Results</h2>
              {resultCards}
            </section>
          ) : null}
          {study.fileUrl ? (
            <a className="sx-btn ghost" href={study.fileUrl} target="_blank" rel="noreferrer">
              <Download size={16} /> Download attachment
            </a>
          ) : null}
          <div className="sx-inline-cta">
            <div>
              <strong>Want an outcome like this?</strong>
              <p>Share your goals and we will propose a first release.</p>
            </div>
            <div className="sx-actions">
              <Link className="sx-btn primary" href="/pricing#quote">
                Request Similar Project
              </Link>
              <BookCallLink label="Book Discovery Call" />
            </div>
          </div>
        </article>
      </div>

      <RelatedServices items={relatedForLabels(study.services)} />

      {related.length ? (
        <section className="container sx-section">
          <div className="sx-section-head">
            <span className="sx-eyebrow">Keep reading</span>
            <h2>More case studies</h2>
          </div>
          <div className="sx-related">
            {related.map((item) => (
              <Link key={item.slug} href={`/case-studies/${item.slug}`} className="sx-related-card">
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <SimilarCta title="Need Similar Solution?" />
      <Engage topic={study.title} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Case Studies', item: `${siteUrl}/case-studies` },
            { '@type': 'ListItem', position: 3, name: study.title, item: `${siteUrl}/case-studies/${study.slug}` },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': ['Article', 'CreativeWork'],
          headline: study.title,
          description: study.summary,
          url: `${siteUrl}/case-studies/${study.slug}`,
          image: study.coverUrl ? `${siteUrl}${study.coverUrl}` : undefined,
          datePublished: new Date(study.createdAt).toISOString(),
          dateModified: new Date(study.updatedAt).toISOString(),
          genre: 'Case study',
          about: study.industry || undefined,
          keywords: [...study.services, ...study.technologies].join(', ') || undefined,
          author: { '@type': 'Organization', name: 'NEVIE-GLOBAL UK', url: siteUrl },
          publisher: { '@type': 'Organization', name: 'NEVIE-GLOBAL UK', url: siteUrl },
        }}
      />
    </>
  );
}
