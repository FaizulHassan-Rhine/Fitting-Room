import { NextResponse } from "next/server";
import {
  connectDB,
  searchService,
  success,
  error,
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
    const q = searchParams.get("q") || "";

    if (!q || q.trim().length < 2) {
      return NextResponse.json(success("Suggestions", []), {
        status: 200,
        headers: withJsonHeaders({
          ...rateLimit.headers,
          "Cache-Control": "public, max-age=300",
        }),
      });
    }

    const suggestions = await searchService.autocomplete(q);
    return NextResponse.json(success("Autocomplete suggestions", suggestions), {
      status: 200,
      headers: withJsonHeaders({
        ...rateLimit.headers,
        "X-Cache": "AC",
        "Cache-Control": "public, max-age=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Autocomplete request failed", null, 500),
      { status: 500, headers: withJsonHeaders(rateLimit.headers) }
    );
  }
}
