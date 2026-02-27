import { NextResponse } from "next/server";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

export async function GET() {
  try {
    // Calling with empty storeId returns all products across all stores
    const upstream = await fetch(
      `${LIVE_API_BASE}/TradezProduct/GetProductMgtInitAsync?storeId=`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const data = await upstream.json();
    const listProduct: any[] = data?.data?.data?.listProduct ?? [];

    // Extract unique storeIds from product image paths
    // Image path format: "store/{storeId}/products/..."
    const storeMap = new Map<string, { storeId: string; productCount: number }>();

    for (const item of listProduct) {
      const imgPath: string = item.productImage ?? "";
      const match = imgPath.match(/^store\/([^/]+)\//);
      const storeId = match ? match[1] : null;
      if (!storeId) continue;

      if (storeMap.has(storeId)) {
        storeMap.get(storeId)!.productCount++;
      } else {
        storeMap.set(storeId, { storeId, productCount: 1 });
      }
    }

    const stores = Array.from(storeMap.values());
    console.log("[proxy:stores] found", stores.length, "unique stores from", listProduct.length, "products");

    return NextResponse.json({
      success: true,
      stores,
      totalProducts: listProduct.length,
    });
  } catch (err: any) {
    console.error("[proxy:stores] ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${err.message}`, stores: [] },
      { status: 502 }
    );
  }
}