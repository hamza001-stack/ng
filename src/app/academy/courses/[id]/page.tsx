
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { AcademyShell } from '@/features/academy/shell';
import {
  PageHero,
  ProgrammeArt,
  SeatPill,
  registerHref,
  themeBg,
} from '@/features/academy/ui';
import { fmtDate, money, seatsLeft } from '@/lib/academy-defaults';
import { JsonLd, metadata, siteUrl } from '@/lib/seo';
import { getProgramme } from '@/server/academy';

export const dynamic = 'force-dynamic';

const labels = {
  en: {
    notFound: 'Programme not found',
    lessons: 'lessons',
    learn: 'What you will learn',
    syllabus: 'Syllabus',
    startDate: 'Choose a start date',
    starts: 'Starts',
    preRegister: 'Pre-register',
    waiting: 'Join waiting list',
    newDates: 'New dates will be announced soon. Pre-register to be told first.',
    oneOff: 'one-off · per learner',
    freeIntro: 'Free introductory lesson',
    project: 'Build a full project',
    noPayment: 'No payment at pre-registration',
    preRegisterFree: 'Pre-register free',
    tryIntro: 'Try the free intro lesson',
    live: 'live online',
  },
  fr: {
    notFound: 'Programme introuvable',
    lessons: 'leçons',
    learn: 'Ce que vous allez apprendre',
    syllabus: 'Programme',
    startDate: 'Choisissez une date de début',
    starts: 'Début',
    preRegister: 'Préinscription',
    waiting: "Rejoindre la liste d'attente",
    newDates: 'De nouvelles dates seront annoncées bientôt. Préinscrivez-vous pour être informé.',
    oneOff: 'paiement unique · par apprenant',
    freeIntro: "Leçon d'introduction gratuite",
    project: 'Réaliser un projet complet',
    noPayment: 'Aucun paiement lors de la préinscription',
    preRegisterFree: 'Préinscription gratuite',
    tryIntro: "Essayer la leçon d'introduction gratuite",
    live: 'en ligne',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) === 'fr' ? 'fr' : 'en';
  const p = await getProgramme(id, locale);

  if (!p) return { title: labels[locale].notFound };

  return metadata(
    p.seoTitle?.trim() ||
      `${p.title} — ${locale === 'fr' ? 'Programme en ligne' : 'Live Online Programme'}`,
    p.seoDescription?.trim() || `${p.promise} ${p.blurb}`.slice(0, 300),
    `/academy/courses/${id}`,
  );
}

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) === 'fr' ? 'fr' : 'en';
  const t = labels[locale];
  const p = await getProgramme(id, locale);

  if (!p) notFound();

  const currency = p.currency ?? 'GBP';

  return (
    <AcademyShell>
      <PageHero
        crumb={p.title}
        title={p.title}
        sub={`${p.promise} ${p.blurb}`}
      />

      <section>
        <div className="nv-wrap nv-detail">
          <div>
            <div className={'nv-dart nv-cart ' + themeBg(p.theme)}>
              <ProgrammeArt theme={p.theme} />
            </div>

            <div className="nv-card" style={{ padding: 30 }}>
              <span className="nv-tag">
                {p.level} · {p.lessons} {t.lessons} · {p.hours} · {p.weeks}
              </span>

              <h3 className="nv-hd" style={{ marginTop: 20 }}>
                {t.learn}
              </h3>

              <ul className="nv-olist" style={{ marginBottom: 0 }}>
                {p.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>

            {p.syllabus.length > 0 && (
              <>
                <h3 className="nv-hd">{t.syllabus}</h3>

                {p.syllabus.map((s, i) => (
                  <details className="nv-syl" key={s.title + i}>
                    <summary>
                      <span>
                        <span
                          className="nv-muted"
                          style={{ marginRight: 12 }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {s.title}
                      </span>
                    </summary>
                    <p>{s.body}</p>
                  </details>
                ))}
              </>
            )}

            <h3 className="nv-hd">{t.startDate}</h3>

            {p.sessions.length > 0 ? (
              p.sessions.map((s) => (
                <div className="nv-sess nv-card" key={s.id}>
                  <div>
                    <b>
                      {t.starts} {fmtDate(s.startsOn)}
                    </b>
                    <small>
                      {s.days} · {s.time} · {s.mode}
                    </small>
                  </div>

                  <div>
                    <SeatPill session={s} />
                  </div>

                  <Link
                    className="nv-btn nv-primary nv-sm"
                    href={registerHref(p.id, s.id)}
                  >
                    {seatsLeft(s) ? t.preRegister : t.waiting}
                  </Link>
                </div>
              ))
            ) : (
              <p className="nv-muted">{t.newDates}</p>
            )}
          </div>

          <aside className="nv-sticky">
            <div className="nv-card nv-plan nv-hot">
              <span className="nv-eyebrow nv-gold">{p.cat}</span>

              <div className="nv-amt">
                {money(p.price, currency)}
              </div>

              <small className="nv-muted">{t.oneOff}</small>

              <ul>
                <li>
                  {p.lessons} {t.lessons} · {p.hours}
                </li>
                <li>
                  {p.weeks} · {t.live}
                </li>
                <li>{p.intro ? t.freeIntro : t.project}</li>
                <li>{t.noPayment}</li>
              </ul>

              <Link
                className="nv-btn nv-gold nv-block"
                href={registerHref(p.id)}
              >
                {t.preRegisterFree}
              </Link>

              {p.intro && p.introCourseId && (
                <Link
                  className="nv-link"
                  style={{ marginTop: 16, justifyContent: 'center' }}
                  href={`/academy/${p.introCourseId}`}
                >
                  {t.tryIntro}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: p.title,
          description: `${p.promise} ${p.blurb}`,
          inLanguage: locale === 'fr' ? 'fr-FR' : 'en-GB',
          url: `${siteUrl}/academy/courses/${p.id}`,
          provider: {
            '@type': 'Organization',
            name: 'NEVIE-GLOBAL UK',
            url: siteUrl,
          },
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: currency,
            category: 'Paid',
          },
          hasCourseInstance: p.sessions.map((s) => ({
            '@type': 'CourseInstance',
            courseMode: 'online',
            startDate: s.startsOn,
          })),
        }}
      />
    </AcademyShell>
  );
}
