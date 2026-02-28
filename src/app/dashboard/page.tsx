"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";

// MUI Icons
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { H3, H6, Paragraph, Small, Span } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  totalStores: number;
  pendingOrders: number;
  lowStockItems: number;
  totalCustomers: number;
  totalRefunds: number;
}

// ─── KPI card config ──────────────────────────────────────────────────────────

interface KpiConfig {
  key: keyof DashboardStats;
  label: string;
  Icon: any;
  color: string;
  bgColor: string;
  format: "number" | "currency" | "count";
  highlight?: "warning" | "danger";
}

const KPI_CARDS: KpiConfig[] = [
  {
    key: "totalSales",
    label: "Total Sales",
    Icon: TrendingUpIcon,
    color: "#c0392b",
    bgColor: "rgba(192,57,43,0.08)",
    format: "number",
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    Icon: ShoppingCartIcon,
    color: "#2563eb",
    bgColor: "rgba(37,99,235,0.08)",
    format: "count",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    Icon: AttachMoneyIcon,
    color: "#16a34a",
    bgColor: "rgba(22,163,74,0.08)",
    format: "currency",
  },
  {
    key: "totalStores",
    label: "Total Stores",
    Icon: StorefrontIcon,
    color: "#7c3aed",
    bgColor: "rgba(124,58,237,0.08)",
    format: "count",
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    Icon: PendingActionsIcon,
    color: "#d97706",
    bgColor: "rgba(217,119,6,0.08)",
    format: "count",
    highlight: "warning",
  },
  {
    key: "lowStockItems",
    label: "Low Stock Items",
    Icon: InventoryIcon,
    color: "#dc2626",
    bgColor: "rgba(220,38,38,0.08)",
    format: "count",
    highlight: "danger",
  },
  {
    key: "totalCustomers",
    label: "Total Customers",
    Icon: PeopleIcon,
    color: "#0891b2",
    bgColor: "rgba(8,145,178,0.08)",
    format: "count",
  },
  {
    key: "totalRefunds",
    label: "Total Refunds",
    Icon: AssignmentReturnIcon,
    color: "#9f1239",
    bgColor: "rgba(159,18,57,0.08)",
    format: "count",
    highlight: "warning",
  },
];

// ─── Format value ─────────────────────────────────────────────────────────────

function formatValue(value: number, format: KpiConfig["format"]): string {
  if (format === "currency") {
    if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `LKR ${(value / 1_000).toFixed(1)}K`;
    return `LKR ${value.toLocaleString("en-LK")}`;
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-LK");
}

// ─── Top Navigation Bar ───────────────────────────────────────────────────────

function TopNavBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name ?? "";
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
          maxWidth: 1200,
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
        <img
          src="/tradez-logo-horizontal.png"
          alt="TradeZ Vendor Portal"
          style={{
            height: "180px",
            width: "auto",
            mixBlendMode: "multiply",
            marginTop: "-70px",
            marginBottom: "-70px",
          }}
        />

        {/* Center — nav links */}
        {/*<FlexBox alignItems="center" gap={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
          <Button
            startIcon={<DashboardIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 800,
              fontSize: 12.5,
              color: "primary.main",
              bgcolor: "rgba(192,57,43,0.06)",
              borderRadius: 2,
              px: 2,
              py: 0.75,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(192,57,43,0.12)" },
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<StorefrontIcon sx={{ fontSize: 16 }} />}
            onClick={() => router.push("/stores")}
            sx={{
              fontWeight: 700,
              fontSize: 12.5,
              color: "text.secondary",
              borderRadius: 2,
              px: 2,
              py: 0.75,
              textTransform: "none",
              "&:hover": { bgcolor: "grey.100", color: "text.primary" },
            }}
          >
            My Stores
          </Button>
        </FlexBox> */}

        {/* Right — user + sign out */}
        <FlexBox alignItems="center" gap={1.5}>
          <FlexBox alignItems="center" gap={1} sx={{ display: { xs: "none", sm: "flex" } }}>
            <Avatar
              src={userImage}
              alt={userName}
              sx={{
                width: 32,
                height: 32,
                border: "2px solid",
                borderColor: "primary.main",
                fontSize: 13,
                fontWeight: 800,
                bgcolor: "primary.main",
                color: "#fff",
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
                border: "1.5px solid",
                borderColor: "divider",
                borderRadius: 2,
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

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  config: KpiConfig;
  value: number;
  loading: boolean;
}

function KpiCard({ config, value, loading }: KpiCardProps) {
  const { label, Icon, color, bgColor, format, highlight } = config;

  const isAlert = highlight === "danger" && value > 0;
  const isWarning = highlight === "warning" && value > 0;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1.5px solid",
        borderColor: isAlert
          ? "rgba(220,38,38,0.25)"
          : isWarning
          ? "rgba(217,119,6,0.20)"
          : "divider",
        boxShadow: isAlert
          ? "0 4px 16px rgba(220,38,38,0.08)"
          : isWarning
          ? "0 4px 16px rgba(217,119,6,0.06)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
          transform: "translateY(-1px)",
        },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: bgColor,
          pointerEvents: "none",
        }}
      />

      <FlexBetween mb={1.5}>
        {/* Icon */}
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            bgcolor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 22, color }} />
        </Box>

        {/* Alert badge */}
        {(isAlert || isWarning) && value > 0 && (
          <WarningAmberIcon
            sx={{
              fontSize: 16,
              color: isAlert ? "error.main" : "warning.main",
              opacity: 0.8,
            }}
          />
        )}
      </FlexBetween>

      {/* Value */}
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" height={36} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={18} />
        </>
      ) : (
        <>
          <Box
            sx={{
              fontSize: { xs: 20, sm: 24 },
              fontWeight: 900,
              color: isAlert ? "error.main" : isWarning && value > 0 ? "warning.main" : "text.primary",
              lineHeight: 1.1,
              mb: 0.5,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            {formatValue(value, format)}
          </Box>
          <Small fontWeight={700} color="text.secondary" sx={{ fontSize: 12 }}>
            {label}
          </Small>
        </>
      )}
    </Card>
  );
}

