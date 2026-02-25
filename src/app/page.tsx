import Box from "@mui/material/Box";
import VendorProductManagementPageView from "pages-sections/vendor/products/page-view/vendor-product-management";

export default function VendorProductsPage() {
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      <VendorProductManagementPageView
        userId="user-demo-001"
        storeId="store-demo-001"
      />
    </Box>
  );
}
