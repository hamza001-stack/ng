import { officialPages } from '@/lib/company';

export function OfficialSourceNote({
  pages = ['legalNotice', 'privacy'] as const,
}: {
  pages?: ReadonlyArray<keyof typeof officialPages>;
}) {
  return (
    <p className="notice">
      Group website source (French publication):{' '}
      {pages.map((key, index) => (
        <span key={key}>
          {index ? ' · ' : null}
          <a href={officialPages[key]} target="_blank" rel="noopener noreferrer">
            {officialPages[key].replace('https://nevie-global.com', '')}
          </a>
        </span>
      ))}
      . UK company number, VAT and registered office for this platform are To Be
      Confirmed. This page describes the UK commercial platform and does not
      copy unpublished French contract terms.
    </p>
  );
}

export function GroupLegalFacts() {
  return (
    <>
      <h2>Group website (nevie-global.com)</h2>
      <p>
        The public site at{' '}
        <a href={officialPages.home} target="_blank" rel="noopener noreferrer">
          nevie-global.com
        </a>{' '}
        states that it is edited by NEVIE-GLOBAL™, structured as SAS FR. No
        SIREN, share capital or French registered office for NEVIE is published
        on that page.
      </p>
      <p>
        Hosting published there: Hostinger International Ltd., block 34, 102
        route de Limassol, 3035 Limassol, Cyprus (
        <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer">
          hostinger.fr
        </a>
        ).
      </p>
      <p>
        Conditions générales de vente, shipping, returns, warranty and a cookie
        policy URL are not published on that site (CGV and /politique-des-cookies
        return 404 as of 28 September 2026).
      </p>
      <p>
        Source:{' '}
        <a href={officialPages.legalNotice} target="_blank" rel="noopener noreferrer">
          Mentions légales
        </a>
        .
      </p>
    </>
  );
}
