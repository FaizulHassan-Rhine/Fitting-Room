import { NextResponse } from "next/server";
import {
  connectDB,
  Product,
  success,
  error,
  enforceRateLimit,
  cacheService,
  CACHE_PREFIX,
  CACHE_TTL,
  buildFlattenProductsStages,
  urlToSlug,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

export async function GET(request) {
  const rateLimit = enforceRateLimit(request);
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
    const cacheKey = `${CACHE_PREFIX.PRODUCT}featured`;
    const { data: cached } = await cacheService.get(cacheKey);

    if (cached) {
      return NextResponse.json(success("Featured products", cached), {
        status: 200,
        headers: withJsonHeaders({
          ...rateLimit.headers,
          "X-Cache": "HIT",
          "Cache-Control": "public, max-age=300",
        }),
      });
    }

    const products = await Product.aggregate([
      ...buildFlattenProductsStages(),
      { $sort: { sourceDocumentId: -1 } },
      { $limit: 12 },
      {
        $project: {
          title: 1,
          url: 1,
          brandName: 1,
          price: 1,
          currency: 1,
          images: { $slice: ["$images", 1] },
          description: 1,
          sourceDomain: 1,
        },
      },
    ]);

    const data = products.map((p) => ({ ...p, slug: urlToSlug(p.url) }));
    await cacheService.set(cacheKey, data, CACHE_TTL.PRODUCT);

    return NextResponse.json(success("Featured products", data), {
      status: 200,
      headers: withJsonHeaders({
        ...rateLimit.headers,
        "Cache-Control": "public, max-age=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Featured products request failed", null, 500),
      { status: 500, headers: withJsonHeaders(rateLimit.headers) }
    );
  }
}
