import { createClient } from "@supabase/supabase-js";
import { BRAND } from "../../../config/brand";

export const runtime = "nodejs";

function badRequest(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function slugify(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureBrand(sb, name) {
  if (!name) return null;
  const { data, error } = await sb.from("brands").upsert({ name, slug: slugify(name) }, { onConflict: "name" }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureCategory(sb, name) {
  if (!name) return null;
  const { data, error } = await sb.from("tool_categories").upsert({ name }, { onConflict: "name" }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureBatteryPlatform(sb, name, brandId = null) {
  if (!name || name === "N/A") return null;
  const { data: existing, error: existingError } = await sb.from("battery_platforms").select("id").eq("name", name).maybeSingle();
  if (existingError) throw existingError;
  if (existing?.id) return existing.id;
  const { data, error } = await sb.from("battery_platforms").insert({ name, brand_id: brandId }).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";
  if (!url || !key) return badRequest("Missing Supabase environment variables.");

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const fd = await request.formData();

  const product_name = fd.get("product_name")?.toString().trim();
  const brand_name = fd.get("brand_name")?.toString().trim();
  const model_number = fd.get("model_number")?.toString().trim();
  const category_name = fd.get("category_name")?.toString().trim();
  const battery_platform = fd.get("battery_platform")?.toString().trim();
  const condition = fd.get("condition")?.toString().trim();
  const location = fd.get("location")?.toString().trim();
  const notes = fd.get("notes")?.toString().trim();
  const quantity_on_hand = Number(fd.get("quantity_on_hand") || 1);
  const purchase_cost = Number(fd.get("purchase_cost") || 0);
  const target_sale_price = Number(fd.get("target_sale_price") || 0);
  const includes_battery = fd.get("includes_battery") === "true";
  const includes_charger = fd.get("includes_charger") === "true";
  const includes_case = fd.get("includes_case") === "true";

  if (!product_name) return badRequest("Product name is required.");
  if (!brand_name) return badRequest("Brand is required.");
  if (!category_name) return badRequest("Category is required.");

  try {
    const brand_id = await ensureBrand(sb, brand_name);
    const category_id = await ensureCategory(sb, category_name);
    const battery_platform_id = await ensureBatteryPlatform(sb, battery_platform, brand_id);
    const sku = `JRT-${slugify(BRAND.name).slice(0,3).toUpperCase()}-${slugify(brand_name).slice(0,3).toUpperCase()}-${(model_number || Date.now().toString()).replace(/\s+/g, "")}-${Date.now().toString().slice(-4)}`;

    const { data: product, error: productError } = await sb
      .from("products")
      .insert({
        internal_sku: sku,
        product_name,
        brand_id,
        category_id,
        battery_platform_id,
        model_number: model_number || null,
        condition: condition || null,
        tool_type: battery_platform === "Corded" ? "Corded" : "Cordless",
        working_status: "Fully Working",
        includes_battery,
        includes_charger,
        includes_case,
        description: notes || null,
        condition_notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id, internal_sku")
      .single();

    if (productError) throw productError;

    const { error: lotError } = await sb
      .from("inventory_lots")
      .insert({
        product_id: product.id,
        purchase_date: new Date().toISOString().slice(0, 10),
        quantity_on_hand,
        reserved_quantity: 0,
        stock_threshold: 1,
        purchase_cost,
        repair_cost: 0,
        prep_cost: 0,
        target_sale_price,
        minimum_accept_price: target_sale_price ? Math.max(0, target_sale_price - 20) : 0,
        location: location || null,
        stock_status: quantity_on_hand > 0 ? "In Stock" : "Out of Stock",
        listing_status: "Listed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    if (lotError) throw lotError;

    const files = fd.getAll("images").filter(Boolean);
    const image_urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!(file instanceof File) || file.size === 0) continue;
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const path = `brands/${slugify(BRAND.name)}/${product.internal_sku}/${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await sb.storage.from(bucket).upload(path, await file.arrayBuffer(), { contentType: file.type || "application/octet-stream", upsert: true });
      if (uploadError) throw uploadError;
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      image_urls.push(data.publicUrl);
      const { error: imageError } = await sb.from("product_images").insert({ product_id: product.id, image_url: data.publicUrl, is_primary: i === 0, sort_order: i });
      if (imageError) throw imageError;
    }

    return Response.json({ ok: true, sku: product.internal_sku, image_urls });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to save product." }, { status: 500 });
  }
}
