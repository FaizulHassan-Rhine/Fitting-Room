import { NextResponse } from "next/server";
import {
  connectDB,
  searchService,
  success,
  error,
  getRequestMeta,
  enforceRateLimit,
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
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const meta = getRequestMeta(request);
    const result = await searchService.search(params, meta);

    return NextResponse.json(success("Search results fetched", result), {
      status: 200,
      headers: withJsonHeaders({
        ...rateLimit.headers,
        "X-Cache": result.cached ? `HIT-${result.cacheLayer}` : "MISS",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Search request failed", null, 500),
      { status: 500, headers: withJsonHeaders(rateLimit.headers) }
    );
  }
}
