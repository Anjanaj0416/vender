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
import IconButton from "@mui/material/IconButton";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { H3, H6, Paragraph, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { useGetStoresQuery, StoreInfo } from "services/vendor-api";

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
  PUBLISHED:   { label: "Published",   color: "success", Icon: CheckCircleOutlineIcon },
  UNPUBLISHED: { label: "Unpublished", color: "error",   Icon: PauseCircleOutlineIcon },
  APPROVED:    { label: "Approved",    color: "warning", Icon: HourglassTopIcon       },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, color: "default", Icon: StorefrontIcon };
}

// ─── Top Navigation Bar ───────────────────────────────────────────────────────
function TopNavBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName  = session?.user?.name  ?? "";
  const userImage = session?.user?.image ?? undefined;

  return (
    <Box
      sx={{
        position: "sticky", top: 0, zIndex: 100,
        bgcolor: "#ffffff",
        borderBottom: "1px solid", borderColor: "divider",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1100, mx: "auto",
          px: { xs: 2, md: 4 }, py: 1.25,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
        }}
      >
        {/* Left — TRADEZ brand */}
        <img
          src="/tradez-logo-horizontal.png"
          alt="TradeZ Vendor Portal"
          style={{
            height: "180px", width: "auto",
            mixBlendMode: "multiply",
            marginTop: "-70px", marginBottom: "-70px",
          }}
        />

        {/* Center — nav */}
        {/*<FlexBox alignItems="center" gap={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
          <Button
            startIcon={<DashboardIcon sx={{ fontSize: 16 }} />}
            onClick={() => router.push("/dashboard")}
            sx={{
              fontWeight: 700, fontSize: 12.5, color: "text.secondary",
              borderRadius: 2, px: 2, py: 0.75, textTransform: "none",
              "&:hover": { bgcolor: "grey.100", color: "text.primary" },
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<StorefrontIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 800, fontSize: 12.5, color: "primary.main",
              bgcolor: "rgba(192,57,43,0.06)",
              borderRadius: 2, px: 2, py: 0.75, textTransform: "none",
              "&:hover": { bgcolor: "rgba(192,57,43,0.12)" },
            }}
          >
            My Stores
          </Button>
        </FlexBox>*/}

        {/* Right */}
        <FlexBox alignItems="center" gap={1.5}>
          <FlexBox alignItems="center" gap={1} sx={{ display: { xs: "none", sm: "flex" } }}>
            <Avatar
              src={userImage} alt={userName}
              sx={{
                width: 32, height: 32,
                border: "2px solid", borderColor: "primary.main",
                fontSize: 13, fontWeight: 800,
                bgcolor: "primary.main", color: "#fff",
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Small fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
                {userName || "Vendor"}
              </Small>
              <Small color="text.disabled" sx={{ fontSize: 10.5, display: "block" }}>
                Vendor Portal
              </Small>
            </Box>
          </FlexBox>

          <Tooltip title="Sign out">
            <IconButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              size="small"
              sx={{
                border: "1.5px solid", borderColor: "divider", borderRadius: 2,
                color: "text.secondary",
                "&:hover": { borderColor: "error.main", color: "error.main", bgcolor: "rgba(220,38,38,0.04)" },
              }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </FlexBox>
      </Box>
    </Box>
  );
}

// ─── Store Card  (original design — unchanged) ────────────────────────────────
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

// ─── Skeleton (original design — unchanged) ───────────────────────────────────
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
export default function StoresPage() {
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

  const stores        = data?.stores        ?? [];
  const totalProducts = data?.totalProducts ?? 0;
  const totalStores   = data?.totalStores   ?? stores.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopNavBar />

      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 5 }}>

        {/* ── Back to Dashboard ── */}
        <FlexBox alignItems="center" gap={1} mb={3.5}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              onClick={() => router.push("/dashboard")}
              size="small"
              sx={{
                border: "1.5px solid", borderColor: "divider", borderRadius: 2,
                "&:hover": { borderColor: "primary.main", color: "primary.main" },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Small fontWeight={700} color="text.disabled">Back to Dashboard</Small>
        </FlexBox>

        {/* ── Page heading ── */}
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

        {/* ── Error state ── */}
        {isError && (
          <Card sx={{ p: 4, borderRadius: 3, border: "1.5px solid", borderColor: "error.main", boxShadow: "none", textAlign: "center" }}>
            <ErrorOutlineIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
            <H6 fontWeight={800} mb={0.5}>Failed to load stores</H6>
            <Paragraph color="text.secondary" fontSize={13}>
              Could not reach the API. Please check your network connection and try again.
            </Paragraph>
          </Card>
        )}

        {/* ── Store grid ── */}
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