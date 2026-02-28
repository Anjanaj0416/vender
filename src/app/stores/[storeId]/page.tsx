"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { FlexBox } from "components/flex-box";
import { H6, Small } from "components/Typography";
import VendorProductManagementPageView from "pages-sections/vendor/products/page-view/vendor-product-management";
import { useGetStoresQuery } from "services/vendor-api";

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: "success" | "error" | "warning" | "default" }> = {
  PUBLISHED:   { label: "Published",   color: "success" },
  UNPUBLISHED: { label: "Unpublished", color: "error"   },
  APPROVED:    { label: "Approved",    color: "warning"  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StoreProductsPage() {
  const params        = useParams();
  const router        = useRouter();
  const { status }    = useSession();
  const storeId       = params.storeId as string;

  // Fetch the full store list so we can pick out this store's details
  const { data: storesData, isLoading: storesLoading } = useGetStoresQuery();
  const store = storesData?.stores.find((s) => s.storeUuid === storeId);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  const statusCfg = STATUS_CONFIG[store?.storeStatus ?? ""] ?? { label: store?.storeStatus ?? "", color: "default" as const };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>

      {/* ── Back nav ── */}
      <FlexBox alignItems="center" gap={1} mb={3}>
        <Tooltip title="Back to Store Page">
          <IconButton
            onClick={() => router.push("/stores")}
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
        <Small fontWeight={700} color="text.disabled">
          Back to Store Page
        </Small>
      </FlexBox>

      {/* ── Store details banner ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3.5,
          p: 2,
          borderRadius: 3,
          border: "1.5px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        {storesLoading ? (
          <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 2, flexShrink: 0 }} />
        ) : (
          <Avatar
            src={store?.storeLogo ?? undefined}
            variant="rounded"
            sx={{
              width: 56, height: 56, flexShrink: 0,
              bgcolor: "grey.100",
              border: "1.5px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            {!store?.storeLogo && <StorefrontIcon sx={{ color: "text.disabled" }} />}
          </Avatar>
        )}

        {/* Name + meta */}
        <Box flex={1} overflow="hidden">
          {storesLoading ? (
            <>
              <Skeleton width={180} height={22} sx={{ mb: 0.5 }} />
              <Skeleton width={120} height={16} />
            </>
          ) : (
            <>
              <FlexBox alignItems="center" gap={1} flexWrap="wrap">
                <H6 fontWeight={900} noWrap sx={{ fontSize: 17 }}>
                  {store?.storeName ?? "Store"}
                </H6>
                <Chip
                  label={statusCfg.label}
                  color={statusCfg.color}
                  size="small"
                  sx={{ fontWeight: 800, fontSize: 11 }}
                />
              </FlexBox>

              <FlexBox alignItems="center" gap={2} mt={0.5} flexWrap="wrap">
                {store?.storeCode && (
                  <Small fontWeight={700} color="text.disabled">
                    {store.storeCode}
                  </Small>
                )}
                <FlexBox alignItems="center" gap={0.5}>
                  <InventoryIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                  <Small fontWeight={700} color="text.disabled">
                    {store?.productCount ?? 0} product{store?.productCount !== 1 ? "s" : ""}
                  </Small>
                </FlexBox>
              </FlexBox>
            </>
          )}
        </Box>
      </Box>

      {/* ── Product management view ── */}
      <VendorProductManagementPageView
        userId="vendor"
        storeId={storeId}
      />
    </Box>
  );
}