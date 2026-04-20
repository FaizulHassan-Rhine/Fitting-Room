import { NextResponse } from "next/server";
import {
  connectDB,
  searchService,
  success,
  error,
  getRequestMeta,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const meta = getRequestMeta(request);
    const result = await searchService.search(params, meta);

    return NextResponse.json(success("Search results fetched", result), {
      status: 200,
      headers: withJsonHeaders({
        "X-Cache": result.cached ? `HIT-${result.cacheLayer}` : "MISS",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Search request failed", null, 500),
      { status: 500, headers: withJsonHeaders() }
    );
  }
}
