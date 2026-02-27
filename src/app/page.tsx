"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { H3, H6, Paragraph, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { useGetStoresQuery } from "services/vendor-api";
import { StoreInfo } from "services/vendor-api";

// ─── Proxy logo URL through our own Next.js server ───────────────────────────
function proxyLogo(url: string | null): string | undefined {
  if (!url) return undefined;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "default"; Icon: any }
> = {
  PUBLISHED:   { label: "Published",   color: "success", Icon: CheckCircleOutlineIcon  },
  UNPUBLISHED: { label: "Unpublished", color: "error",   Icon: PauseCircleOutlineIcon  },
  APPROVED:    { label: "Approved",    color: "warning", Icon: HourglassTopIcon         },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, color: "default", Icon: StorefrontIcon };
}

// ─── Store Card ───────────────────────────────────────────────────────────────
interface StoreCardProps {
  store: StoreInfo;
  onClick: () => void;
}

const StoreCard = ({ store, onClick }: StoreCardProps) => {
  const { storeName, storeCode, storeDescription, storeLogo, storeStatus, productCount } = store;
  const { label: statusLabel, color: statusColor, Icon: StatusIcon } = getStatusConfig(storeStatus);

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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 20px rgba(220,38,38,0.10)",
          transform: "translateY(-2px)",
        },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "3px",
          bgcolor: "primary.main",
          opacity: 0,
          transition: "opacity 0.18s ease",
        },
        "&:hover::before": { opacity: 1 },
      }}
    >
      {/* Header: logo + store name + store code */}
      <FlexBox alignItems="flex-start" gap={1.5} mb={1.5}>
        <Avatar
          src={proxyLogo(storeLogo)}
          variant="rounded"
          imgProps={{ onError: (e: any) => { e.target.style.display = "none"; } }}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "grey.100",
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <StorefrontIcon sx={{ fontSize: 22, color: "text.disabled" }} />
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Small
            fontWeight={800}
            color="text.disabled"
            sx={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px", display: "block", mb: 0.3 }}
          >
            {storeCode}
          </Small>
          <H6
            fontWeight={900}
            sx={{
              fontSize: 14,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {storeName || "—"}
          </H6>
          {storeDescription && (
            <Small
              color="text.secondary"
              sx={{
                fontSize: 11,
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {storeDescription}
            </Small>
          )}
        </Box>
      </FlexBox>

      {/* Divider */}
      <Box sx={{ height: "1px", bgcolor: "divider", mx: -0.5, mb: 1.5 }} />

      {/* Status + product count */}
      <FlexBetween mt="auto">
        <FlexBox alignItems="center" gap={0.5}>
          <InventoryIcon sx={{ fontSize: 15, color: "text.disabled" }} />
          <Small fontWeight={700} color="text.secondary" fontSize={12}>
            {productCount} {productCount === 1 ? "product" : "products"}
          </Small>
        </FlexBox>

        <Chip
          size="small"
          icon={<StatusIcon sx={{ fontSize: "13px !important" }} />}
          label={statusLabel}
          color={statusColor}
          variant={storeStatus === "PUBLISHED" ? "filled" : "outlined"}
          sx={{
            fontWeight: 800,
            fontSize: 10.5,
            height: 22,
            "& .MuiChip-label": { px: 0.75 },
            "& .MuiChip-icon": { ml: 0.5 },
          }}
        />
      </FlexBetween>

      {/* Manage button */}
      <Chip
        label="Manage →"
        size="small"
        color="primary"
        sx={{
          mt: 1.5,
          width: "100%",
          fontWeight: 800,
          fontSize: 11,
          height: 26,
          borderRadius: 1.5,
          cursor: "pointer",
          bgcolor: "primary.main",
          "& .MuiChip-label": { px: 1 },
        }}
      />
    </Card>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const StoreCardSkeleton = () => (
  <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
    <FlexBox alignItems="center" gap={1.5} mb={1.5}>
      <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
      <Box flex={1}>
        <Skeleton variant="text" width="35%" height={12} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={18} />
        <Skeleton variant="text" width="50%" height={14} />
      </Box>
    </FlexBox>
    <Skeleton variant="text" height={1} sx={{ mb: 1.5 }} />
    <FlexBetween>
      <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 2 }} />
    </FlexBetween>
    <Skeleton variant="rounded" height={26} sx={{ borderRadius: 1.5, mt: 1.5 }} />
  </Card>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoreSelectionPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetStoresQuery();

  const stores = data?.stores ?? [];
  const totalProducts = data?.totalProducts ?? 0;
  const totalStores   = data?.totalStores   ?? stores.length;

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
              label={`${totalStores} Store${totalStores !== 1 ? "s" : ""}`}
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

      {/* Error */}
      {isError && (
        <Card sx={{ p: 4, borderRadius: 3, border: "1.5px solid", borderColor: "error.main", boxShadow: "none", textAlign: "center" }}>
          <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
          <H6 fontWeight={800} mb={0.5}>Failed to load stores</H6>
          <Paragraph color="text.secondary" fontSize={13}>
            Could not reach the API. Please check your network connection and try again.
          </Paragraph>
        </Card>
      )}

      {/* Grid */}
      <Grid container spacing={2.5}>
        {isLoading && [...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <StoreCardSkeleton />
          </Grid>
        ))}

        {!isLoading && !isError && stores.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", textAlign: "center" }}>
              <StorefrontIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
              <H6 fontWeight={800} mb={0.5}>No stores found</H6>
              <Paragraph color="text.secondary" fontSize={13}>No stores were found in the system.</Paragraph>
            </Card>
          </Grid>
        )}

        {!isLoading && !isError && stores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store.storeCode}>
            <StoreCard
              store={store}
              onClick={() => router.push(`/stores/${store.storeUuid}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}