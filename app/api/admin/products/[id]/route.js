import { getServerSupabase } from '../../../../../lib/supabase';
import { requireAdminUser } from '../../../../../lib/adminAuth';
import { normalizeProduct } from '../../../../../lib/storefront';

export const runtime = 'nodejs';

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export async function PUT(request, { params }) {
  const authResult = await requireAdminUser(request);
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const supabase = getServerSupabase();
    const payload = {
      name: body.name?.toString().trim() || 'Tool',
      brand: body.brand?.toString().trim() || 'Tool',
      model: body.model?.toString().trim() || '',
      description: body.description?.toString().trim() || '',
      price: normalizeNumber(body.price, 0),
      stock: normalizeNumber(body.stock, 0),
      active: body.active !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return Response.json({ error: 'Product not found.' }, { status: 404 });
    }

    return Response.json({
      product: {
        ...normalizeProduct(data),
        active: data.active !== false,
        rawPrice: data.price ?? 0,
        rawStock: data.stock ?? 0,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Unable to update product.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const authResult = await requireAdminUser(request);
  if (authResult.error) return authResult.error;

  try {
    const supabase = getServerSupabase();
    const { error } = await supabase.from('products').delete().eq('id', params.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Unable to delete product.' },
      { status: 500 },
    );
  }
}
