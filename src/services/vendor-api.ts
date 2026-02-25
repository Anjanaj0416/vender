import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery,
  tagTypes: ["VENDOR_PRODUCT"],
  endpoints: (builder) => ({
    getVendorProducts: builder.query({
      query: ({ userId, storeId, page = 0, size = 20 }) =>
        `/vendor/products?userId=${userId}&storeId=${storeId}&page=${page}&size=${size}`,
      providesTags: ["VENDOR_PRODUCT"],
    }),
    updateProductVariant: builder.mutation({
      query: ({ productId, variantId, body }) => ({
        url: `/vendor/products/${productId}/variants/${variantId}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted(
        { userId, storeId, productId, variantId, body },
        { dispatch, queryFulfilled }
      ) {
        try {
          await queryFulfilled;
          dispatch(
            vendorApi.util.updateQueryData(
              "getVendorProducts",
              { userId, storeId },
              (draft) => {
                const product = draft.data?.find((p: any) => p.id === productId);
                if (product) {
                  const variant = product.variants?.find((v: any) => v.id === variantId);
                  if (variant) {
                    variant.units        = body.units;
                    variant.price        = body.price;
                    variant.discount     = body.discount     ?? 0;
                    variant.discountType = body.discountType ?? "%";
                  }
                }
              }
            )
          );
        } catch {
          // save failed — saveRow handles the error state
        }
      },
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useUpdateProductVariantMutation,
} = vendorApi;