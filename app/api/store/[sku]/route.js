import { getStoreProductBySku } from "../../../../lib/storefront";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const product = await getStoreProductBySku(params.sku);
    if (!product) {
      return Response.json({ error: "Product not found." }, { status: 404 });
    }
    return Response.json({ product });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to load product." }, { status: 500 });
  }
}
