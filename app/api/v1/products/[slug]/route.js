import { NextResponse } from "next/server";
import {
  connectDB,
  Product,
  success,
  error,
  notFound,
  cacheService,
  CACHE_PREFIX,
  CACHE_TTL,
  buildFlattenProductsStages,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json(notFound("Product slug is required"), {
        status: 400,
        headers: withJsonHeaders(),
      });
    }

    const cacheKey = `${CACHE_PREFIX.PRODUCT}${slug}`;
    const { data: cached } = await cacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json(success("Product found", cached), {
        status: 200,
        headers: withJsonHeaders({
          "X-Cache": "HIT",
          "Cache-Control": "public, max-age=300",
        }),
      });
    }

    const [product] = await Product.aggregate([
      ...buildFlattenProductsStages(),
      { $match: { url: { $regex: `/${slug}$`, $options: "i" } } },
      { $limit: 1 },
    ]);

    if (!product) {
      return NextResponse.json(notFound("Product not found"), {
        status: 404,
        headers: withJsonHeaders(),
      });
    }

    product.slug = slug;
    await cacheService.set(cacheKey, product, CACHE_TTL.PRODUCT);

    return NextResponse.json(success("Product found", product), {
      status: 200,
      headers: withJsonHeaders({
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Product lookup failed", null, 500),
      { status: 500, headers: withJsonHeaders() }
    );
  }
}
