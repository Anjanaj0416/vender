import { NextRequest, NextResponse } from "next/server";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[proxy:POST] save body:", JSON.stringify(body));

    const upstream = await fetch(
      `${LIVE_API_BASE}/TradezVendor/GetProductMgtSaveAsync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await upstream.json();
    console.log("[proxy:POST] upstream status:", upstream.status);
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    console.error("[proxy:POST] ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}