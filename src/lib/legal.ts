import { brand, contactEmail } from '@/lib/company';

export type LegalEntity = {
  name: string;
  number?: string;
  vat?: string;
  office?: string;
  ico?: string;
  email: string;
};

export function legalEntity(): LegalEntity {
  return {
    name: process.env.LEGAL_COMPANY_NAME || brand.ukTradingName,
    number: process.env.LEGAL_COMPANY_NUMBER,
    vat: process.env.LEGAL_VAT_NUMBER,
    office: process.env.LEGAL_REGISTERED_OFFICE,
    ico: process.env.LEGAL_ICO_NUMBER,
    email: contactEmail(),
  };
}

export function companyLines(entity: LegalEntity) {
  return [
    entity.name,
    entity.number ? `Company number ${entity.number}` : null,
    entity.vat ? `VAT number ${entity.vat}` : null,
    entity.office ? `Registered office: ${entity.office}` : null,
    entity.ico ? `ICO registration ${entity.ico}` : null,
    `Contact: ${entity.email}`,
  ].filter((line): line is string => Boolean(line));
}
