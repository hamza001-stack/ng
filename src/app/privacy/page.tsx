import { EntityBlock, LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Privacy Policy',
  `How ${entity.name} collects, uses and retains personal data.`,
  '/privacy',
);

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" kicker="LEGAL / UNITED KINGDOM">
      <OfficialSourceNote pages={['privacy']} />
      <p>Effective date: 26 September 2026. Controller for this UK platform: {entity.name}.</p>
      <h2>1. Who we are</h2>
      <EntityBlock entity={entity} />
      <h2>2. Data we collect</h2>
      <p>
        Account data (name, email, hashed password), order and payment references from Stripe,
        cart contents, enquiry and newsletter data, cookie preference, security logs (IP, user
        agent) and learning progress if you use Academy.
      </p>
      <h2>3. Why we process it</h2>
      <p>
        We process data to perform a contract (accounts, checkout, fulfilment), to comply with
        UK law (tax, accounting, fraud), and with consent for optional newsletters and
        non-essential cookies.
      </p>
      <h2>4. Processors</h2>
      <p>
        On this UK platform: hosting, PostgreSQL, Redis if configured, Stripe for payments,
        an SMTP provider for transactional email (provider To Be Confirmed), and Cloudflare Turnstile when
        enabled.
      </p>
      <p>
        The group website at nevie-global.com states that contact and purchase data (name, email,
        infrastructure choice) feed databases on Railway via n8n webhooks, and that incoming traffic is
        filtered by the Cloudflare WAF. Rights requests on that site go through the official contact
        channel ({entity.email}).
      </p>
      <h2>5. Retention</h2>
      <p>
        Account data lasts for the life of the account plus 24 months. Orders and invoices are
        kept for at least six years for UK tax records. Enquiries are kept for 24 months unless a
        longer sales relationship exists. Security logs are kept for 12 months.
      </p>
      <h2>6. Your rights</h2>
      <p>
        You may request access, correction, erasure, restriction, portability and objection
        under UK GDPR. Write to {entity.email}. You may complain to the ICO.
      </p>
      <h2>7. International transfers</h2>
      <p>
        If a processor stores data outside the UK, we use UK IDTA or EU SCCs plus a UK addendum
        as applicable.
      </p>
    </LegalLayout>
  );
}
