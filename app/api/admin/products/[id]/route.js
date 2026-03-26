import { getServerSupabase } from '../../../../../lib/supabase';
import { requireAdminUser } from '../../../../../lib/adminAuth';
import { normalizeProduct } from '../../../../../lib/storefront';

export const runtime = 'nodejs';

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
}

async function uploadImages(supabase, bucketName, slug, files) {
  const imageUrls = [];
  const publicBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];

    if (!file || typeof file.arrayBuffer !== 'function' || Number(file.size || 0) === 0) continue;

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const path = `brands/jr-tools-usa/${slug}/${Date.now()}-${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    imageUrls.push(`${publicBaseUrl}/storage/v1/object/public/${bucketName}/${path}`);
  }

  return imageUrls;
}

export async function PUT(request, { params }) {
  const authResult = await requireAdminUser(request);
  if (authResult.error) return authResult.error;

  try {
    const supabase = getServerSupabase();
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';
    const formData = await request.formData();

    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingProduct) {
      return Response.json({ error: 'Product not found.' }, { status: 404 });
    }

    const files = formData.getAll('images').filter(Boolean);
    const uploadedImageUrls = await uploadImages(
      supabase,
      bucketName,
      existingProduct.slug || existingProduct.id,
      files,
    );

    const existingImages = parseJsonArray(formData.get('existing_images')?.toString());
    const primarySource = formData.get('primary_source')?.toString() || '';
    const imageMode = formData.get('image_mode')?.toString() || 'append';

    let mergedImages =
      imageMode === 'replace'
        ? [...uploadedImageUrls]
        : [...existingImages, ...uploadedImageUrls].filter(Boolean);

    if (primarySource.startsWith('existing:')) {
      const selected = primarySource.replace('existing:', '');
      mergedImages = [selected, ...mergedImages.filter((image) => image !== selected)];
    }

    if (primarySource.startsWith('new:')) {
      const selectedIndex = Number(primarySource.replace('new:', ''));
      const selected = uploadedImageUrls[selectedIndex];
      if (selected) {
        mergedImages = [selected, ...mergedImages.filter((image) => image !== selected)];
      }
    }

    const payload = {
      name: formData.get('name')?.toString().trim() || 'Tool',
      brand: formData.get('brand')?.toString().trim() || 'Tool',
      model: formData.get('model')?.toString().trim() || '',
      description: formData.get('description')?.toString().trim() || '',
      price: normalizeNumber(formData.get('price'), 0),
      stock: normalizeNumber(formData.get('stock'), 0),
      active: formData.get('active') !== 'false',
      images: mergedImages,
      image_url: mergedImages[0] || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;

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
