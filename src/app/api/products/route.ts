import { cachedPublishedProducts } from '@/server/catalog';
import { jsonError, jsonOk } from '@/server/logger';

export const revalidate = 60;

export async function GET() {
  try {
    const products = await cachedPublishedProducts();
    return jsonOk({ products });
  } catch {
    return jsonError('Catalogue unavailable.', 503);
  }
}
