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
      invalidatesTags: ["VENDOR_PRODUCT"],
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useUpdateProductVariantMutation,
} = vendorApi;
