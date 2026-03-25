import { getStoreProducts } from '../../../lib/storefront';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const products = await getStoreProducts(24);
    return Response.json({ products });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to load products.' }, { status: 500 });
  }
}
