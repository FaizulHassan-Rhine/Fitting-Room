import { NextResponse } from "next/server";

function getSearchApiBase() {
  const configuredBase = process.env.SEARCH_API_BASE || process.env.NEXT_PUBLIC_SEARCH_API_BASE;
  if (configuredBase) return configuredBase.replace(/\/+$/, "");

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000/api/v1";
  }

  return "";
}

export async function GET(request) {
  const base = getSearchApiBase();
  if (!base) {
    return NextResponse.json(
      { message: "Search API base URL is not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const upstreamUrl = `${base}/search?${searchParams.toString()}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const bodyText = await upstream.text();
    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("Search proxy failed:", error);
    return NextResponse.json({ message: "Search service is unavailable." }, { status: 502 });
  }
}
