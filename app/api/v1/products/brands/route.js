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
    const cacheKey = `${CACHE_PREFIX.PRODUCT}brands`;
    const { data: cached } = await cacheService.get(cacheKey);

    if (cached) {
      return NextResponse.json(success("Brands", cached), {
        status: 200,
        headers: withJsonHeaders(rateLimit.headers),
      });
    }

    const brands = await Product.aggregate([
      ...buildFlattenProductsStages(),
      {
        $group: {
          _id: "$brandName",
          count: { $sum: 1 },
          brandUrl: { $first: "$brandUrl" },
        },
      },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1, brandUrl: 1 } },
    ]);

    await cacheService.set(cacheKey, brands, CACHE_TTL.PRODUCT);
    return NextResponse.json(success("Brands", brands), {
      status: 200,
      headers: withJsonHeaders(rateLimit.headers),
    });
  } catch (err) {
    return NextResponse.json(error(err.message || "Brands request failed", null, 500), {
      status: 500,
      headers: withJsonHeaders(rateLimit.headers),
    });
  }
}
