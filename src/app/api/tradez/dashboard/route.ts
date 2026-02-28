import { NextRequest, NextResponse } from "next/server";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendorId") ?? "";

  console.log("[proxy:dashboard] vendorId =", vendorId);

  try {
    const upstream = await fetch(
      `${LIVE_API_BASE}/TradezVendor/GetVendorDashboard?vendorId=${vendorId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const data = await upstream.json();
    console.log("[proxy:dashboard] upstream status:", upstream.status);
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    console.error("[proxy:dashboard] ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}