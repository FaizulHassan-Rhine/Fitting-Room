import { NextResponse } from "next/server";
import {
  connectDB,
  searchService,
  success,
  error,
  withJsonHeaders,
} from "@/lib/server/searchBackendRuntime";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.trim().length < 2) {
      return NextResponse.json(success("Suggestions", []), {
        status: 200,
        headers: withJsonHeaders({ "Cache-Control": "public, max-age=300" }),
      });
    }

    const suggestions = await searchService.autocomplete(q);
    return NextResponse.json(success("Autocomplete suggestions", suggestions), {
      status: 200,
      headers: withJsonHeaders({
        "X-Cache": "AC",
        "Cache-Control": "public, max-age=300",
      }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Autocomplete request failed", null, 500),
      { status: 500, headers: withJsonHeaders() }
    );
  }
}
