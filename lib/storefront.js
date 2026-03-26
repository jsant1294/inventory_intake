import { getServerSupabase } from './supabase';

export async function getStoreProducts(limit = 24) {
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('products')
    .select(
      `
      id,
      internal_sku,
      product_name,
      model_number,
      description,
      brands:brand_id ( name ),
      inventory_lots (
        target_sale_price,
        stock_status,
        listing_status,
        location,
        quantity_on_hand
      ),
      product_images (
        image_url,
        is_primary,
        sort_order
      )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalizeProduct);
}

export async function getStoreProductBySku(sku) {
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('products')
    .select(
      `
      id,
      internal_sku,
      product_name,
      model_number,
      description,
      includes_battery,
      includes_charger,
      includes_case,
      brands:brand_id ( name ),
      inventory_lots (
        target_sale_price,
        stock_status,
        listing_status,
        location,
        quantity_on_hand,
        purchase_cost
      ),
      product_images (
        image_url,
        is_primary,
        sort_order
      )
    `,
    )
    .eq('internal_sku', sku)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeProduct(data) : null;
}

function normalizeProduct(row) {
  const brand = row.brands?.name || 'Tool';
  const lot = Array.isArray(row.inventory_lots) ? row.inventory_lots[0] : row.inventory_lots || {};
  const images = Array.isArray(row.product_images)
    ? [...row.product_images].sort((a, b) => {
        if ((a.is_primary ? 0 : 1) !== (b.is_primary ? 0 : 1))
          return (a.is_primary ? 0 : 1) - (b.is_primary ? 0 : 1);
        return (a.sort_order || 0) - (b.sort_order || 0);
      })
    : [];
  return {
    id: row.id,
    sku: row.internal_sku,
    name: row.product_name,
    model: row.model_number,
    brand,
    condition: row.condition || null,
    description: row.description,
    includes_battery: row.includes_battery,
    includes_charger: row.includes_charger,
    includes_case: row.includes_case,
    price: lot?.target_sale_price || 0,
    status: lot?.stock_status || 'In Stock',
    listing_status: lot?.listing_status || 'Not Listed',
    location: lot?.location || '',
    quantity: lot?.quantity_on_hand || 0,
    images: images.map((i) => i.image_url),
    primaryImage: images[0]?.image_url || '',
  };
}