// ─── KPI Skeleton ─────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
      <FlexBetween mb={1.5}>
        <Skeleton variant="rounded" width={42} height={42} />
      </FlexBetween>
      <Skeleton variant="text" width="55%" height={36} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="75%" height={18} />
    </Card>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const vendorId = (session as any)?.vendorId ?? "";

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  // ── Fetch dashboard stats ─────────────────────────────────────────────────
  const fetchDashboard = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tradez/dashboard?vendorId=${vendorId}`);
      const json = await res.json();
      console.log("[dashboard] raw json =", JSON.stringify(json?.data));
      // API returns: { data: { count, data: [ { totalSales, ... } ] } }
      // data.data is an ARRAY — take first element
      const dataArray = json?.data?.data;
      const raw = Array.isArray(dataArray) ? (dataArray[0] ?? {}) : (dataArray ?? json?.data ?? {});
      setStats({
        totalSales:     raw.totalSales     ?? 0,
        totalOrders:    raw.totalOrders    ?? 0,
        totalRevenue:   raw.totalRevenue   ?? 0,
        totalStores:    raw.totalStores    ?? 0,
        pendingOrders:  raw.pendingOrders  ?? 0,
        lowStockItems:  raw.lowStockItems  ?? 0,
        totalCustomers: raw.totalCustomers ?? 0,
        totalRefunds:   raw.totalRefunds   ?? 0,
      });
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  // ── Loading / unauth spinner ──────────────────────────────────────────────
  if (authStatus === "loading" || authStatus === "unauthenticated") {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  const userName = session?.user?.name ?? "Vendor";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopNavBar />

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>

        {/* ── Page Header ── */}
        <FlexBetween mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <FlexBox alignItems="center" gap={1.5} mb={0.75}>
              <DashboardIcon sx={{ fontSize: 26, color: "primary.main" }} />
              <H3 fontWeight={900}>Dashboard</H3>
            </FlexBox>
            <Paragraph color="text.secondary" fontWeight={600}>
              Welcome back, <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>{userName.split(" ")[0]}</Box>
              {" "}— here's your business overview.
            </Paragraph>
          </Box>

          <FlexBox alignItems="center" gap={1.5}>
            {lastRefreshed && (
              <Small color="text.disabled" sx={{ fontSize: 11.5 }}>
                Updated {lastRefreshed.toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })}
              </Small>
            )}
            <Tooltip title="Refresh data">
              <IconButton
                onClick={fetchDashboard}
                disabled={loading}
                size="small"
                sx={{
                  border: "1.5px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                }}
              >
                <RefreshIcon sx={{ fontSize: 16, ...(loading && { animation: "spin 1s linear infinite" }) }} />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/stores")}
              sx={{
                fontWeight: 800,
                fontSize: 13,
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                boxShadow: "0 2px 8px rgba(192,57,43,0.25)",
                textTransform: "none",
              }}
            >
              Manage Stores
            </Button>
          </FlexBox>
        </FlexBetween>

        {/* ── Error Banner ── */}
        {error && (
          <Card
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              border: "1.5px solid",
              borderColor: "error.main",
              bgcolor: "rgba(220,38,38,0.04)",
              boxShadow: "none",
            }}
          >
            <FlexBox alignItems="center" gap={1.5}>
              <WarningAmberIcon sx={{ color: "error.main", fontSize: 20 }} />
              <Box>
                <Small fontWeight={800} color="error.main">{error}</Small>
                <Small color="text.secondary" sx={{ display: "block", fontSize: 11.5 }}>
                  Check your network connection or VPN access to the intranet server.
                </Small>
              </Box>
              <Button
                size="small"
                onClick={fetchDashboard}
                sx={{ ml: "auto", fontWeight: 800, fontSize: 11.5, textTransform: "none" }}
              >
                Retry
              </Button>
            </FlexBox>
          </Card>
        )}

        {/* ── KPI Cards Section ── */}
        <Box mb={4}>
          <FlexBox alignItems="center" gap={1} mb={2.5}>
            <Small
              fontWeight={800}
              color="text.disabled"
              sx={{ textTransform: "uppercase", letterSpacing: "0.8px", fontSize: 11 }}
            >
              Key Performance Indicators
            </Small>
            <Divider sx={{ flex: 1 }} />
            {loading && <CircularProgress size={12} sx={{ color: "primary.main" }} />}
          </FlexBox>

          <Grid container spacing={2}>
            {KPI_CARDS.map((config) => (
              <Grid item xs={6} sm={4} md={3} key={config.key}>
                {loading && !stats ? (
                  <KpiSkeleton />
                ) : (
                  <KpiCard
                    config={config}
                    value={stats?.[config.key] ?? 0}
                    loading={loading && !stats}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Quick Actions ── */}
        <Box>
          <FlexBox alignItems="center" gap={1} mb={2.5}>
            <Small
              fontWeight={800}
              color="text.disabled"
              sx={{ textTransform: "uppercase", letterSpacing: "0.8px", fontSize: 11 }}
            >
              Quick Actions
            </Small>
            <Divider sx={{ flex: 1 }} />
          </FlexBox>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                onClick={() => router.push("/stores")}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 16px rgba(192,57,43,0.12)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <FlexBox alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: "rgba(192,57,43,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <StorefrontIcon sx={{ fontSize: 24, color: "primary.main" }} />
                  </Box>
                  <Box>
                    <H6 fontWeight={800} mb={0.25}>My Stores</H6>
                    <Small color="text.secondary" fontWeight={600}>
                      Manage products, stock & pricing
                    </Small>
                  </Box>
                  <ArrowForwardIcon sx={{ ml: "auto", fontSize: 18, color: "text.disabled" }} />
                </FlexBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
                <FlexBox alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: "rgba(37,99,235,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingCartIcon sx={{ fontSize: 24, color: "#2563eb" }} />
                  </Box>
                  <Box>
                    <FlexBox alignItems="center" gap={1}>
                      <H6 fontWeight={800} mb={0}>Orders</H6>
                      <Chip label="Soon" size="small" sx={{ height: 16, fontSize: 9.5, fontWeight: 800 }} />
                    </FlexBox>
                    <Small color="text.secondary" fontWeight={600}>
                      Track and manage orders
                    </Small>
                  </Box>
                </FlexBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  opacity: 0.6,
                  cursor: "not-allowed",
                }}
              >
                <FlexBox alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: "rgba(22,163,74,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 24, color: "#16a34a" }} />
                  </Box>
                  <Box>
                    <FlexBox alignItems="center" gap={1}>
                      <H6 fontWeight={800} mb={0}>Customers</H6>
                      <Chip label="Soon" size="small" sx={{ height: 16, fontSize: 9.5, fontWeight: 800 }} />
                    </FlexBox>
                    <Small color="text.secondary" fontWeight={600}>
                      View customer insights
                    </Small>
                  </Box>
                </FlexBox>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Spin animation for refresh icon */}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Box>
    </Box>
  );
}