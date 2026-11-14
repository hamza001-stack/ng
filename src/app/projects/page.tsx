import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Counter, ShowcaseHero } from '@/features/showcase/motion';
import { PhaseTimeline, ProjectExplorer, RoadmapGrid, type ProjectCard } from '@/features/showcase/projects';
import { BookCallLink, SimilarCta } from '@/features/showcase/sections';
import { Engage } from '@/features/showcase/engage';
import { roadmap, toPublicPhase, type ProjectPhase } from '@/lib/editorial';
import { BreadcrumbSchema, metadata as makeMetadata } from '@/lib/seo';
import { cachedPublicProjects } from '@/server/cms-public';

export const dynamic = 'force-dynamic';

export const metadata = makeMetadata(
  'Projects In Development',
  'Follow NEVIE-GLOBAL UK builds from planning to release, and join the waiting list for upcoming products.',
  '/projects',
);

export default async function ProjectsPage() {
  const rows = await cachedPublicProjects();
  const projects: ProjectCard[] = rows.map((row) => ({
    key: row.slug || row.id,
    title: row.title,
    summary: row.summary,
    phase: toPublicPhase(row.phase),
    progress: row.progress,
    category: row.category,
    technologies: row.technologies,
    coverUrl: row.coverUrl,
    teamSize: row.teamSize,
    eta: row.eta ? new Date(row.eta).toISOString() : null,
  }));
  const counts = projects.reduce<Partial<Record<ProjectPhase, number>>>((acc, project) => {
    if (project.phase !== 'TBC') acc[project.phase] = (acc[project.phase] || 0) + 1;
    return acc;
  }, {});
  const upcoming = roadmap.filter((item) => item.status === 'roadmap').length;
  const released = projects.filter((project) => ['RELEASED', 'MAINTENANCE'].includes(project.phase)).length;

  return (
    <>
      <ShowcaseHero
        badge="Building in public"
        title="Projects"
        accent="In Development"
        description="What is live on the NEVIE-GLOBAL platform today and what is still being built. Where a phase, progress figure or date has not been confirmed, it is marked To Be Confirmed."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
        actions={
          <>
            <Link className="sx-btn primary" href="#roadmap">
              Explore the roadmap <ArrowUpRight size={16} />
            </Link>
            <BookCallLink />
          </>
        }
        aside={
          <div className="sx-stat-stack">
            {projects.length ? (
              <>
                <div className="sx-stat">
                  <strong>
                    <Counter value={projects.length} />
                  </strong>
                  <span>Public builds</span>
                </div>
                {released ? (
                  <div className="sx-stat">
                    <strong>
                      <Counter value={released} />
                    </strong>
                    <span>Released</span>
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="sx-stat">
              <strong>
                <Counter value={upcoming} />
              </strong>
              <span>Products on the roadmap</span>
            </div>
          </div>
        }
      />

      <section className="container sx-section">
        <div className="sx-section-head">
          <span className="sx-eyebrow">How a build moves</span>
          <h2>From planning to maintenance.</h2>
          <p>Every project follows the same seven stages, with a review gate before each one.</p>
        </div>
        <PhaseTimeline counts={counts} />
      </section>

      <section className="container sx-section" id="builds">
        <div className="sx-section-head">
          <span className="sx-eyebrow">Live board</span>
          <h2>Current builds.</h2>
        </div>
        <ProjectExplorer projects={projects} />
      </section>

      <section className="container sx-section" id="roadmap">
        <div className="sx-section-head">
          <span className="sx-eyebrow">NEVIE ecosystem</span>
          <h2>Live today, and on the roadmap.</h2>
          <p>
            Marketplace and Academy are live. The other products are planned; their scope, pricing and release dates are To
            Be Confirmed, so join a list to hear first.
          </p>
        </div>
        <RoadmapGrid items={roadmap} />
      </section>

      <SimilarCta title="Have a product idea of your own?" copy="We scope, design and build products like these for clients too." />
      <Engage topic="a project in development" />
      <BreadcrumbSchema name="Projects" path="/projects" />
    </>
  );
}
