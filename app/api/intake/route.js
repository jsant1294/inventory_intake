import { createClient } from '@supabase/supabase-js';
import { BRAND } from '../../../config/brand';

export const runtime = 'nodejs';

function badRequest(message, status = 400) {
  return Response.json({ error: message }, { status });
}

async function requireAdminUser(request, supabaseUrl, apiKey) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!token) {
    return { error: badRequest('You must be logged in to add inventory.', 401) };
  }

  const authClient = createClient(supabaseUrl, apiKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user) {
    return { error: badRequest('Your session is invalid. Please log in again.', 401) };
  }

  if (data.user.user_metadata?.role !== 'admin') {
    return { error: badRequest('Only admins can add inventory.', 403) };
  }

  return { user: data.user };
}

function slugify(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function ensureBrand(supabase, name) {
  if (!name) return null;

  const { data, error } = await supabase
    .from('brands')
    .upsert({ name, slug: slugify(name) }, { onConflict: 'name' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureCategory(supabase, name) {
  if (!name) return null;

  const { data, error } = await supabase
    .from('tool_categories')
    .upsert({ name }, { onConflict: 'name' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureBatteryPlatform(supabase, name, brandId = null) {
  if (!name || name === 'N/A') return null;

  const { data: existing, error: existingError } = await supabase
    .from('battery_platforms')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from('battery_platforms')
    .insert({ name, brand_id: brandId })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return badRequest('Missing Supabase environment variables.');
  }

  const authResult = await requireAdminUser(request, supabaseUrl, supabaseAnonKey);
  if (authResult.error) return authResult.error;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const formData = await request.formData();

  const productName = formData.get('product_name')?.toString().trim();
  const brandName = formData.get('brand_name')?.toString().trim();
  const modelNumber = formData.get('model_number')?.toString().trim();
  const categoryName = formData.get('category_name')?.toString().trim();
  const batteryPlatform = formData.get('battery_platform')?.toString().trim();
  const condition = formData.get('condition')?.toString().trim();
  const location = formData.get('location')?.toString().trim();
  const notes = formData.get('notes')?.toString().trim();

  const quantityOnHand = Number(formData.get('quantity_on_hand') || 1);
  const purchaseCost = Number(formData.get('purchase_cost') || 0);
  const targetSalePrice = Number(formData.get('target_sale_price') || 0);

  const includesBattery = formData.get('includes_battery') === 'true';
  const includesCharger = formData.get('includes_charger') === 'true';
  const includesCase = formData.get('includes_case') === 'true';

  if (!productName) return badRequest('Product name is required.');
  if (!brandName) return badRequest('Brand is required.');
  if (!categoryName) return badRequest('Category is required.');

  try {
    const brandId = await ensureBrand(supabase, brandName);
    const categoryId = await ensureCategory(supabase, categoryName);
    const batteryPlatformId = await ensureBatteryPlatform(supabase, batteryPlatform, brandId);

    const sku = `JRT-${slugify(BRAND.name).slice(0, 3).toUpperCase()}-${slugify(brandName)
      .slice(0, 3)
      .toUpperCase()}-${(modelNumber || Date.now().toString()).replace(
      /\s+/g,
      '',
    )}-${Date.now().toString().slice(-4)}`;

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        internal_sku: sku,
        product_name: productName,
        brand_id: brandId,
        category_id: categoryId,
        battery_platform_id: batteryPlatformId,
        model_number: modelNumber || null,
        condition: condition || null,
        tool_type: batteryPlatform === 'Corded' ? 'Corded' : 'Cordless',
        working_status: 'Fully Working',
        includes_battery: includesBattery,
        includes_charger: includesCharger,
        includes_case: includesCase,
        description: notes || null,
        condition_notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, internal_sku')
      .single();

    if (productError) throw productError;

    const { error: lotError } = await supabase.from('inventory_lots').insert({
      product_id: product.id,
      purchase_date: new Date().toISOString().slice(0, 10),
      quantity_on_hand: quantityOnHand,
      reserved_quantity: 0,
      stock_threshold: 1,
      purchase_cost: purchaseCost,
      repair_cost: 0,
      prep_cost: 0,
      target_sale_price: targetSalePrice,
      minimum_accept_price: targetSalePrice ? Math.max(0, targetSalePrice - 20) : 0,
      location: location || null,
      stock_status: quantityOnHand > 0 ? 'In Stock' : 'Out of Stock',
      listing_status: 'Listed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (lotError) throw lotError;

    const files = formData.getAll('images').filter(Boolean);
    const imageUrls = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];

      if (!(file instanceof File) || file.size === 0) continue;

      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const path = `brands/${slugify(BRAND.name)}/${product.internal_sku}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, await file.arrayBuffer(), {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path);

      imageUrls.push(publicUrlData.publicUrl);

      const { error: imageError } = await supabase.from('product_images').insert({
        product_id: product.id,
        image_url: publicUrlData.publicUrl,
        is_primary: i === 0,
        sort_order: i,
      });

      if (imageError) throw imageError;
    }

    return Response.json({
      ok: true,
      sku: product.internal_sku,
      image_urls: imageUrls,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to save product.' }, { status: 500 });
  }
}
