"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LogoutIcon from "@mui/icons-material/Logout";
import { H3, H6, Paragraph, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { useGetStoresQuery } from "services/vendor-api";
import { StoreInfo } from "services/vendor-api";

// ─── Proxy logo URL ───────────────────────────────────────────────────────────
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

// ─── Top Navigation Bar ───────────────────────────────────────────────────────
function TopNavBar() {
  const { data: session } = useSession();
  const userName  = session?.user?.name  ?? "";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? undefined;

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        bgcolor: "#ffffff",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Left — TRADEZ brand */}
        <FlexBox alignItems="center" gap={1.25}>
          <svg width="28" height="24" viewBox="0 0 120 100" fill="none">
            <polygon points="60,10 100,55 75,55" fill="#f5a623" />
            <polygon points="20,55 60,10 45,55" fill="#f5a623" />
            <polygon points="20,55 75,55 60,85 45,70" fill="#f0c040" />
            <path d="M52,22 Q60,14 68,22" stroke="#c0392b" strokeWidth="6" fill="none" strokeLinecap="round" />
          </svg>
          <Box>
            <Box sx={{ fontWeight: 900, fontSize: 15, letterSpacing: 1.5, color: "#1a1a2e", lineHeight: 1 }}>
              TRADE<Box component="span" sx={{ color: "primary.main" }}>Z</Box>
            </Box>
            <Small sx={{ fontSize: 8, letterSpacing: 2, color: "text.disabled", textTransform: "uppercase", display: "block" }}>
              Vendor Portal
            </Small>
          </Box>
        </FlexBox>

        {/* Right — user info + sign out */}
        <FlexBox alignItems="center" gap={1.5}>
          {/* Avatar + name — hidden on mobile */}
          <FlexBox alignItems="center" gap={1} sx={{ display: { xs: "none", sm: "flex" } }}>
            <Avatar
              src={userImage}
              alt={userName}
              sx={{
                width: 32, height: 32,
                border: "2px solid", borderColor: "primary.main",
                fontSize: 13, fontWeight: 800,
                bgcolor: "primary.main", color: "#fff",
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Small fontWeight={700} sx={{ fontSize: 12.5, display: "block", lineHeight: 1.2, color: "text.primary" }}>
                {userName}
              </Small>
              <Small sx={{ fontSize: 10.5, color: "text.disabled", display: "block" }}>
                {userEmail}
              </Small>
            </Box>
          </FlexBox>

          {/* Vertical divider */}
          <Box sx={{ width: "1px", height: 28, bgcolor: "divider", display: { xs: "none", sm: "block" } }} />

          {/* Sign Out button */}
          <Tooltip title="Sign out of your account">
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon sx={{ fontSize: "15px !important" }} />}
              onClick={() => signOut({ callbackUrl: "/login" })}
              sx={{
                fontWeight: 700,
                fontSize: 12,
                textTransform: "none",
                borderColor: "divider",
                color: "text.secondary",
                borderRadius: 2,
                px: 1.5,
                py: 0.6,
                "&:hover": {
                  borderColor: "error.main",
                  color: "error.main",
                  bgcolor: "rgba(220,38,38,0.04)",
                },
              }}
            >
              Sign Out
            </Button>
          </Tooltip>
        </FlexBox>
      </Box>
    </Box>
  );
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
      <FlexBox alignItems="flex-start" gap={1.5} mb={1.5}>
        <Avatar
          src={proxyLogo(storeLogo)}
          variant="rounded"
          imgProps={{ onError: (e: any) => { e.target.style.display = "none"; } }}
          sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor: "grey.100", border: "1px solid", borderColor: "divider", flexShrink: 0,
          }}
        >
          <StorefrontIcon sx={{ fontSize: 22, color: "text.disabled" }} />
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Small
            fontWeight={800} color="text.disabled"
            sx={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".5px", display: "block", mb: 0.3 }}
          >
            {storeCode}
          </Small>
          <H6
            fontWeight={900}
            sx={{ fontSize: 14, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {storeName || "—"}
          </H6>
          {storeDescription && (
            <Small
              color="text.secondary"
              sx={{ fontSize: 11, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {storeDescription}
            </Small>
          )}
        </Box>
      </FlexBox>

      <Box sx={{ height: "1px", bgcolor: "divider", mx: -0.5, mb: 1.5 }} />

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
            fontWeight: 800, fontSize: 10.5, height: 22,
            "& .MuiChip-label": { px: 0.75 },
            "& .MuiChip-icon": { ml: 0.5 },
          }}
        />
      </FlexBetween>

      <Chip
        label="Manage →"
        size="small"
        color="primary"
        sx={{
          mt: 1.5, width: "100%", fontWeight: 800, fontSize: 11,
          height: 26, borderRadius: 1.5, cursor: "pointer",
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
  const { status } = useSession();
  const { data, isLoading, isError } = useGetStoresQuery();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  const stores        = data?.stores       ?? [];
  const totalProducts = data?.totalProducts ?? 0;
  const totalStores   = data?.totalStores   ?? stores.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── Sticky navbar with TRADEZ brand + user info + sign out ── */}
      <TopNavBar />

      {/* ── Page content ── */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>

        {/* Page heading */}
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

        {/* Error state */}
        {isError && (
          <Card sx={{ p: 4, borderRadius: 3, border: "1.5px solid", borderColor: "error.main", boxShadow: "none", textAlign: "center" }}>
            <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
            <H6 fontWeight={800} mb={0.5}>Failed to load stores</H6>
            <Paragraph color="text.secondary" fontSize={13}>
              Could not reach the API. Please check your network connection and try again.
            </Paragraph>
          </Card>
        )}

        {/* Store grid */}
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
    </Box>
  );
}