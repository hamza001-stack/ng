import 'server-only';
import Stripe from 'stripe';
import { stripeSettings } from './settings';

let client: { key: string; stripe: Stripe } | undefined;

export async function activeStripeKeys() {
  const settings = await stripeSettings();
  return { mode: settings.mode, ...settings[settings.mode] };
}

export async function stripeEnabled() {
  return Boolean((await activeStripeKeys()).secretKey);
}

export async function getStripe() {
  const { secretKey } = await activeStripeKeys();
  if (!secretKey) throw new Error('Stripe is not configured');
  if (client?.key !== secretKey) {
    client = { key: secretKey, stripe: new Stripe(secretKey) };
  }
  return client.stripe;
}

export async function stripeWebhookSecret() {
  return (await activeStripeKeys()).webhookSecret;
}

export function vatRateBps() {
  const raw = Number(process.env.VAT_RATE_BPS ?? 2000);
  return Number.isFinite(raw) ? raw : 2000;
}

export function shippingPence() {
  const raw = Number(process.env.SHIPPING_PENCE ?? 0);
  return Number.isFinite(raw) ? raw : 0;
}

export function applyVat(netPence: number) {
  return Math.round((netPence * vatRateBps()) / 10000);
}
