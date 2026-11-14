/**
 * Published business facts from https://nevie-global.com/ (inspected 28 Sep 2026).
 * Unpublished channels stay null. Do not invent phone, UK company number, or social URLs.
 */
export const OFFICIAL_SITE = 'https://nevie-global.com';

export const officialPages = {
  home: `${OFFICIAL_SITE}/`,
  contact: `${OFFICIAL_SITE}/contact/`,
  about: `${OFFICIAL_SITE}/founder-about/`,
  vision: `${OFFICIAL_SITE}/vision/`,
  avatars: `${OFFICIAL_SITE}/avatars/`,
  technology: `${OFFICIAL_SITE}/technologie/`,
  legalNotice: `${OFFICIAL_SITE}/mentions-legales/`,
  privacy: `${OFFICIAL_SITE}/politique-de-confidentialite/`,
} as const;

export const brand = {
  name: 'NEVIE-GLOBAL',
  trademark: 'NEVIE-GLOBAL™',
  ukTradingName: 'NEVIE-GLOBAL UK',
  taglineFr: "Ce que vous désirez, Nevie-global l'accomplit",
  taglineEnPublished:
    'NEVIE-GLOBAL™ is a complete ecosystem. Each element is designed to work together and deliver a secure, smart, and sovereign future.',
} as const;

export const publishedContact = {
  email: 'contact@nevie-global.com',
  /** No tel: link or number is published. +33 6 12 34 56 78 on the homepage is a form placeholder, not a listed line. */
  phone: null as string | null,
  whatsapp: null as string | null,
  mapsUrl: null as string | null,
  /** Homepage shows Paris coordinates as a graphic, not a postal address. */
  officeAddress: null as string | null,
  openingHours: null as string | null,
} as const;

export const publishedSocials = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/nevie.global',
  },
  { id: 'x', label: 'X', href: 'https://x.com/GlobalNevi52586' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/nevie-global-09361638b/',
  },
] as const;

export const unpublishedChannels = [
  'Facebook',
  'TikTok',
  'YouTube',
  'Pinterest',
  'Telegram',
  'Discord',
  'WhatsApp',
  'WhatsApp Business',
  'GitHub',
] as const;

export const groupLegal = {
  editor: 'NEVIE-GLOBAL™',
  legalForm: 'SAS FR',
  hostName: 'Hostinger International Ltd.',
  hostAddress: 'block 34, 102 route de Limassol, 3035 Limassol, Cyprus',
  hostUrl: 'https://www.hostinger.fr',
  siren: null as string | null,
  ukCompanyNumber: null as string | null,
  ukVat: null as string | null,
  ukRegisteredOffice: null as string | null,
} as const;

export const officialLocale = {
  htmlLang: 'fr',
  ogLocale: 'fr_FR',
  currency: 'EUR',
} as const;

/** This UK commercial platform — not published as GBP on nevie-global.com. */
export const ukPlatform = {
  language: 'en-GB',
  country: 'GB',
  currency: 'GBP',
} as const;

export const officialNav = [
  { label: 'Accueil', href: `${OFFICIAL_SITE}/home/` },
  { label: 'About', href: officialPages.about },
  { label: 'Vision', href: officialPages.vision },
  { label: 'Avatars', href: officialPages.avatars },
  { label: 'Technologie', href: officialPages.technology },
  { label: 'Produits', href: `${OFFICIAL_SITE}/#offres` },
  { label: 'Contact', href: officialPages.contact },
] as const;

export const officialFooterLegal = [
  { label: 'Mentions Légales', href: officialPages.legalNotice },
  { label: 'Confidentialité (RGPD)', href: officialPages.privacy },
] as const;

export const officialMissingLegalPages = [
  'Conditions générales de vente (CGV)',
  'Cookie policy page (/politique-des-cookies — 404)',
  'Shipping',
  'Returns',
  'Refunds',
  'Warranty',
] as const;

export const founderStoryPublished = {
  names: 'Emmanuel & Elisa',
  excerpt:
    'Emmanuel, a self-taught visionary from the industrial field, has been designing the architecture of a technology that protects and liberates for over ten years. A few years later, Elisa joined him, bringing the soul, sensitivity, and aesthetics essential to the project.',
  alliance:
    'From their alliance comes NEVIE-GLOBAL™: the Founder’s Box (Card, Badge and Certificate), the CONNECT™ Rings & Bracelets, the SHIELD™ and the NEVIE™ Robots — a sovereign ecosystem designed to raise, protect and liberate families.',
} as const;

export const comingSoonPublished = [
  {
    name: 'NEVIE Smart Glasses™',
    ref: 'NV-GLASSES // OPTX.01',
    status: 'Future Integration // Coming Soon',
  },
  { name: 'SERIES-H Humanoid robots', status: 'R&D concept' },
  { name: 'SERIES-D Domestic robots', status: 'R&D concept' },
  { name: 'SERIES-P Industrial robots', status: 'R&D concept' },
] as const;

export const contactInterests = [
  'Carte Fondateur',
  'Coffret Fondateur',
  'Bague Aura',
  'Bague Signet',
  'Bague Origin',
  'Bracelet Link',
  'Bracelet Core',
  'Bracelet Weave',
  'NEVIE Smart Glasses™ (coming soon)',
  'SERIES-H / SERIES-D / SERIES-P (R&D)',
  'Services / other',
] as const;

export function contactEmail() {
  return process.env.LEGAL_CONTACT_EMAIL || publishedContact.email;
}

export function sameAs() {
  return publishedSocials.map((item) => item.href);
}
