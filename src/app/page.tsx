"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { H3, H6, Paragraph, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { useGetStoresQuery } from "services/vendor-api";

// ─── Store Card ───────────────────────────────────────────────────────────────
interface StoreCardProps {
  storeId: string;
  productCount: number;
  index: number;
  onClick: () => void;
}

const StoreCard = ({ storeId, productCount, index, onClick }: StoreCardProps) => {
  // Truncate storeId for display: show first 8 and last 4 chars
  const shortId = `${storeId.slice(0, 8)}…${storeId.slice(-4)}`;

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1.5px solid",
        borderColor: "divider",
        boxShadow: "none",
        cursor: "pointer",
        transition: "all 0.18s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 20px rgba(220,38,38,0.10)",
          transform: "translateY(-2px)",
          "& .arrow-icon": { opacity: 1, transform: "translateX(0)" },
          "& .store-icon": { color: "primary.main" },
        },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          bgcolor: "primary.main",
          opacity: 0,
          transition: "opacity 0.18s ease",
        },
        "&:hover::before": { opacity: 1 },
      }}
    >
      {/* Header row */}
      <FlexBetween mb={2}>
        <FlexBox alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <StorefrontIcon
              className="store-icon"
              sx={{ fontSize: 20, color: "text.disabled", transition: "color 0.18s" }}
            />
          </Box>
          <Box>
            <Small
              fontWeight={800}
              color="text.disabled"
              sx={{ textTransform: "uppercase", fontSize: 9.5, letterSpacing: ".5px", display: "block" }}
            >
              Store #{String(index + 1).padStart(2, "0")}
            </Small>
            <H6 fontWeight={800} fontSize={13} sx={{ fontFamily: "monospace", letterSpacing: ".3px" }}>
              {shortId}
            </H6>
          </Box>
        </FlexBox>

        <ArrowForwardIcon
          className="arrow-icon"
          sx={{
            fontSize: 18,
            color: "primary.main",
            opacity: 0,
            transform: "translateX(-4px)",
            transition: "all 0.18s ease",
          }}
        />
      </FlexBetween>

      <Divider sx={{ mb: 2 }} />

      {/* Stats */}
      <FlexBox alignItems="center" gap={1}>
        <InventoryIcon sx={{ fontSize: 15, color: "text.disabled" }} />
        <Small fontWeight={700} color="text.secondary">
          {productCount} product{productCount !== 1 ? "s" : ""}
        </Small>
        <Box flex={1} />
        <Chip
          label="Manage →"
          size="small"
          color="primary"
          sx={{
            fontWeight: 800,
            fontSize: 10.5,
            height: 22,
            bgcolor: "primary.main",
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </FlexBox>

      {/* Full storeId tooltip */}
      <Box
        mt={1.5}
        sx={{
          bgcolor: "grey.50",
          borderRadius: 1.5,
          px: 1,
          py: 0.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Small
          fontWeight={600}
          color="text.disabled"
          sx={{ fontFamily: "monospace", fontSize: 10, wordBreak: "break-all", display: "block" }}
        >
          {storeId}
        </Small>
      </Box>
    </Card>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const StoreCardSkeleton = () => (
  <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
    <FlexBox alignItems="center" gap={1.5} mb={2}>
      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />
      <Box flex={1}>
        <Skeleton variant="text" width="40%" height={14} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={18} />
      </Box>
    </FlexBox>
    <Skeleton variant="text" height={1} sx={{ mb: 2 }} />
    <Skeleton variant="rounded" height={28} sx={{ borderRadius: 1.5 }} />
    <Skeleton variant="rounded" height={28} sx={{ borderRadius: 1.5, mt: 1.5 }} />
  </Card>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoreSelectionPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetStoresQuery();

  const stores = data?.stores ?? [];
  const totalProducts = data?.totalProducts ?? 0;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>
      {/* Header */}
      <Box mb={4}>
        <FlexBox alignItems="center" gap={1.5} mb={1}>
          <StorefrontIcon sx={{ fontSize: 28, color: "primary.main" }} />
          <H3 fontWeight={900}>Select a Store</H3>
        </FlexBox>
        <Paragraph color="text.secondary" fontWeight={600}>
          Choose a store to manage its product inventory, stock levels, pricing, and discounts.
        </Paragraph>

        {!isLoading && stores.length > 0 && (
          <FlexBox gap={1.5} mt={2} flexWrap="wrap">
            <Chip
              label={`${stores.length} Store${stores.length !== 1 ? "s" : ""}`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: "grey.100", fontSize: 12 }}
            />
            <Chip
              label={`${totalProducts} Total Products`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800, fontSize: 12 }}
            />
          </FlexBox>
        )}
      </Box>

      {/* Error state */}
      {isError && (
        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1.5px solid",
            borderColor: "error.main",
            boxShadow: "none",
            textAlign: "center",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
          <H6 fontWeight={800} mb={0.5}>Failed to load stores</H6>
          <Paragraph color="text.secondary" fontSize={13}>
            Could not reach the API. Please check your network connection and try again.
          </Paragraph>
        </Card>
      )}

      {/* Store grid */}
      <Grid container spacing={2.5}>
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <StoreCardSkeleton />
            </Grid>
          ))}

        {!isLoading &&
          !isError &&
          stores.length === 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  p: 5,
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  textAlign: "center",
                }}
              >
                <StorefrontIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                <H6 fontWeight={800} mb={0.5}>No stores found</H6>
                <Paragraph color="text.secondary" fontSize={13}>
                  No stores with products were found in the system.
                </Paragraph>
              </Card>
            </Grid>
          )}

        {!isLoading &&
          !isError &&
          stores.map((store, index) => (
            <Grid item xs={12} sm={6} md={4} key={store.storeId}>
              <StoreCard
                storeId={store.storeId}
                productCount={store.productCount}
                index={index}
                onClick={() => router.push(`/stores/${store.storeId}`)}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}