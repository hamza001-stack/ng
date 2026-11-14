import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ProgressRing, Reveal, ShowcaseHero } from '@/features/showcase/motion';
import { WaitlistForm } from '@/features/showcase/projects';
import { BookCallLink, RelatedServices, SimilarCta } from '@/features/showcase/sections';
import { Engage } from '@/features/showcase/engage';
import { PROJECT_PHASES, TBC, phaseLabel, publicPhaseLabel, relatedForLabels, toPublicPhase } from '@/lib/editorial';
import { JsonLd, metadata as makeMetadata, siteUrl } from '@/lib/seo';
import { getPublicProject } from '@/server/cms-public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) return makeMetadata('Project', 'Project in development.', '/projects');
  return makeMetadata(`${project.title} — In Development`, project.summary, `/projects/${project.slug || project.id}`);
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();
  const phase = toPublicPhase(project.phase);
  const current = phase === 'TBC' ? -1 : PROJECT_PHASES.indexOf(phase);
  const live = phase === 'RELEASED' || phase === 'MAINTENANCE';
  const path = `/projects/${project.slug || project.id}`;
  const eta = project.eta
    ? new Date(project.eta).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      <ShowcaseHero
        badge={`${publicPhaseLabel(phase)}${project.category ? ` · ${project.category}` : ''}`}
        title={project.title}
        description={project.summary}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: project.title }]}
        actions={
          <>
            {live ? (
              <Link className="sx-btn primary" href="#demo">
                Request Demo <ArrowUpRight size={16} />
              </Link>
            ) : (
              <>
                <Link className="sx-btn primary" href="#waitlist">
                  Join Waiting List <ArrowUpRight size={16} />
                </Link>
                <Link className="sx-btn ghost" href="#demo">
                  Request Demo
                </Link>
              </>
            )}
            <BookCallLink />
          </>
        }
        aside={
          <div className="sx-glass sx-progress-card">
            <ProgressRing value={project.progress} size={112} />
            <dl className="sx-fact-list">
              <div>
                <dt>Phase</dt>
                <dd>{phase === 'TBC' ? TBC : phaseLabel[phase]}</dd>
              </div>
              {!live ? (
                <div>
                  <dt>Estimated completion</dt>
                  <dd>{eta || TBC}</dd>
                </div>
              ) : null}
              {project.teamSize ? (
                <div>
                  <dt>Team</dt>
                  <dd>{project.teamSize} people</dd>
                </div>
              ) : null}
            </dl>
          </div>
        }
      />

      {project.coverUrl ? (
        <Reveal className="container">
          <div className="sx-detail-cover">
            <Image src={project.coverUrl} alt={project.title} fill priority sizes="(max-width: 1280px) 100vw, 1200px" />
          </div>
        </Reveal>
      ) : null}

      <div className="container sx-detail single">
        <article className="sx-prose">
          <section>
            <h2>Overview</h2>
            <p>{project.summary}</p>
          </section>
          {project.goal ? (
            <section>
              <h2>Goal</h2>
              <p>{project.goal}</p>
            </section>
          ) : null}
          <section>
            <h2>Roadmap</h2>
            <ol className="sx-stepper">
              {PROJECT_PHASES.map((item, index) => (
                <li key={item} className={index < current ? 'done' : index === current ? 'current' : ''}>
                  <span>{index < current ? <CheckCircle2 size={14} /> : index + 1}</span>
                  {phaseLabel[item]}
                </li>
              ))}
            </ol>
            {phase === 'TBC' ? <p className="sx-tbc-note">Current phase: {TBC}.</p> : null}
            {project.progress === null ? (
              <p className="sx-tbc-note">Progress figure: {TBC}.</p>
            ) : (
              <div className="sx-progress-bar" aria-label={`${project.progress}% complete`}>
                <span style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} />
              </div>
            )}
          </section>
          {project.features.length ? (
            <section>
              <h2>Features</h2>
              <ul className="sx-feature-list">
                {project.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 size={16} /> {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {project.technologies.length ? (
            <section>
              <h2>Technology</h2>
              <div className="sx-tags">
                {project.technologies.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </section>
          ) : null}
          <div className="sx-cta-pair">
            {!live ? (
              <section className="sx-glass" id="waitlist">
                <h3>Join the waiting list</h3>
                <p>Be first to hear when {project.title} opens.</p>
                <WaitlistForm product={project.title} />
              </section>
            ) : null}
            <section className="sx-glass" id="demo">
              <h3>Request a demo</h3>
              <p>See the current build with the delivery team.</p>
              <WaitlistForm product={project.title} kind="demo" />
            </section>
          </div>
        </article>
      </div>

      <RelatedServices items={relatedForLabels(project.category ? [project.category] : [])} />
      <SimilarCta />
      <Engage topic={project.title} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
            { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteUrl}/projects` },
            { '@type': 'ListItem', position: 3, name: project.title, item: `${siteUrl}${path}` },
          ],
        }}
      />
    </>
  );
}
