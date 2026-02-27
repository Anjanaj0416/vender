import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Product1, ProductVariant } from "models/Product.model";

const IMAGE_BASE_URL = "https://intranet_vertical.sltds.lk/";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreInfo {
  storeId:          string;   // numeric string "01", "02", etc.
  storeUuid:        string;   // real UUID used as path param for products
  storeName:        string;
  storeDescription: string;
  storeLogo:        string | null;
  storeCode:        string;   // "STORE #01"
  storeStatus:      "PUBLISHED" | "UNPUBLISHED" | "APPROVED" | string;
  productCount:     number;
}

export interface SaveDetail {
  productId:         string;
  variantId:         string;
  newStock:          number;
  newPrice:          number;
  newDiscount:       number;
  discountType:      "%" | "LKR";
  isDiscountPercent: boolean;
}

// ─── Transform live API → internal Product1[] ────────────────────────────────

function transformLiveProducts(apiResponse: any): { data: Product1[] } {
  const raw: any[] = apiResponse?.data?.data?.listProduct ?? [];
  console.log("[vendor-api] raw items =", raw.length);

  const productMap = new Map<string, Product1>();

  for (const item of raw) {
    const imageUrl = item.productImage
      ? `${IMAGE_BASE_URL}${item.productImage}`
      : undefined;

    const variant: ProductVariant = {
      id:           item.variantId,
      sku:          item.productCode         ?? "",
      units:        item.newStock            ?? item.currentStock    ?? 0,
      price:        item.newPrice            ?? item.currentPrice    ?? 0,
      discount:     item.newDiscount         ?? item.currentDiscount ?? 0,
      discountType: item.isDiscountPercent   ? "%" : "LKR",
      image:        imageUrl,
      reOrderLevel: 5,
      attributes:   [],
    };

    if (productMap.has(item.productId)) {
      const p = productMap.get(item.productId)!;
      p.variants!.push(variant);
      if (variant.price > 0) {
        p.minPrice = Math.min(p.minPrice || variant.price, variant.price);
        p.maxPrice = Math.max(p.maxPrice, variant.price);
      }
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
  console.log("[vendor-api] transformed products =", products.length);
  return { data: products };
}

// ─── RTK Query API ────────────────────────────────────────────────────────────

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["VENDOR_PRODUCT", "STORES"],
  endpoints: (builder) => ({

    // ── List all stores ──────────────────────────────────────────────────────
    getStores: builder.query<{
      totalStores: number; stores: StoreInfo[]; totalProducts: number 
}, void>({
      query: () => "/tradez/stores",
      providesTags: ["STORES"],
    }),

    // ── Products for a store ─────────────────────────────────────────────────
    getVendorProducts: builder.query<{ data: Product1[] }, { storeId: string }>({
      query: ({ storeId }) => {
        console.log("[vendor-api] getVendorProducts storeId =", storeId);
        return `/tradez/products?storeId=${storeId}`;
      },
      transformResponse: transformLiveProducts,
      providesTags: ["VENDOR_PRODUCT"],
    }),

    // ── Bulk save (1 or many items in listUpdateDetails[]) ───────────────────
    // Single save   → listUpdateDetails with 1 item
    // Save All      → listUpdateDetails with all changed items
    bulkSaveVariants: builder.mutation<
      any,
      { storeId: string; items: SaveDetail[] }
    >({
      query: ({ storeId, items }) => {
        console.log("[vendor-api] bulkSave storeId =", storeId, "items =", items.length);
        return {
          url: "/tradez/products/save",
          method: "POST",
          body: {
            storeId,
            listUpdateDetails: items.map((item) => ({
              productId:         item.productId,
              variantId:         item.variantId,
              newStock:          item.newStock,
              newPrice:          item.newPrice,
              newDiscount:       item.newDiscount,
              discountType:      item.discountType,
              isDiscountPercent: item.isDiscountPercent,
            })),
          },
        };
      },
      // Optimistic cache update — apply all item changes immediately
      async onQueryStarted({ storeId, items }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          vendorApi.util.updateQueryData(
            "getVendorProducts",
            { storeId },
            (draft) => {
              for (const item of items) {
                const product = draft.data?.find((p: any) => p.id === item.productId);
                if (product) {
                  const variant = product.variants?.find((v: any) => v.id === item.variantId);
                  if (variant) {
                    variant.units        = item.newStock;
                    variant.price        = item.newPrice;
                    variant.discount     = item.newDiscount;
                    variant.discountType = item.discountType;
                  }
                }
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on failure
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetVendorProductsQuery,
  useBulkSaveVariantsMutation,
} = vendorApi;