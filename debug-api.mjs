// debug-api.mjs
// Run this in your project root:  node debug-api.mjs
//
// It will tell you EXACTLY what is failing — CORS, wrong storeId, bad response shape, etc.

const STORE_ID = "f6c95b9c-cbdf-4441-a053-66d75bacdd1f";
const LIVE_URL = `https://intranet_vertical.sltds.lk/api/TradezProduct/GetProductMgtInitAsync?storeId=${STORE_ID}`;

console.log("=".repeat(60));
console.log("TRADEZ API DIAGNOSTIC");
console.log("=".repeat(60));
console.log(`\n▶ Fetching: ${LIVE_URL}\n`);

async function run() {
  // ── 1. Test raw API reachability (Node has no CORS, so this is server-side) ──
  let raw;
  try {
    const res = await fetch(LIVE_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log(`✅ HTTP Status   : ${res.status} ${res.statusText}`);
    console.log(`   Content-Type  : ${res.headers.get("content-type")}`);
    console.log(`   CORS header   : ${res.headers.get("access-control-allow-origin") ?? "(not set)"}`);

    raw = await res.json();
    console.log("\n── Raw response (top level) ──────────────────────────────");
    console.log(JSON.stringify({
      statusCode: raw?.statusCode,
      success:    raw?.success,
      message:    raw?.message,
      dataKeys:   raw?.data ? Object.keys(raw.data) : null,
    }, null, 2));

    const inner = raw?.data?.data;
    if (!inner) {
      console.error("\n❌ PROBLEM: raw.data.data is missing!");
      console.log("   Full raw.data:", JSON.stringify(raw?.data, null, 2));
      return;
    }

    console.log("\n── inner data shape ──────────────────────────────────────");
    console.log(JSON.stringify({
      totalProducts: inner.totalProducts,
      inStock:       inner.inStock,
      outStock:      inner.outStock,
      lowStock:      inner.lowStock,
      listProductLength: inner.listProduct?.length ?? "MISSING",
    }, null, 2));

    if (!inner.listProduct || inner.listProduct.length === 0) {
      console.warn("\n⚠️  WARNING: listProduct is empty. No products for this storeId.");
      return;
    }

    // ── 2. Test the transform logic ──────────────────────────────────────────
    console.log("\n── Transform test ────────────────────────────────────────");
    const productMap = new Map();
    const IMAGE_BASE = "https://intranet_vertical.sltds.lk/";

    for (const item of inner.listProduct) {
      const imageUrl = item.productImage ? `${IMAGE_BASE}${item.productImage}` : undefined;
      const variant = {
        id:           item.variantId,
        sku:          item.productCode      ?? "",
        units:        item.newStock         ?? item.currentStock  ?? 0,
        price:        item.newPrice         ?? item.currentPrice  ?? 0,
        discount:     item.newDiscount      ?? item.currentDiscount ?? 0,
        discountType: item.isDiscountPercent ? "%" : "LKR",
        image:        imageUrl,
      };

      if (productMap.has(item.productId)) {
        productMap.get(item.productId).variants.push(variant);
      } else {
        productMap.set(item.productId, {
          id:       item.productId,
          name:     item.productName ?? "",
          brand:    item.brand       ?? "",
          images:   imageUrl ? [imageUrl] : [],
          minPrice: variant.price,
          maxPrice: variant.price,
          category: { id: item.category ?? "", name: item.category ?? "" },
          variants: [variant],
        });
      }
    }

    const products = Array.from(productMap.values());
    console.log(`✅ Transform produced ${products.length} product(s)`);
    console.log("\nFirst product:");
    const first = products[0];
    console.log(JSON.stringify({
      id:       first.id,
      name:     first.name,
      brand:    first.brand,
      category: first.category,
      variants: first.variants.length,
      sampleVariant: first.variants[0],
    }, null, 2));

    // ── 3. Check env var ─────────────────────────────────────────────────────
    console.log("\n── .env check ────────────────────────────────────────────");
    const envStoreId = process.env.NEXT_PUBLIC_STORE_ID;
    if (!envStoreId) {
      console.warn("⚠️  NEXT_PUBLIC_STORE_ID is NOT set in your .env.local");
      console.log("   Fix: add this line to .env.local:");
      console.log(`   NEXT_PUBLIC_STORE_ID=${STORE_ID}`);
    } else {
      console.log(`✅ NEXT_PUBLIC_STORE_ID = ${envStoreId}`);
    }

    console.log("\n── Summary ───────────────────────────────────────────────");
    console.log("✅ API is reachable from Node (server-side) — no CORS issue there.");
    console.log("   If the browser still shows 0 products, the proxy route is not");
    console.log("   wired up correctly. Check:");
    console.log("   1. src/app/api/tradez/products/route.ts  exists?");
    console.log("   2. src/services/vendor-api.ts  calls  /tradez/products?storeId=...");
    console.log("   3. vendor-product-management.tsx  has  { skip: !storeId }  (NOT !userId || !storeId)");
    console.log("   4. Open browser DevTools → Network tab → look for /api/tradez/products");
    console.log("      If it's missing, the query is being skipped.");
    console.log("      If it shows a 500/502, the proxy route has an error.");

  } catch (err) {
    console.error("\n❌ FETCH FAILED — API is unreachable from this machine.");
    console.error(`   Error: ${err.message}`);
    console.log("\n   Possible causes:");
    console.log("   - VPN / firewall blocking intranet_vertical.sltds.lk");
    console.log("   - The server is down or the URL is wrong");
    console.log("   - DNS cannot resolve 'intranet_vertical.sltds.lk'");
    console.log("\n   Try:  curl -I \"" + LIVE_URL + "\"");
  }
}

run();
