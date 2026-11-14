import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { CaseStudyExplorer, type StudyCard } from '@/features/showcase/case-studies';
import { Counter, ShowcaseHero } from '@/features/showcase/motion';
import { SimilarCta } from '@/features/showcase/sections';
import { Engage } from '@/features/showcase/engage';
import { readingMinutes } from '@/lib/editorial';
import { BreadcrumbSchema, JsonLd, metadata as makeMetadata, siteUrl } from '@/lib/seo';
import { cachedCaseStudies } from '@/server/cms-public';

export const dynamic = 'force-dynamic';

export const metadata = makeMetadata(
  'Case Studies — Real Client Success Stories',
  'Client-approved NEVIE-GLOBAL UK projects: the challenge, the architecture and the measured business results.',
  '/case-studies',
);

export default async function CaseStudiesPage() {
  const rows = await cachedCaseStudies();
  const studies: StudyCard[] = rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    coverUrl: row.coverUrl,
    client: row.client,
    industry: row.industry,
    country: row.country,
    services: row.services,
    technologies: row.technologies,
    results: row.results,
    duration: row.duration,
    year: row.year,
    minutes: readingMinutes(row.body),
  }));
  const industries = new Set(studies.map((study) => study.industry).filter(Boolean)).size;
  const countries = new Set(studies.map((study) => study.country).filter(Boolean)).size;

  return (
    <>
      <ShowcaseHero
        badge="Real Client Success Stories"
        title="Projects That Delivered"
        accent="Real Business Results"
        description="Every study here is client-approved and published from our CMS — the problem, the architecture we chose and the outcome we measured."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Case Studies' }]}
        actions={
          <>
            <Link className="sx-btn primary" href="/pricing#quote">
              Request Similar Project <ArrowUpRight size={16} />
            </Link>
            <Link className="sx-btn ghost" href="/services">
              View Services
            </Link>
          </>
        }
        aside={
          studies.length ? (
            <div className="sx-stat-stack">
              <div className="sx-stat">
                <strong>
                  <Counter value={studies.length} />
                </strong>
                <span>Published studies</span>
              </div>
              {industries ? (
                <div className="sx-stat">
                  <strong>
                    <Counter value={industries} />
                  </strong>
                  <span>Industries</span>
                </div>
              ) : null}
              {countries ? (
                <div className="sx-stat">
                  <strong>
                    <Counter value={countries} />
                  </strong>
                  <span>Countries</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="sx-glass">
              <span className="sx-eyebrow">Every study covers</span>
              <ul className="sx-check-list">
                {['The business challenge', 'Architecture and stack', 'Delivery timeline', 'Verified results'].map(
                  (item) => (
                    <li key={item}>
                      <CheckCircle2 size={16} /> {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )
        }
      />
      <div className="container sx-page">
        <CaseStudyExplorer studies={studies} />
      </div>
      <SimilarCta title="Need Similar Solution?" />
      <Engage topic="a case study" />
      <BreadcrumbSchema name="Case Studies" path="/case-studies" />
      {studies.length ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'NEVIE-GLOBAL UK case studies',
            itemListElement: studies.map((study, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${siteUrl}/case-studies/${study.slug}`,
              name: study.title,
            })),
          }}
        />
      ) : null}
    </>
  );
}
