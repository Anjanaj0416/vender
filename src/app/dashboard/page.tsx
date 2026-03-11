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

// ── Modal imports ─────────────────────────────────────────────────────────────
import SalesReportModal         from "components/SalesReportModal";
import OrderReportModal         from "components/OrderReportModal";
import InventoryReportModal     from "components/InventoryReportModal";
import PendingOrdersReportModal from "components/PendingOrdersReportModal";
import CustomersReportModal     from "components/CustomersReportModal";

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
  { key: "totalSales",     label: "Total Sales",     Icon: TrendingUpIcon,       color: "#c0392b", bgColor: "rgba(192,57,43,0.08)",  format: "number" },
  { key: "totalOrders",    label: "Total Orders",    Icon: ShoppingCartIcon,     color: "#2563eb", bgColor: "rgba(37,99,235,0.08)",  format: "count" },
  { key: "totalRevenue",   label: "Total Revenue",   Icon: AttachMoneyIcon,      color: "#16a34a", bgColor: "rgba(22,163,74,0.08)",  format: "currency" },
  { key: "totalStores",    label: "Total Stores",    Icon: StorefrontIcon,       color: "#7c3aed", bgColor: "rgba(124,58,237,0.08)", format: "count" },
  { key: "pendingOrders",  label: "Pending Orders",  Icon: PendingActionsIcon,   color: "#d97706", bgColor: "rgba(217,119,6,0.08)",  format: "count", highlight: "warning" },
  { key: "lowStockItems",  label: "Low Stock Items", Icon: InventoryIcon,        color: "#dc2626", bgColor: "rgba(220,38,38,0.08)",  format: "count", highlight: "danger" },
  { key: "totalCustomers", label: "Total Customers", Icon: PeopleIcon,           color: "#0891b2", bgColor: "rgba(8,145,178,0.08)",  format: "count" },
  { key: "totalRefunds",   label: "Total Refunds",   Icon: AssignmentReturnIcon, color: "#9f1239", bgColor: "rgba(159,18,57,0.08)",  format: "count", highlight: "warning" },
];

// ─── Format value ─────────────────────────────────────────────────────────────

function formatValue(value: number, format: KpiConfig["format"]): string {
  if (format === "currency") {
    if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `LKR ${(value / 1_000).toFixed(1)}K`;
    return `LKR ${value.toLocaleString("en-LK")}`;
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-LK");
}

// ─── Top Navigation Bar ───────────────────────────────────────────────────────

function TopNavBar() {
  const { data: session } = useSession();
  const router    = useRouter();
  const userName  = session?.user?.name  ?? "";
  const userImage = session?.user?.image ?? "";

  return (
    <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", position: "sticky", top: 0, zIndex: 100 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 1.5 }}>
        <FlexBetween>
          <FlexBox alignItems="center" gap={1}>
            <Box
              component="img"
              src="/assets/images/tradez-logo.png"
              alt="TradeZ"
              sx={{ height: 32, cursor: "pointer" }}
              onClick={() => router.push("/dashboard")}
              onError={(e: any) => { e.target.style.display = "none"; }}
            />
          </FlexBox>
          <FlexBox alignItems="center" gap={2}>
            <Avatar src={userImage} alt={userName} sx={{ width: 34, height: 34, border: "2px solid", borderColor: "primary.main" }} />
            <Box>
              <Small fontWeight={800} color="text.primary" sx={{ fontSize: 13, display: "block" }}>{userName || "Vendor"}</Small>
              <Small color="text.disabled" sx={{ fontSize: 10.5, display: "block" }}>Vendor Portal</Small>
            </Box>
            <Tooltip title="Sign out">
              <IconButton
                onClick={() => signOut({ callbackUrl: "/login" })}
                size="small"
                sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 2, color: "text.secondary", "&:hover": { borderColor: "error.main", color: "error.main", bgcolor: "rgba(220,38,38,0.04)" } }}
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </FlexBox>
        </FlexBetween>
      </Box>
    </Box>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  config: KpiConfig;
  value: number;
  loading: boolean;
  onClick?: () => void;
}

