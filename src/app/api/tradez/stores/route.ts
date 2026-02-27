import { NextRequest, NextResponse } from "next/server";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";
const IMAGE_BASE_URL = "https://intranet_vertical.sltds.lk/";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendorId") ?? "";

  try {
    const upstream = await fetch(
      `${LIVE_API_BASE}/TradezProduct/GetVendorStoreDetailsInitAsync?vendorId=${vendorId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    const json = await upstream.json();
    const storeData = json?.data?.data;
    const rawStores: any[] = storeData?.stores ?? [];

    // ── DEBUG: log first store to inspect exact storeLogo value ──────────────
    if (rawStores.length > 0) {
      console.log("[proxy:stores] RAW first store storeLogo:", rawStores[0].storeLogo);
      console.log("[proxy:stores] All fields:", JSON.stringify(rawStores[0], null, 2));
    }

    const stores = rawStores.map((s: any) => {
      const rawLogo: string = s.storeLogo ?? "";

      // Try the direct image base URL first — if it's a relative path like
      // "store/{uuid}/asset/{file}.png" this builds the full URL
      const storeLogo = rawLogo ? `${IMAGE_BASE_URL}${rawLogo}` : null;

      // Also try via the API endpoint in case static serving doesn't work
      // Example: /api/Asset/GetAssetAsync?path=store/{uuid}/asset/{file}.png
      const storeLogoApi = rawLogo
        ? `${LIVE_API_BASE}/Asset/GetAssetAsync?path=${encodeURIComponent(rawLogo)}`
        : null;

      // Extract UUID from logo path: "store/{uuid}/asset/..."
      const storeUuid = rawLogo.match(/^store\/([^/]+)\//)?.[1] ?? "";

      console.log(`[proxy:stores] ${s.storeCode} uuid=${storeUuid} logo=${storeLogo}`);

      return {
        storeUuid,
        storeName:        s.storeName        ?? "",
        storeDescription: s.storeDescription ?? "",
        storeLogo,        // direct URL — use this first
        storeLogoApi,     // API-served fallback
        storeCode:        s.storeCode        ?? "",
        storeStatus:      s.storeStatus      ?? "",
        productCount:     s.productCount     ?? 0,
      };
    });

    return NextResponse.json({
      success:       true,
      stores,
      totalStores:   storeData?.totalStores   ?? stores.length,
      totalProducts: storeData?.totalProducts ?? 0,
    });
  } catch (err: any) {
    console.error("[proxy:stores] ERROR:", err.message);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${err.message}`, stores: [] },
      { status: 502 }
    );
  }
}