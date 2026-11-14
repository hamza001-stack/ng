import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ShowcaseHero } from './motion';
import { FaqAccordion } from './pricing';
import { SimilarCta } from './sections';
import { TBC } from '@/lib/editorial';
import { BreadcrumbSchema, JsonLd } from '@/lib/seo';

type Group = { id: string; title: string; items: { q: string; a: string }[] };

export const faqGroups: Group[] = [
  {
    id: 'founder',
    title: 'Founder access',
    items: [
      {
        q: 'What is the Carte Fondateur?',
        a: 'The Carte Fondateur (£1) is a digital access product that gives priority access credentials for the NEVIE-GLOBAL technology ecosystem.',
      },
      {
        q: 'What does priority access include?',
        a: `The detailed list of founder benefits is ${TBC}. Holders will be told first as benefits are confirmed.`,
      },
      {
        q: 'What is in the Coffret Fondateur?',
        a: `The Coffret Fondateur (£189) is a complete physical and digital founder set. The itemised contents and dispatch date are ${TBC}.`,
      },
    ],
  },
  {
    id: 'jewellery',
    title: 'Connected jewellery pre-orders',
    items: [
      {
        q: 'Which pieces are available to pre-order?',
        a: 'Three rings — Bague Aura (£149), Bague Signet (£179) and Bague Origin (£229) — and three bracelets — Bracelet Link (£129), Bracelet Core (£169) and Bracelet Weave (£229). Each comes with a presentation case.',
      },
      {
        q: 'When will pre-orders be dispatched?',
        a: `The dispatch window is ${TBC}. It will be shown on each product page and emailed to customers who have pre-ordered.`,
      },
      {
        q: 'What materials are used?',
        a: `Finishes are described on each product page. Detailed material specifications are ${TBC}.`,
      },
      {
        q: 'Which ring and bracelet sizes are available?',
        a: `The size range and sizing guide are ${TBC}. Please contact us before ordering if you need a specific size.`,
      },
      {
        q: 'What does “connected” mean?',
        a: `Each piece is designed to connect with the NEVIE-GLOBAL ecosystem. The exact connected features, and the app that supports them, are ${TBC}.`,
      },
    ],
  },
  {
    id: 'orders',
    title: 'Orders, delivery and returns',
    items: [
      {
        q: 'How do I pay?',
        a: 'By card through Stripe Checkout, in pounds sterling. UK VAT is added at the configured rate and you receive an email confirmation when payment succeeds.',
      },
      {
        q: 'Where do you deliver?',
        a: 'Physical products ship to the United Kingdom unless a product page states otherwise. Shipping is shown at checkout when a rate applies.',
      },
      {
        q: 'Can I return a physical product?',
        a: 'Yes — unused, in original packaging, within 14 days of delivery. Arrange the return by email before sending anything. See the returns policy for details.',
      },
      {
        q: 'Can I get a refund on a digital product?',
        a: 'Digital products follow the refund policy: once supply has started with your consent, cancellation rights change. See the refunds policy for details.',
      },
    ],
  },
  {
    id: 'academy',
    title: 'NEVIE Academy',
    items: [
      {
        q: 'Which courses are available?',
        a: 'Two introductory courses are live: “Practical AI for business” and “Automation foundations”. Further courses are on the roadmap.',
      },
      {
        q: 'Do courses include a certificate?',
        a: `Verified certificates are ${TBC}. They will require an account and an assessment.`,
      },
      {
        q: 'Is my progress saved?',
        a: `Lesson progress currently lasts for your browsing session. Saved progress across devices is ${TBC}.`,
      },
    ],
  },
  {
    id: 'services',
    title: 'Services and projects',
    items: [
      {
        q: 'What services does NEVIE-GLOBAL UK offer?',
        a: 'AI, AI agents, voice AI, private LLMs, automation, CRM, ERP, SaaS, APIs, custom software, mobile and web apps, cloud, cyber security, consulting and blockchain assessments.',
      },
      {
        q: 'How much do services cost?',
        a: `Published starting prices and typical timelines are ${TBC}. Every engagement starts with discovery and a written proposal.`,
      },
      {
        q: 'Can I see previous client work?',
        a: 'Client work is only published with the client’s permission. The portfolio currently shows the NEVIE-GLOBAL platform itself; client case studies will be added as they are approved.',
      },
    ],
  },
  {
    id: 'platform',
    title: 'About the platform',
    items: [
      {
        q: 'Which languages is the site available in?',
        a: `English (UK) is the published language. Product names keep their original French names. A French-language version is ${TBC}.`,
      },
      {
        q: 'Who operates this website?',
        a: `NEVIE-GLOBAL UK. Registered company details are shown in the legal pages once confirmed; any detail not yet shown is ${TBC}.`,
      },
      {
        q: 'How do I contact the team?',
        a: 'Use the contact page or request a quote. Enquiries are stored securely and you receive an email confirmation.',
      },
    ],
  },
];

export function FaqPage() {
  const all = faqGroups.flatMap((group) => group.items);
  return (
    <>
      <ShowcaseHero
        badge="Help centre"
        title="Frequently asked"
        accent="questions."
        description="Straight answers about founder access, connected jewellery pre-orders, the NEVIE Academy and our services. Anything not yet officially confirmed is marked To Be Confirmed."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
        actions={
          <>
            <Link className="sx-btn primary" href="/contact">
              Ask a question <ArrowUpRight size={16} />
            </Link>
            <Link className="sx-btn ghost" href="/marketplace">
              Visit the marketplace
            </Link>
          </>
        }
        aside={
          <nav className="sx-glass" aria-label="FAQ topics">
            <span className="sx-eyebrow">Topics</span>
            <ul className="sx-check-list">
              {faqGroups.map((group) => (
                <li key={group.id}>
                  <Link href={`#${group.id}`}>{group.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        }
      />
      {faqGroups.map((group) => (
        <section className="container sx-section" id={group.id} key={group.id}>
          <div className="sx-section-head">
            <span className="sx-eyebrow">FAQ</span>
            <h2>{group.title}</h2>
          </div>
          <FaqAccordion items={group.items} />
        </section>
      ))}
      <p className="container sx-section">
        Policies: <Link href="/shipping">Shipping</Link> · <Link href="/returns">Returns</Link> ·{' '}
        <Link href="/refunds">Refunds</Link> · <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>
      </p>
      <SimilarCta title="Still have a question?" copy="Tell us what you need and a person from the team will reply." />
      <BreadcrumbSchema name="FAQ" path="/faq" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: all.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
    </>
  );
}
