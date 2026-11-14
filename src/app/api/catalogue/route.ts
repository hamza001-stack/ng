import { getCommerce } from '@/lib/commerce-server';
export const dynamic = 'force-static';
export const revalidate = 60;
export async function GET() { return Response.json(await getCommerce()); }
