import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = request.nextUrl.origin;
  const upstreamUrl = `${origin}/api/v1/search?${searchParams.toString()}`;

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
    return NextResponse.json({ message: "Search service is unavailable." }, { status: 500 });
  }
}
