
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { SitePageHtml } from '@/components/site-page-html';
import { AcademyShell } from '@/features/academy/shell';
import {
  Faq,
  HeroArt,
  Icon,
  PlansGrid,
  ScheduleTable,
  SealArt,
  CourseCard,
} from '@/features/academy/ui';
import { academyFaq, money } from '@/lib/academy-defaults';
import { getProgrammes } from '@/server/academy';
import { getPageMetadata } from '@/server/site-content';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return getPageMetadata(
    'academy',
    {
      title: 'Academy — Live online programmes in AI, web development and automation',
      description:
        'Live online programmes in practical AI, full-stack web development and automation. See prices and start dates, then pre-register free.',
    },
    '/academy',
  );
}

const includes = [
  ['video', 'liveTitle', 'liveDescription'],
  ['project', 'projectTitle', 'projectDescription'],
  ['chat', 'feedbackTitle', 'feedbackDescription'],
  ['cal', 'datesTitle', 'datesDescription'],
  ['book', 'introTitle', 'introDescription'],
  ['award', 'certificateTitle', 'certificateDescription'],
] as const;

function weekRange(weeks: string[]) {
  const nums = weeks
    .map((w) => parseInt(w, 10))
    .filter((n) => Number.isFinite(n));

  if (!nums.length) return '—';

  const lo = Math.min(...nums);
  const hi = Math.max(...nums);

  return lo === hi ? String(lo) : `${lo}–${hi}`;
}

export default async function AcademyHome() {
  const t = await getTranslations('Home');
  const a = await getTranslations('Academy');

  const locale = (await getLocale()) === 'fr' ? 'fr' : 'en';
  const programmes = await getProgrammes(locale);

  const min = programmes.length
    ? Math.min(...programmes.map((p) => p.price))
    : 0;

  const currency = programmes[0]?.currency ?? (locale === 'fr' ? 'EUR' : 'GBP');

  const lessons = programmes.reduce((n, p) => n + p.lessons, 0);

  return (
    <AcademyShell>
      {/* HERO */}
      <div className="nv-hero">
        <div className="nv-wrap">
          <div>
            <div className="nv-eyebrow">
              NEVIE Academy · {t('liveClasses')}
            </div>

            <h1>{a('hero')}</h1>

            <p className="nv-lead">{a('sub')}</p>

            <div className="nv-cta-row">
              <Link className="nv-btn nv-primary" href="/academy/courses">
                {a('viewAll')}
              </Link>

              <Link
                className="nv-btn nv-ghost"
                href="/academy/pre-registration"
              >
                {a('preRegister')}
              </Link>
            </div>

            <div className="nv-trust">
              <span>{t('freePayment')}</span>
              <span>
                {t('from')} {money(min, currency)}
              </span>
              <span>{t('beginnerFriendly')}</span>
            </div>
          </div>

          <div>
            <HeroArt programmes={programmes} />
          </div>
        </div>
      </div>

      {/* PROGRAMME STATISTICS */}
      <div className="nv-strip">
        <div className="nv-wrap">
          <div>
            <b>{programmes.length}</b>
            <small>{t('programmeCount')}</small>
          </div>

          <div>
            <b>{lessons}</b>
            <small>{t('liveLessons')}</small>
          </div>

          <div>
            <b>{weekRange(programmes.map((p) => p.weeks))}</b>
            <small>{t('weeksPerProgramme')}</small>
          </div>

          <div>
            <b>{money(min, currency)}+</b>
            <small>{t('oneOffPrice')}</small>
          </div>
        </div>
      </div>

      {/* CMS CONTENT */}
      <div className="nv-wrap" style={{ paddingTop: 40 }}>
        <SitePageHtml pageKey="academy" />
      </div>

      {/* CHOOSE A PROGRAMME */}
      <section>
        <div className="nv-wrap">
          <div className="nv-shead">
            <div className="nv-eyebrow">{t('chooseTitle')}</div>
            <h2>{t('chooseDescription')}</h2>
            <p>{t('cardDescription')}</p>
          </div>

          <div className="nv-gridc">
            {programmes.map((p) => (
              <CourseCard key={p.id} p={p} />
            ))}
          </div>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link className="nv-link" href="/academy/pricing">
              {t('comparePrices')} →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          background: '#050b14',
          borderBlock: '1px solid var(--line)',
        }}
      >
        <div className="nv-wrap">
          <div className="nv-shead">
            <div className="nv-eyebrow nv-gold">{t('howTitle')}</div>
            <h2>{t('howSubtitle')}</h2>
          </div>

          <div className="nv-steps">
            <div className="nv-card nv-step">
              <span className="nv-num">01</span>
              <div className="nv-ic">
                <Icon name="pick" />
              </div>
              <h3>{t('step1Title')}</h3>
              <p>{t('step1Description')}</p>
            </div>

            <div className="nv-card nv-step">
              <span className="nv-num">02</span>
              <div className="nv-ic">
                <Icon name="form" />
              </div>
              <h3>{t('step2Title')}</h3>
              <p>{t('step2Description')}</p>
            </div>

            <div className="nv-card nv-step">
              <span className="nv-num">03</span>
              <div className="nv-ic">
                <Icon name="go" />
              </div>
              <h3>{t('step3Title')}</h3>
              <p>{t('step3Description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section>
        <div className="nv-wrap">
          <div className="nv-shead">
            <div className="nv-eyebrow">{t('benefitsTitle')}</div>
            <h2>{t('benefitsSubtitle')}</h2>
          </div>

          <div className="nv-incl">
            {includes.map(([icon, titleKey, descriptionKey]) => (
              <div className="nv-card nv-inc" key={titleKey}>
                <div className="nv-ic">
                  <Icon name={icon} />
                </div>

                <div>
                  <h4>{t(titleKey)}</h4>
                  <p>{t(descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        style={{
          background: '#050b14',
          borderBlock: '1px solid var(--line)',
        }}
      >
        <div className="nv-wrap">
          <div className="nv-shead">
            <div className="nv-eyebrow">{t('pricesTitle')}</div>
            <h2>{t('pricesSubtitle')}</h2>
            <p>{t('pricesDescription')}</p>
          </div>

          <PlansGrid programmes={programmes} />
        </div>
      </section>

      {/* START DATES */}
      <section>
        <div className="nv-wrap">
          <div className="nv-shead">
            <div className="nv-eyebrow">{t('scheduleTitle')}</div>
            <h2>{t('scheduleSubtitle')}</h2>
          </div>

          <ScheduleTable programmes={programmes} />
        </div>
      </section>

      {/* CERTIFICATE */}
      <section style={{ paddingTop: 0 }}>
        <div className="nv-wrap">
          <div className="nv-cert">
            <SealArt />

            <div>
              <div className="nv-eyebrow nv-gold">
                {t('progressTitle')}
              </div>

              <h2>{t('progressSubtitle')}</h2>
              <p>{t('progressDescription')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 0 }}>
        <div className="nv-wrap" style={{ maxWidth: 840 }}>
          <div className="nv-shead">
            <div className="nv-eyebrow">{t('faqTitle')}</div>
            <h2>{t('faqSubtitle')}</h2>
          </div>

          <Faq items={academyFaq} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="nv-final">
        <div className="nv-wrap">
          <div className="nv-eyebrow nv-gold">
            {t('readyTitle')}
          </div>

          <h2>{t('readySubtitle')}</h2>

          <p>{t('readyDescription')}</p>

          <Link
            className="nv-btn nv-gold"
            href="/academy/pre-registration"
          >
            {t('cta')}
          </Link>
        </div>
      </section>
    </AcademyShell>
  );
}