function KpiCard({ config, value, loading, onClick }: KpiCardProps) {
  const { label, Icon, color, bgColor, format, highlight } = config;
  const isAlert   = highlight === "danger"  && value > 0;
  const isWarning = highlight === "warning" && value > 0;

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5, borderRadius: 3, border: "1.5px solid",
        borderColor: isAlert ? "rgba(220,38,38,0.25)" : isWarning ? "rgba(217,119,6,0.20)" : "divider",
        boxShadow: isAlert ? "0 4px 16px rgba(220,38,38,0.08)" : isWarning ? "0 4px 16px rgba(217,119,6,0.06)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.10)", transform: "translateY(-1px)" },
        position: "relative", overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", bgcolor: bgColor, pointerEvents: "none" }} />
      <FlexBetween mb={1.5}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 22, color }} />
        </Box>
        {(isAlert || isWarning) && value > 0 && (
          <WarningAmberIcon sx={{ fontSize: 16, color: isAlert ? "error.main" : "warning.main", opacity: 0.8 }} />
        )}
      </FlexBetween>
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" height={36} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={18} />
        </>
      ) : (
        <>
          <Box sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900, color: isAlert ? "error.main" : isWarning && value > 0 ? "warning.main" : "text.primary", lineHeight: 1.1, mb: 0.5, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
            {formatValue(value, format)}
          </Box>
          <Small fontWeight={700} color="text.secondary" sx={{ fontSize: 12 }}>{label}</Small>
        </>
      )}
    </Card>
  );
}

// ─── KPI Skeleton ─────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
      <FlexBetween mb={1.5}><Skeleton variant="rounded" width={42} height={42} /></FlexBetween>
      <Skeleton variant="text" width="55%" height={36} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="75%" height={18} />
    </Card>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

