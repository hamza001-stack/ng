import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Counter, Reveal, ShowcaseHero } from '@/features/showcase/motion';
import { ShowcaseEmpty } from '@/features/showcase/empty';
import { SimilarCta } from '@/features/showcase/sections';
import { publicPhaseLabel, toPublicPhase } from '@/lib/editorial';
import { BreadcrumbSchema, JsonLd, metadata as makeMetadata, siteUrl } from '@/lib/seo';
import { cachedCaseStudies, cachedPublicProjects } from '@/server/cms-public';

export const dynamic = 'force-dynamic';

export const metadata = makeMetadata(
  'Portfolio — Case Studies & Platform Builds',
  'NEVIE-GLOBAL UK portfolio: published case studies and live platform builds, with open details marked To Be Confirmed.',
  '/portfolio',
);

type Entry = {
  key: string;
  kind: 'Case study' | 'Platform build';
  title: string;
  summary: string;
  href: string;
  cover: string | null;
  status: string;
  tags: string[];
};

export default async function PortfolioPage() {
  const [studies, projects] = await Promise.all([cachedCaseStudies(), cachedPublicProjects()]);
  const entries: Entry[] = [
    ...studies.map((study) => ({
      key: `cs-${study.id}`,
      kind: 'Case study' as const,
      title: study.title,
      summary: study.summary,
      href: `/case-studies/${study.slug}`,
      cover: study.coverUrl,
      status: study.industry || 'Case study',
      tags: study.services.slice(0, 3),
    })),
    ...projects.map((project) => ({
      key: `pj-${project.id}`,
      kind: 'Platform build' as const,
      title: project.title,
      summary: project.summary,
      href: `/projects/${project.slug || project.id}`,
      cover: project.coverUrl,
      status: publicPhaseLabel(toPublicPhase(project.phase)),
      tags: project.technologies.slice(0, 3),
    })),
  ];

  return (
    <>
      <ShowcaseHero
        badge="Portfolio"
        title="Work we can"
        accent="show you."
        description="Published case studies and the builds behind the NEVIE-GLOBAL platform. Client work appears here only once the client has approved it."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Portfolio' }]}
        actions={
          <>
            <Link className="sx-btn primary" href="/case-studies">
              Case studies <ArrowUpRight size={16} />
            </Link>
            <Link className="sx-btn ghost" href="/projects">
              Projects in development
            </Link>
          </>
        }
        aside={
          entries.length ? (
            <div className="sx-stat-stack">
              <div className="sx-stat">
                <strong>
                  <Counter value={studies.length} />
                </strong>
                <span>Published case {studies.length === 1 ? 'study' : 'studies'}</span>
              </div>
              <div className="sx-stat">
                <strong>
                  <Counter value={projects.length} />
                </strong>
                <span>Public platform builds</span>
              </div>
            </div>
          ) : undefined
        }
      />

      <section className="container sx-section">
        {entries.length === 0 ? (
          <ShowcaseEmpty
            variant="studies"
            eyebrow="Portfolio"
            title="Nothing published yet."
            copy="Case studies and public builds appear here as soon as they are published from the admin CMS."
            actions={
              <Link className="sx-btn primary" href="/pricing#quote">
                Start your project <ArrowUpRight size={16} />
              </Link>
            }
          />
        ) : (
          <div className="sx-portfolio-grid">
            {entries.map((entry, index) => (
              <Reveal key={entry.key} delay={Math.min(index, 5) * 0.05}>
                <Link className="sx-portfolio-card" href={entry.href}>
                  <div className="sx-portfolio-media">
                    {entry.cover ? (
                      <Image src={entry.cover} alt="" fill sizes="(max-width: 980px) 100vw, 33vw" className="sx-cover-img" />
                    ) : (
                      <div className="sx-cover-fallback" aria-hidden="true">
                        <span>{entry.title.slice(0, 1)}</span>
                      </div>
                    )}
                    <span className={`sx-status ${entry.kind === 'Case study' ? 'phase-released' : 'phase-development'}`}>
                      {entry.kind}
                    </span>
                  </div>
                  <div className="sx-portfolio-body">
                    <span className="sx-meta-label">{entry.status}</span>
                    <h3>{entry.title}</h3>
                    <p>{entry.summary}</p>
                    {entry.tags.length ? (
                      <div className="sx-tags small">
                        {entry.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SimilarCta />
      <BreadcrumbSchema name="Portfolio" path="/portfolio" />
      {entries.length ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: entries.map((entry, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: entry.title,
              url: `${siteUrl}${entry.href}`,
            })),
          }}
        />
      ) : null}
    </>
  );
}
