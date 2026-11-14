import { TBC } from './editorial';

export type ProductSpec = { label: string; value: string };

const jewellery = (type: 'Ring' | 'Bracelet'): ProductSpec[] => [
  { label: 'Type', value: `Connected ${type.toLowerCase()}` },
  { label: 'Sale type', value: 'Pre-order' },
  { label: 'Dispatch window', value: TBC },
  { label: 'Materials', value: TBC },
  { label: type === 'Ring' ? 'Ring sizes' : 'Bracelet sizes', value: TBC },
  { label: 'Connected features', value: TBC },
  { label: 'Packaging', value: 'Presentation case included' },
];

const specs: Record<string, ProductSpec[]> = {
  'founder-card': [
    { label: 'Format', value: 'Digital access product' },
    { label: 'Delivery', value: 'Digital — no shipping' },
    { label: 'Founder benefits (detail)', value: TBC },
  ],
  'founder-box': [
    { label: 'Format', value: 'Physical and digital set' },
    { label: 'Itemised contents', value: TBC },
    { label: 'Dispatch window', value: TBC },
  ],
  'bague-aura': jewellery('Ring'),
  'bague-signet': jewellery('Ring'),
  'bague-origin': jewellery('Ring'),
  'bracelet-link': jewellery('Bracelet'),
  'bracelet-core': jewellery('Bracelet'),
  'bracelet-weave': jewellery('Bracelet'),
};

export function productSpecs(id: string): ProductSpec[] {
  return specs[id] || [];
}

export function isPreOrder(tag: string | null | undefined) {
  return (tag || '').toUpperCase().includes('PRE-ORDER');
}
