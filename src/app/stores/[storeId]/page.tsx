"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { FlexBox } from "components/flex-box";
import { Small } from "components/Typography";
import VendorProductManagementPageView from "pages-sections/vendor/products/page-view/vendor-product-management";

export default function StoreProductsPage() {
  const params  = useParams();
  const router  = useRouter();
  const { status } = useSession();                          // ← auth guard
  const storeId = params.storeId as string;

  // ── Redirect to login if not authenticated ─────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // ── Show spinner while checking auth or redirecting ────────────────────────
  if (status === "loading" || status === "unauthenticated") {
    return (
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Back nav */}
      <FlexBox alignItems="center" gap={1} mb={2.5}>
        <Tooltip title="Back to stores">
          <IconButton
            onClick={() => router.push("/")}
            size="small"
            sx={{
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: 2,
              "&:hover": { borderColor: "primary.main", color: "primary.main" },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <FlexBox alignItems="center" gap={0.75}>
          <StorefrontIcon sx={{ fontSize: 15, color: "text.disabled" }} />
          <Small
            fontWeight={700}
            color="text.disabled"
            sx={{ fontFamily: "monospace", fontSize: 11 }}
          >
            {storeId}
          </Small>
        </FlexBox>
      </FlexBox>

      {/* Product management view — unchanged */}
      <VendorProductManagementPageView
        userId="vendor"
        storeId={storeId}
      />
    </Box>
  );
}