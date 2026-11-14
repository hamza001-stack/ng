import { LegalLayout } from '@/features/legal/legal-layout';
import { OfficialSourceNote } from '@/features/legal/official-source';
import { legalEntity } from '@/lib/legal';
import { metadata as makeMetadata } from '@/lib/seo';

const entity = legalEntity();

export const metadata = makeMetadata(
  'Cookie Policy',
  `Cookies and similar storage used by ${entity.name}.`,
  '/cookies',
);

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" kicker="LEGAL / PECR">
      <OfficialSourceNote />
      <p>
        The group website cookie policy URL /politique-des-cookies returns 404. Its banner states
        that essential infrastructure cookies are used for stability and security. This UK platform
        uses a PECR-compliant choice (essential vs optional) instead of “continue equals consent”.
      </p>
      <p>
        This site uses cookies and similar storage. Strictly necessary cookies run without
        consent. Optional cookies wait for your choice on the banner.
      </p>
      <h2>Strictly necessary</h2>
      <ul>
        <li>Session cookie from Better Auth (signed in state, CSRF).</li>
        <li>Signed guest cart cookie so your bag survives a refresh.</li>
        <li>Cookie preference so we do not ask on every visit.</li>
      </ul>
      <h2>Preference</h2>
      <ul>
        <li>Theme (light or dark) in local storage on this device.</li>
      </ul>
      <h2>Analytics and advertising</h2>
      <p>
        We do not set analytics or advertising cookies unless you accept optional cookies and an
        analytics processor is configured. Today, “Accept optional cookies” only records your
        preference. No advertising profile is built.
      </p>
      <h2>PECR</h2>
      <p>
        Under the Privacy and Electronic Communications Regulations we store or access
        information on your device only when it is strictly necessary for a service you requested,
        or when you have consented.
      </p>
      <p>Change your choice any time from the cookie banner after clearing site data, or email {entity.email}.</p>
    </LegalLayout>
  );
}
