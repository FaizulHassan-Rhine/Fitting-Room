import { NextResponse } from "next/server";
import {
  connectDB,
  Product,
  success,
  error,
  cacheService,
  CACHE_PREFIX,
  CACHE_TTL,
  buildFlattenProductsStages,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const cacheKey = `${CACHE_PREFIX.PRODUCT}brands`;
    const { data: cached } = await cacheService.get(cacheKey);

    if (cached) {
      return NextResponse.json(success("Brands", cached), {
        status: 200,
        headers: withJsonHeaders(),
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
      headers: withJsonHeaders(),
    });
  } catch (err) {
    return NextResponse.json(error(err.message || "Brands request failed", null, 500), {
      status: 500,
      headers: withJsonHeaders(),
    });
  }
}
