'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Clock, Globe2, Search, Timer, X } from 'lucide-react';
import { ShowcaseEmpty } from './empty';

export type StudyCard = {
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  client: string | null;
  industry: string | null;
  country: string | null;
  services: string[];
  technologies: string[];
  results: string[];
  duration: string | null;
  year: number | null;
  minutes: number;
};

type FilterKey = 'industry' | 'technology' | 'country' | 'service' | 'year';

const filterLabels: Record<FilterKey, string> = {
  industry: 'Industry',
  technology: 'Technology',
  country: 'Country',
  service: 'Service',
  year: 'Year',
};

function valuesFor(study: StudyCard, key: FilterKey): string[] {
  if (key === 'industry') return study.industry ? [study.industry] : [];
  if (key === 'country') return study.country ? [study.country] : [];
  if (key === 'year') return study.year ? [String(study.year)] : [];
  if (key === 'technology') return study.technologies;
  return study.services;
}

function Monogram({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="sx-monogram" aria-hidden="true">
      {letters}
    </span>
  );
}

function Cover({ src, title, priority = false }: { src: string | null; title: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="sx-cover-fallback" aria-hidden="true">
        <span>{title.slice(0, 1)}</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(max-width: 980px) 100vw, 50vw"
      priority={priority}
      className="sx-cover-img"
    />
  );
}

export function CaseStudyExplorer({ studies }: { studies: StudyCard[] }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});

  const options = useMemo(() => {
    const out = {} as Record<FilterKey, string[]>;
    for (const key of Object.keys(filterLabels) as FilterKey[]) {
      out[key] = Array.from(new Set(studies.flatMap((study) => valuesFor(study, key)))).sort();
    }
    return out;
  }, [studies]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return studies.filter((study) => {
      if (q) {
        const hay = [study.title, study.summary, study.client, study.industry, ...study.technologies, ...study.services]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return (Object.entries(filters) as [FilterKey, string][]).every(
        ([key, value]) => !value || valuesFor(study, key).includes(value),
      );
    });
  }, [studies, query, filters]);

  if (studies.length === 0) {
    return (
      <ShowcaseEmpty
        eyebrow="Case studies"
        title="Our first published stories are being written."
        copy="We only publish work clients have approved, with results we can verify. Until then, tell us about your project and we will share relevant examples on a call."
        actions={
          <>
            <Link className="sx-btn primary" href="/pricing#quote">
              Request a Quote <ArrowUpRight size={16} />
            </Link>
            <Link className="sx-btn ghost" href="/services">
              View Services
            </Link>
          </>
        }
      />
    );
  }

  const activeFilters = Object.entries(filters).filter(([, value]) => value) as [FilterKey, string][];
  const showFeatured = !query && activeFilters.length === 0;
  const [featured, ...rest] = visible;
  const grid = showFeatured ? rest : visible;

  return (
    <>
      <div className="sx-toolbar" role="search">
        <label className="sx-search">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by company, industry or technology"
            aria-label="Search case studies"
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          ) : null}
        </label>
        <div className="sx-filters">
          {(Object.keys(filterLabels) as FilterKey[])
            .filter((key) => options[key].length > 0)
            .map((key) => (
              <label className="sx-select" key={key}>
                <span className="sr-only">{filterLabels[key]}</span>
                <select
                  value={filters[key] || ''}
                  onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                >
                  <option value="">{filterLabels[key]}: All</option>
                  {options[key].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
        </div>
      </div>
      {activeFilters.length ? (
        <div className="sx-chips">
          {activeFilters.map(([key, value]) => (
            <button
              type="button"
              key={key}
              className="sx-chip"
              onClick={() => setFilters((current) => ({ ...current, [key]: '' }))}
            >
              {filterLabels[key]}: {value} <X size={12} />
            </button>
          ))}
          <button type="button" className="sx-chip clear" onClick={() => setFilters({})}>
            Clear all
          </button>
        </div>
      ) : null}
      <p className="sx-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'study' : 'studies'}
      </p>

      {visible.length === 0 ? (
        <ShowcaseEmpty
          variant="search"
          eyebrow="No match"
          title="No studies match those filters."
          copy="Try a broader search, or ask us directly — not every project can be published."
          actions={
            <button
              type="button"
              className="sx-btn ghost"
              onClick={() => {
                setQuery('');
                setFilters({});
              }}
            >
              Reset filters
            </button>
          }
        />
      ) : null}

      {showFeatured && featured ? (
        <motion.article
          className="sx-featured"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="sx-featured-media">
            <Cover src={featured.coverUrl} title={featured.title} priority />
            <span className="sx-featured-tag">Featured study</span>
          </div>
          <div className="sx-featured-copy">
            {featured.client ? (
              <div className="sx-company">
                <Monogram name={featured.client} />
                <div>
                  <strong>{featured.client}</strong>
                  {featured.industry ? <span>{featured.industry}</span> : null}
                </div>
              </div>
            ) : null}
            <h2>{featured.title}</h2>
            <p>{featured.summary}</p>
            <dl className="sx-facts">
              {featured.country ? (
                <div>
                  <dt>
                    <Globe2 size={14} /> Country
                  </dt>
                  <dd>{featured.country}</dd>
                </div>
              ) : null}
              {featured.duration ? (
                <div>
                  <dt>
                    <Timer size={14} /> Duration
                  </dt>
                  <dd>{featured.duration}</dd>
                </div>
              ) : null}
              <div>
                <dt>
                  <Clock size={14} /> Read
                </dt>
                <dd>{featured.minutes} min</dd>
              </div>
            </dl>
            {featured.technologies.length ? (
              <div className="sx-tags">
                {featured.technologies.slice(0, 6).map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            ) : null}
            <Link className="sx-btn primary" href={`/case-studies/${featured.slug}`}>
              Read Case Study <ArrowUpRight size={16} />
            </Link>
          </div>
        </motion.article>
      ) : null}

      {grid.length ? (
        <motion.div layout className="sx-study-grid">
          <AnimatePresence mode="popLayout">
            {grid.map((study, index) => (
              <motion.article
                layout
                key={study.slug}
                className="sx-study-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05 }}
              >
                <Link href={`/case-studies/${study.slug}`} className="sx-study-link">
                  <div className="sx-study-media">
                    <Cover src={study.coverUrl} title={study.title} />
                  </div>
                  <div className="sx-study-body">
                    <div className="sx-meta">
                      <span>{study.client || 'Client work'}</span>
                      <span>
                        <Clock size={12} /> {study.minutes} min read
                      </span>
                    </div>
                    <h3>{study.title}</h3>
                    {study.industry || study.services.length ? (
                      <p className="sx-study-sub">
                        {[study.industry, study.services.slice(0, 2).join(' · ')].filter(Boolean).join(' — ')}
                      </p>
                    ) : null}
                    <p>{study.summary}</p>
                    {study.results.length ? (
                      <ul className="sx-results">
                        {study.results.slice(0, 2).map((result) => (
                          <li key={result}>{result}</li>
                        ))}
                      </ul>
                    ) : null}
                    {study.technologies.length ? (
                      <div className="sx-tags small">
                        {study.technologies.slice(0, 4).map((tech) => (
                          <span key={tech}>{tech}</span>
                        ))}
                      </div>
                    ) : null}
                    <span className="sx-card-cta">
                      Read case study <ArrowUpRight size={15} />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </>
  );
}
