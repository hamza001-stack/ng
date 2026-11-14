'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, CalendarDays, CheckCircle2, Users } from 'lucide-react';
import {
  PROJECT_PHASES,
  deliveryStages,
  phaseLabel,
  publicPhaseLabel,
  type ProjectPhase,
  type PublicPhase,
  type RoadmapItem,
} from '@/lib/editorial';
import { ProgressRing } from './motion';
import { ShowcaseEmpty } from './empty';

export type ProjectCard = {
  key: string;
  title: string;
  summary: string;
  phase: PublicPhase;
  progress: number | null;
  category: string | null;
  technologies: string[];
  coverUrl: string | null;
  teamSize: number | null;
  eta: string | null;
};

const formatEta = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null;

export function PhaseTimeline({ counts }: { counts: Partial<Record<ProjectPhase, number>> }) {
  const reduce = useReducedMotion();
  return (
    <div className="sx-timeline" role="list">
      <motion.span
        className="sx-timeline-line"
        aria-hidden="true"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {deliveryStages.map((stage, index) => (
        <motion.div
          role="listitem"
          className="sx-timeline-step"
          key={stage.phase}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.15 + index * 0.12 }}
        >
          <span className="sx-timeline-node">{String(index + 1).padStart(2, '0')}</span>
          <strong>{phaseLabel[stage.phase]}</strong>
          <p>{stage.copy}</p>
          {counts[stage.phase] ? (
            <span className="sx-timeline-count">
              {counts[stage.phase]} {counts[stage.phase] === 1 ? 'project' : 'projects'}
            </span>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}

export function ProjectExplorer({ projects }: { projects: ProjectCard[] }) {
  const [phase, setPhase] = useState<PublicPhase | ''>('');
  const present = useMemo(
    () =>
      ([...PROJECT_PHASES, 'TBC'] as PublicPhase[]).filter((item) =>
        projects.some((project) => project.phase === item),
      ),
    [projects],
  );
  const visible = phase ? projects.filter((project) => project.phase === phase) : projects;

  if (projects.length === 0) {
    return (
      <ShowcaseEmpty
        variant="projects"
        eyebrow="In development"
        title="No public builds to show right now."
        copy="Client builds stay private until the client agrees to share them. Our own products are listed on the roadmap below — join a waiting list or ask for a demo."
        actions={
          <>
            <Link className="sx-btn primary" href="#roadmap">
              See the roadmap <ArrowUpRight size={16} />
            </Link>
            <Link className="sx-btn ghost" href="/pricing#quote">
              Start your project
            </Link>
          </>
        }
      />
    );
  }

  return (
    <>
      {present.length > 1 ? (
        <div className="sx-segment" role="tablist" aria-label="Filter by status">
          <button type="button" role="tab" aria-selected={phase === ''} onClick={() => setPhase('')}>
            All <span>{projects.length}</span>
          </button>
          {present.map((item) => (
            <button type="button" role="tab" key={item} aria-selected={phase === item} onClick={() => setPhase(item)}>
              {publicPhaseLabel(item)} <span>{projects.filter((project) => project.phase === item).length}</span>
            </button>
          ))}
        </div>
      ) : null}
      <motion.div layout className="sx-project-grid">
        <AnimatePresence mode="popLayout">
          {visible.map((project, index) => (
            <motion.article
              layout
              key={project.key}
              className="sx-project-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05 }}
            >
              <Link href={`/projects/${project.key}`} className="sx-study-link">
                <div className="sx-project-media">
                  {project.coverUrl ? (
                    <Image src={project.coverUrl} alt="" fill sizes="(max-width: 980px) 100vw, 33vw" className="sx-cover-img" />
                  ) : (
                    <div className="sx-cover-fallback" aria-hidden="true">
                      <span>{project.title.slice(0, 1)}</span>
                    </div>
                  )}
                  <span className={`sx-status phase-${project.phase.toLowerCase()}`}>{publicPhaseLabel(project.phase)}</span>
                </div>
                <div className="sx-study-body">
                  <div className="sx-project-top">
                    <div>
                      {project.category ? <span className="sx-meta-label">{project.category}</span> : null}
                      <h3>{project.title}</h3>
                    </div>
                    <ProgressRing value={project.progress} size={58} />
                  </div>
                  <p>{project.summary}</p>
                  {project.technologies.length ? (
                    <div className="sx-tags small">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="sx-project-foot">
                    {project.teamSize ? (
                      <span>
                        <Users size={13} /> Team of {project.teamSize}
                      </span>
                    ) : null}
                    {formatEta(project.eta) ? (
                      <span>
                        <CalendarDays size={13} /> ETA {formatEta(project.eta)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export function RoadmapGrid({ items }: { items: RoadmapItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="sx-roadmap">
      {items.map((item, index) => (
        <motion.article
          key={item.name}
          className="sx-roadmap-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
        >
          <div className="sx-roadmap-media">
            <Image src={item.image} alt="" fill sizes="(max-width: 700px) 100vw, 25vw" className="sx-cover-img" />
            <span className={`sx-status ${item.status === 'live' ? 'phase-released' : 'phase-planning'}`}>
              {item.status === 'live' ? 'Live now' : 'On the roadmap'}
            </span>
          </div>
          <div className="sx-roadmap-body">
            <h3>{item.name}</h3>
            <p>{item.copy}</p>
            {item.note ? <p className="sx-tbc-note">{item.note}</p> : null}
            {item.href ? (
              <Link className="sx-btn ghost small" href={item.href}>
                Explore <ArrowUpRight size={14} />
              </Link>
            ) : open === item.name ? (
              <WaitlistForm product={item.name} />
            ) : (
              <button type="button" className="sx-btn ghost small" onClick={() => setOpen(item.name)}>
                Join Waiting List
              </button>
            )}
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export function WaitlistForm({ product, kind = 'waitlist' }: { product: string; kind?: 'waitlist' | 'demo' }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  if (status === 'done') {
    return (
      <p className="sx-waitlist-done" role="status">
        <CheckCircle2 size={16} /> {kind === 'demo' ? 'Demo request received.' : 'You are on the list.'} Check your inbox.
      </p>
    );
  }
  return (
    <form
      className="sx-waitlist"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        if (data.get('privacy') !== 'on') {
          setError('Please accept the privacy policy.');
          return;
        }
        data.set('privacy', 'true');
        data.set('kind', kind);
        data.set('service', product);
        data.set('details', `${kind === 'demo' ? 'Demo request' : 'Waiting list'}: ${product}`);
        setStatus('sending');
        setError(null);
        try {
          const response = await fetch('/api/quote', { method: 'POST', body: data });
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) throw new Error(payload.error || 'Could not join the list.');
          setStatus('done');
        } catch (err) {
          setStatus('idle');
          setError(err instanceof Error ? err.message : 'Could not join the list.');
        }
      }}
    >
      <input name="name" placeholder="Name" required minLength={2} autoComplete="name" aria-label="Name" />
      <input name="email" type="email" placeholder="Work email" required autoComplete="email" aria-label="Work email" />
      <input className="sx-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <label className="sx-consent small">
        <input type="checkbox" name="privacy" />
        <span>
          I accept the <Link href="/privacy">privacy policy</Link>.
        </span>
      </label>
      {error ? (
        <p className="sx-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="sx-btn primary small" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : kind === 'demo' ? 'Request Demo' : 'Join Waiting List'}
      </button>
    </form>
  );
}
