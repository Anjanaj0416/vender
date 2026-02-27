import { NextRequest, NextResponse } from "next/server";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId") ?? "";

  console.log("[proxy:GET] storeId =", storeId);

  try {
    const upstream = await fetch(
      `${LIVE_API_BASE}/TradezProduct/GetProductMgtInitAsync?storeId=${storeId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const data = await upstream.json();
    console.log(
      "[proxy:GET] upstream status:", upstream.status,
      "| listProduct length:", data?.data?.data?.listProduct?.length ?? "N/A"
    );
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    console.error("[proxy:GET] ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}