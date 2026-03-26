import { getServerSupabase } from '../../../../lib/supabase';
import { requireAdminUser } from '../../../../lib/adminAuth';
import { normalizeProduct } from '../../../../lib/storefront';

export const runtime = 'nodejs';

export async function GET(request) {
  const authResult = await requireAdminUser(request);
  if (authResult.error) return authResult.error;

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase.from('products').select('*').limit(200);
    if (error) throw error;

    const products = (data || []).map((row) => ({
      ...normalizeProduct(row),
      active: row.active !== false,
      rawPrice: row.price ?? row.target_sale_price ?? 0,
      rawStock: row.stock ?? row.quantity_on_hand ?? row.quantity ?? 0,
    }));

    return Response.json({ products });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Unable to load admin products.' },
      { status: 500 },
    );
  }
}
