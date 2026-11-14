import { searchProducts } from '@/server/catalog';
import { jsonError, jsonOk } from '@/server/logger';
import { clientKey, rateLimit } from '@/server/rate-limit';

export async function GET(request: Request) {
  const limited = await rateLimit(clientKey(request, 'search'), 40, 60_000);
  if (!limited.ok) return jsonError('Too many requests.', 429);
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().slice(0, 80);
  const category = searchParams.get('category') || undefined;
  const rows = await searchProducts(q, category);
  return jsonOk({
    products: rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category.name,
      price: row.pricePence / 100,
      description: row.description,
    })),
  });
}
