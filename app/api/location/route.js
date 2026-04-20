import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ipapi responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      country_code: data?.country_code || null,
    });
  } catch (error) {
    console.error("Location lookup failed:", error);
    return NextResponse.json({ country_code: null }, { status: 200 });
  }
}
