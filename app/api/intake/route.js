import { BRAND } from '../../../config/brand';
import { requireAdminUser } from '../../../lib/adminAuth';
import { getServerSupabase } from '../../../lib/supabase';

export const runtime = 'nodejs';

function badRequest(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function slugify(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseCurrency(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Number(amount.toFixed(2));
}

function parseWholeNumber(value, fallback = 0) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;
  return Math.max(0, Math.round(amount));
}

async function buildUniqueSlug(supabase, productName, modelNumber) {
  const baseSlug = slugify(`${productName}-${modelNumber || ''}`) || `tool-${Date.now()}`;
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .ilike('slug', `${baseSlug}%`);

  if (error) throw error;

  const existing = (data || []).map((row) => row.slug).filter(Boolean);
  if (!existing.includes(baseSlug)) return baseSlug;

  let index = 2;
  while (existing.includes(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

async function uploadImages(supabase, bucketName, slug, files) {
  const imageUrls = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];

    if (!file || typeof file.arrayBuffer !== 'function' || Number(file.size || 0) === 0) continue;

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const path = `brands/${slugify(BRAND.name)}/${slug}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path);
    imageUrls.push(publicUrlData.publicUrl);
  }

  return imageUrls;
}

export async function POST(request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceRoleKey) {
    return badRequest('Missing Supabase environment variables.');
  }

  const authResult = await requireAdminUser(request);
  if (authResult.error) return authResult.error;

  const supabase = getServerSupabase();
  const formData = await request.formData();

  const productName = formData.get('product_name')?.toString().trim();
  const brandName = formData.get('brand_name')?.toString().trim();
  const modelNumber = formData.get('model_number')?.toString().trim();
  const categoryName = formData.get('category_name')?.toString().trim();
  const batteryPlatform = formData.get('battery_platform')?.toString().trim();
  const condition = formData.get('condition')?.toString().trim();
  const location = formData.get('location')?.toString().trim();
  const notes = formData.get('notes')?.toString().trim();

  const quantityOnHand = parseWholeNumber(formData.get('quantity_on_hand') || 1, 1);
  const purchaseCost = parseCurrency(formData.get('purchase_cost'));
  const targetSalePrice = parseCurrency(formData.get('target_sale_price'));

  const includesBattery = formData.get('includes_battery') === 'true';
  const includesCharger = formData.get('includes_charger') === 'true';
  const includesCase = formData.get('includes_case') === 'true';

  if (!productName) return badRequest('Product name is required.');
  if (!brandName) return badRequest('Brand is required.');
  if (!categoryName) return badRequest('Category is required.');
  if (quantityOnHand < 1) return badRequest('Quantity must be at least 1.');

  try {
    const slug = await buildUniqueSlug(supabase, productName, modelNumber);
    const files = formData.getAll('images').filter(Boolean);
    const imageUrls = await uploadImages(supabase, bucketName, slug, files);

    const metadata = {
      intake_source: 'admin_portal',
      condition: condition || null,
      location: location || null,
      battery_platform: batteryPlatform || null,
      purchase_cost: purchaseCost,
      notes: notes || null,
      includes_battery: includesBattery,
      includes_charger: includesCharger,
      includes_case: includesCase,
    };

    const insertPayload = {
      name: productName,
      slug,
      brand: brandName,
      category: categoryName,
      model: modelNumber || '',
      description: notes || null,
      price: targetSalePrice,
      stock: quantityOnHand,
      active: true,
      image_url: imageUrls[0] || null,
      images: imageUrls,
      voltage:
        batteryPlatform && batteryPlatform !== 'N/A' && batteryPlatform !== 'Corded'
          ? batteryPlatform
          : null,
      metadata,
      updated_at: new Date().toISOString(),
    };

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(insertPayload)
      .select('id, slug')
      .single();

    if (productError) throw productError;

    return Response.json({
      ok: true,
      sku: product.slug,
      image_urls: imageUrls,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to save product.' }, { status: 500 });
  }
}
