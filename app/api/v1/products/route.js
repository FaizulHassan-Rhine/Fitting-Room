import { NextResponse } from "next/server";
import {
  connectDB,
  Product,
  success,
  error,
  enforceRateLimit,
  buildFlattenProductsStages,
  buildSafePriceNumberExpr,
  urlToSlug,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    const { searchParams } = new URL(request.url);

    const brandName = searchParams.get("brandName");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [...buildFlattenProductsStages()];

    const baseMatch = {};
    if (brandName) {
      baseMatch.brandName = { $regex: new RegExp(`^${escapeRegex(brandName)}$`, "i") };
    }
    if (Object.keys(baseMatch).length) pipeline.push({ $match: baseMatch });

    pipeline.push({ $addFields: { priceNum: buildSafePriceNumberExpr("$price") } });

    if (minPrice !== null || maxPrice !== null) {
      const priceFilter = {};
      if (minPrice !== null) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice !== null) priceFilter.$lte = parseFloat(maxPrice);
      pipeline.push({ $match: { priceNum: priceFilter } });
    }

    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              title: 1,
              url: 1,
              brandName: 1,
              price: 1,
              currency: 1,
              images: { $slice: ["$images", 1] },
              description: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    });

    const [result] = await Product.aggregate(pipeline);
    const total = result?.total?.[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limitNum) || 0;

    const data = (result?.data ?? []).map((p) => ({
      ...p,
      slug: urlToSlug(p.url),
    }));

    return NextResponse.json(
      success("Products fetched", {
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      }),
      { status: 200, headers: withJsonHeaders(rateLimit.headers) }
    );
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Products request failed", null, 500),
      { status: 500, headers: withJsonHeaders(rateLimit.headers) }
    );
  }
}
