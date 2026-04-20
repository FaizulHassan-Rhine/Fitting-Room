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
    const limit = searchParams.get("limit") || "10";
    const results = await searchService.getTrending(limit);

    return NextResponse.json(success("Trending searches", results), {
      status: 200,
      headers: withJsonHeaders({ "Cache-Control": "public, max-age=300" }),
    });
  } catch (err) {
    return NextResponse.json(
      error(err.message || "Trending request failed", null, 500),
      { status: 500, headers: withJsonHeaders() }
    );
  }
}
