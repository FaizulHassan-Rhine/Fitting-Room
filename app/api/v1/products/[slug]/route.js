import { NextResponse } from "next/server";
import {
  connectDB,
  Product,
  success,
  error,
  notFound,
  enforceRateLimit,
  cacheService,
  CACHE_PREFIX,
  CACHE_TTL,
  buildFlattenProductsStages,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const rateLimit = enforceRateLimit(_request);
  if (rateLimit.limited) {
    return NextResponse.json(
      error("Too many requests — please slow down and try again shortly.", null, 429),
      {
        status: 429,
        headers: withJsonHeaders({
          ...rateLimit.headers,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        }),
      }
    );
  }

  try {
    await connectDB();
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json(notFound("Product slug is required"), {
        status: 400,
        headers: withJsonHeaders(rateLimit.headers),
      });
    }

    const cacheKey = `${CACHE_PREFIX.PRODUCT}${slug}`;
    const { data: cached } = await cacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json(success("Product found", cached), {
        status: 200,
        headers: withJsonHeaders({
          ...rateLimit.headers,
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
        headers: withJsonHeaders(rateLimit.headers),
      });
    }

    product.slug = slug;
    await cacheService.set(cacheKey, product, CACHE_TTL.PRODUCT);

    return NextResponse.json(success("Product found", product), {
      status: 200,
      headers: withJsonHeaders({
        ...rateLimit.headers,
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Product lookup failed", null, 500),
      { status: 500, headers: withJsonHeaders(rateLimit.headers) }
    );
  }
}