const SAMPLE_STORES = [
  { storeUuid: "store-001", storeName: "Downtown Store" },
  { storeUuid: "store-002", storeName: "Mall Branch" },
  { storeUuid: "store-003", storeName: "Westside Outlet" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [stats,         setStats]         = useState<DashboardStats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [stores,        setStores]        = useState<{ storeUuid: string; storeName: string }[]>(SAMPLE_STORES);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [salesModalOpen,     setSalesModalOpen]     = useState(false);
  const [orderModalOpen,     setOrderModalOpen]     = useState(false);
  // inventoryFilter: "All" → opened from totalStores, "Y" → opened from lowStockItems
  const [inventoryModalOpen,     setInventoryModalOpen]     = useState(false);
  const [inventoryFilter,        setInventoryFilter]        = useState<"All" | "Y">("All");
  const [pendingOrdersModalOpen, setPendingOrdersModalOpen] = useState(false);
  const [customersModalOpen,     setCustomersModalOpen]     = useState(false);

  const vendorId = (session as any)?.vendorId ?? "";

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  // ── Fetch stores list ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!vendorId) return;
    fetch(`/api/tradez/stores?vendorId=${vendorId}`)
      .then(r => r.json())
      .then(data => {
        const list = data.stores ?? [];
        if (list.length > 0) {
          setStores(list.map((s: any) => ({ storeUuid: s.storeUuid ?? s.storeName, storeName: s.storeName })));
        } else {
          setStores(SAMPLE_STORES);
        }
      })
      .catch(() => { setStores(SAMPLE_STORES); });
  }, [vendorId]);

  // ── Fetch dashboard stats ─────────────────────────────────────────────────
  const fetchDashboard = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/tradez/dashboard?vendorId=${vendorId}`);
      const json = await res.json();
      console.log("[dashboard] raw json =", JSON.stringify(json?.data));
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

  // ── Helper: open inventory modal with correct filter ──────────────────────
  const openInventory = (filter: "All" | "Y") => {
    setInventoryFilter(filter);
    setInventoryModalOpen(true);
  };

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

      {/* ── Modals ── */}
      <SalesReportModal  open={salesModalOpen}  onClose={() => setSalesModalOpen(false)} stores={stores} />
      <OrderReportModal  open={orderModalOpen}  onClose={() => setOrderModalOpen(false)} stores={stores} />
      <InventoryReportModal
        open={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        defaultFilter={inventoryFilter}
        stores={stores}
      />
      <PendingOrdersReportModal
        open={pendingOrdersModalOpen}
        onClose={() => setPendingOrdersModalOpen(false)}
        stores={stores}
      />
      <CustomersReportModal
        open={customersModalOpen}
        onClose={() => setCustomersModalOpen(false)}
        stores={stores}
      />

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>

        {/* ── Page Header ── */}
        <FlexBetween mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <FlexBox alignItems="center" gap={1.5} mb={0.75}>
              <DashboardIcon sx={{ fontSize: 26, color: "primary.main" }} />
              <H3 fontWeight={900}>Dashboard</H3>
            </FlexBox>
            <Paragraph color="text.secondary" fontWeight={600}>
              Welcome back,{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>{userName.split(" ")[0]}</Box>
              {" "}— here's your business overview.
            </Paragraph>
          </Box>
          <FlexBox alignItems="center" gap={1.5}>
            {lastRefreshed && (
              <Small color="text.disabled" sx={{ fontSize: 11 }}>
                Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Small>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDashboard} disabled={loading} size="small" sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 2 }}>
                <RefreshIcon fontSize="small" sx={{ color: loading ? "text.disabled" : "text.secondary" }} />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/stores")}
              sx={{ bgcolor: "primary.main", borderRadius: 6, fontWeight: 800, fontSize: 13, textTransform: "none", px: 2.5, boxShadow: "0 4px 14px rgba(192,57,43,0.30)", "&:hover": { bgcolor: "#96281b", boxShadow: "0 6px 20px rgba(192,57,43,0.40)" } }}
            >
              Manage Stores
            </Button>
          </FlexBox>
        </FlexBetween>

        {/* ── Error banner ── */}
        {error && (
          <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: "1.5px solid", borderColor: "error.main", boxShadow: "none", bgcolor: "rgba(220,38,38,0.03)" }}>
            <FlexBox alignItems="center" gap={1.5}>
              <WarningAmberIcon sx={{ color: "error.main", fontSize: 18 }} />
              <Small fontWeight={700} color="error.main">{error}</Small>
              <Button size="small" onClick={fetchDashboard} sx={{ ml: "auto", fontWeight: 800, fontSize: 11.5, textTransform: "none" }}>Retry</Button>
            </FlexBox>
          </Card>
        )}

        {/* ── KPI Cards ── */}
        <Box mb={4}>
          <FlexBox alignItems="center" gap={1} mb={2.5}>
            <Small fontWeight={800} color="text.disabled" sx={{ textTransform: "uppercase", letterSpacing: "0.8px", fontSize: 11 }}>
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
                    onClick={
                      config.key === "totalSales"
                        ? () => setSalesModalOpen(true)
                        : config.key === "totalOrders"
                        ? () => setOrderModalOpen(true)
                        : config.key === "totalStores"
                        ? () => openInventory("All")
                        : config.key === "lowStockItems"
                        ? () => openInventory("Y")
                        : config.key === "pendingOrders"
                        ? () => setPendingOrdersModalOpen(true)
                        : config.key === "totalCustomers"
                        ? () => setCustomersModalOpen(true)
                        : undefined
                    }
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Quick Actions ── */}
        <Box>
          <FlexBox alignItems="center" gap={1} mb={2.5}>
            <Small fontWeight={800} color="text.disabled" sx={{ textTransform: "uppercase", letterSpacing: "0.8px", fontSize: 11 }}>
              Quick Actions
            </Small>
            <Divider sx={{ flex: 1 }} />
          </FlexBox>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                onClick={() => router.push("/stores")}
                sx={{ p: 3, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", cursor: "pointer", transition: "all 0.2s ease", "&:hover": { borderColor: "primary.main", boxShadow: "0 4px 16px rgba(192,57,43,0.12)", transform: "translateY(-2px)" } }}
              >
                <FlexBox alignItems="center" gap={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "rgba(192,57,43,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <StorefrontIcon sx={{ fontSize: 24, color: "primary.main" }} />
                  </Box>
                  <Box>
                    <Small fontWeight={800} color="text.primary" sx={{ fontSize: 14, display: "block" }}>My Stores</Small>
                    <Small color="text.disabled" sx={{ fontSize: 12 }}>Manage products, stock &amp; pricing</Small>
                  </Box>
                  <ArrowForwardIcon sx={{ ml: "auto", fontSize: 18, color: "text.disabled" }} />
                </FlexBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", opacity: 0.6 }}>
                <FlexBox alignItems="center" gap={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShoppingCartIcon sx={{ fontSize: 24, color: "#2563eb" }} />
                  </Box>
                  <Box>
                    <FlexBox alignItems="center" gap={1}>
                      <Small fontWeight={800} color="text.primary" sx={{ fontSize: 14 }}>Orders</Small>
                      <Chip label="Soon" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 800, bgcolor: "rgba(22,163,74,0.10)", color: "#16a34a" }} />
                    </FlexBox>
                    <Small color="text.disabled" sx={{ fontSize: 12 }}>Track and manage orders</Small>
                  </Box>
                </FlexBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", opacity: 0.6 }}>
                <FlexBox alignItems="center" gap={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "rgba(8,145,178,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PeopleIcon sx={{ fontSize: 24, color: "#0891b2" }} />
                  </Box>
                  <Box>
                    <FlexBox alignItems="center" gap={1}>
                      <Small fontWeight={800} color="text.primary" sx={{ fontSize: 14 }}>Customers</Small>
                      <Chip label="Soon" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 800, bgcolor: "rgba(22,163,74,0.10)", color: "#16a34a" }} />
                    </FlexBox>
                    <Small color="text.disabled" sx={{ fontSize: 12 }}>View customer insights</Small>
                  </Box>
                </FlexBox>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}