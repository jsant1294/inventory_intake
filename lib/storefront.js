import { getServerSupabase } from './supabase';

export async function getStoreProducts(limit = 24) {
  const sb = getServerSupabase({ allowAnonFallback: true });
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('active', true)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function getStoreProductBySku(sku) {
  const sb = getServerSupabase({ allowAnonFallback: true });
  const slugResult = await sb.from('products').select('*').eq('slug', sku).maybeSingle();
  if (!slugResult.error && slugResult.data) return normalizeProduct(slugResult.data);
  if (slugResult.error && !isMissingColumnError(slugResult.error)) throw slugResult.error;

  const skuResult = await sb.from('products').select('*').eq('internal_sku', sku).maybeSingle();
  if (skuResult.error && !isMissingColumnError(skuResult.error)) throw skuResult.error;

  return skuResult.data ? normalizeProduct(skuResult.data) : null;
}

export function normalizeProduct(row) {
  const images = normalizeImages(row);
  const price = normalizePrice(row.price ?? row.target_sale_price ?? row.compare_price ?? 0);
  const quantity = normalizeQuantity(row);
  return {
    id: row.id,
    sku: row.internal_sku || row.slug || row.id,
    name: row.product_name || row.name || 'Tool',
    model: row.model_number || row.model || '',
    brand: row.brand || row.brands?.name || 'Tool',
    condition: null,
    description: row.description,
    includes_battery: Boolean(row.includes_battery),
    includes_charger: Boolean(row.includes_charger),
    includes_case: Boolean(row.includes_case),
    price,
    status: quantity > 0 ? 'In Stock' : 'Out of Stock',
    listing_status: row.active === false ? 'Hidden' : 'Listed',
    location: row.location || '',
    quantity,
    images,
    primaryImage: images[0] || '',
  };
}

function normalizeImages(row) {
  if (Array.isArray(row.images)) {
    return row.images.filter(Boolean);
  }
  if (row.image_url) {
    return [row.image_url];
  }
  return [];
}

function normalizePrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return 0;
  return Number.isInteger(amount) && amount >= 1000 ? amount / 100 : amount;
}

function normalizeQuantity(row) {
  const raw = row.stock ?? row.quantity_on_hand ?? row.quantity ?? 0;
  const quantity = Number(raw || 0);
  return Number.isFinite(quantity) ? quantity : 0;
}

function isMissingColumnError(error) {
  return typeof error?.message === 'string' && error.message.includes('column');
}
