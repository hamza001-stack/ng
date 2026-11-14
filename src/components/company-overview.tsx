import Link from 'next/link';
import {
  ArrowUpRight,
  Compass,
  ScanEye,
  ShieldCheck,
  Handshake,
  Layers3,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brand, founderStoryPublished, officialPages } from '@/lib/company';
export function CompanyOverview() {
  return (
    <>
      <div className="company-statement">
        <span className="eyebrow">FOUNDERS</span>
        <h2>
          The story behind
          <br />
          {brand.trademark}
        </h2>
        <p>{founderStoryPublished.excerpt}</p>
        <p>{founderStoryPublished.alliance}</p>
        <p>
          Source:{' '}
          <a href={officialPages.about} target="_blank" rel="noopener noreferrer">
            Founder & About on nevie-global.com
          </a>
          . This UK platform is the English commercial site for the same brand.
        </p>
      </div>
      <div className="company-duo">
        <article>
          <Compass size={28} />
          <span className="eyebrow">01 / MISSION</span>
          <h3>Turn complexity into progress.</h3>
          <p>
            Help businesses understand their options, build useful solutions and
            develop the capability to own what comes next.
          </p>
        </article>
        <article>
          <ScanEye size={28} />
          <span className="eyebrow">02 / VISION</span>
          <h3>More possibility. More agency.</h3>
          <p>
            A future where organisations can shape their technology around their
            people, their knowledge and their ambitions.
          </p>
        </article>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE WAY WE WORK</span>
            <h2>Principles that guide the work.</h2>
          </div>
        </div>
        <div className="values-grid">
          {[
            [
              ShieldCheck,
              'Considered by design',
              'Security, privacy and accessibility belong in the first conversation.',
            ],
            [
              Layers3,
              'Clarity over complexity',
              'Make choices that people can understand, operate and maintain.',
            ],
            [
              Handshake,
              'Shared ownership',
              'Keep progress visible, decisions documented and responsibilities clear.',
            ],
          ].map(([Icon, title, description]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <article key={String(title)}>
                <I size={24} />
                <h3>{String(title)}</h3>
                <p>{String(description)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="process-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FROM IDEA TO IMPACT</span>
            <h2>A deliberate delivery process.</h2>
          </div>
          <Link href="/contact" className="text-link">
            Start a conversation <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="process-grid">
          {[
            [
              'Discover',
              'Align on the challenge, users, constraints and measures of success.',
            ],
            [
              'Design',
              'Map the experience and architecture. Agree scope before implementation.',
            ],
            [
              'Build',
              'Deliver in focused increments with visible progress and regular review.',
            ],
            [
              'Evolve',
              'Validate, document and hand over. Plan the next stage with evidence.',
            ],
          ].map(([t, d], i) => (
            <article key={t}>
              <span>0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section split">
        <div>
          <span className="eyebrow">ENTERPRISE BY INTENT</span>
          <h2>
            Built for the way
            <br />
            business really works.
          </h2>
          <p>
            Technology decisions sit alongside data ownership, procurement,
            integration and operational responsibility. We start there.
          </p>
        </div>
        <div className="enterprise-checks">
          {[
            'Discovery before commitments',
            'Documented architecture and integration boundaries',
            'Human oversight for consequential decisions',
            'Clear handover and support responsibilities',
          ].map((t) => (
            <div key={t}>
              <Check size={18} />
              {t}
            </div>
          ))}
        </div>
      </section>
      <div className="engagement-band">
        <div>
          <span className="eyebrow">BETTER, TOGETHER</span>
          <h2>
            A shared ambition
            <br />
            is a good place to start.
          </h2>
          <p>Explore technology, delivery and learning partnerships.</p>
        </div>
        <Button asChild>
          <Link href="/partners">
            Explore partnerships <ArrowUpRight size={18} />
          </Link>
        </Button>
      </div>
    </>
  );
}
