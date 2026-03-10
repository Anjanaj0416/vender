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
// ── NEW imports ──────────────────────────────────────────────────────────────
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

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

// ─── NEW: Sales data ──────────────────────────────────────────────────────────

interface SalesRecord {
  date: string;
  totalSales: number;
  orders: number;
  unitsSold: number;
}

const SALES_DATA: SalesRecord[] = [
  { date: "01/03/2025", totalSales: 5000, orders: 120, unitsSold: 150 },
  { date: "02/03/2025", totalSales: 4200, orders: 100, unitsSold: 130 },
  { date: "03/03/2025", totalSales: 6800, orders: 165, unitsSold: 210 },
  { date: "04/03/2025", totalSales: 3900, orders: 88,  unitsSold: 105 },
  { date: "05/03/2025", totalSales: 7200, orders: 182, unitsSold: 240 },
  { date: "06/03/2025", totalSales: 5500, orders: 134, unitsSold: 175 },
  { date: "07/03/2025", totalSales: 4800, orders: 115, unitsSold: 148 },
];

// ─── NEW: Sales Performance Modal ─────────────────────────────────────────────

function SalesPerformanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const totalRevenue = SALES_DATA.reduce((s, r) => s + r.totalSales, 0);
  const totalOrders  = SALES_DATA.reduce((s, r) => s + r.orders, 0);
  const totalUnits   = SALES_DATA.reduce((s, r) => s + r.unitsSold, 0);
  const bestDay      = SALES_DATA.reduce((best, r) => r.totalSales > best.totalSales ? r : best, SALES_DATA[0]);
  const now          = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleDownloadPdf = () => {
    const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sales Performance Full Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .title { font-size: 26px; font-weight: 800; color: #1a1a1a; }
    .period { font-size: 13px; color: #666; margin-top: 6px; }
    .badge { background: #fff0f0; color: #c0392b; border: 1.5px solid #c0392b; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 700; white-space: nowrap; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .kpi-card { border: 1.5px solid #e8e8e8; border-radius: 12px; padding: 18px; }
    .kpi-label { font-size: 12px; color: #888; margin-bottom: 8px; }
    .kpi-value { font-size: 26px; font-weight: 800; color: #c0392b; margin-bottom: 4px; }
    .kpi-sub { font-size: 11px; color: #aaa; }
    .section-title { font-size: 17px; font-weight: 800; color: #c0392b; margin-bottom: 12px; }
    .summary-box { border: 1.5px solid #e8e8e8; border-radius: 10px; padding: 16px; margin-bottom: 28px; font-size: 13px; color: #444; line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; }
    thead tr { background: #fff0f0; }
    thead th { padding: 14px 20px; text-align: left; font-size: 13px; font-weight: 800; color: #c0392b; border-bottom: 2px solid #fad4d4; }
    tbody tr { border-bottom: 1px solid #f5f5f5; }
    tbody tr:nth-child(even) { background: #fafafa; }
    td { padding: 14px 20px; font-size: 13px; color: #333; }
    .td-sales { color: #c0392b; font-weight: 700; }
    .badge-orders { background: #e8f0fe; color: #2563eb; border-radius: 20px; padding: 4px 14px; font-weight: 700; font-size: 12px; display: inline-block; }
    .badge-units  { background: #e6f9f0; color: #16a34a; border-radius: 20px; padding: 4px 14px; font-weight: 700; font-size: 12px; display: inline-block; }
    @media print { body { padding: 20px; } @page { margin: 15mm; size: A4; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Sales Performance Full Report</div>
      <div class="period">Period: ${SALES_DATA[0].date} - ${SALES_DATA[SALES_DATA.length - 1].date}</div>
      <div class="period">Generated: Today at ${now}</div>
    </div>
    <div class="badge">${SALES_DATA.length} Daily Records</div>
  </div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Revenue</div>
      <div class="kpi-value">$${totalRevenue.toLocaleString()}</div>
      <div class="kpi-sub">Combined sales for ${SALES_DATA.length} days</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Orders</div>
      <div class="kpi-value">${totalOrders.toLocaleString()}</div>
      <div class="kpi-sub">All completed and pending sales</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Units Sold</div>
      <div class="kpi-value">${totalUnits.toLocaleString()}</div>
      <div class="kpi-sub">Across all tracked products</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Best Sales Day</div>
      <div class="kpi-value">${bestDay.date.slice(0, 5)}</div>
      <div class="kpi-sub">$${bestDay.totalSales.toLocaleString()} highest revenue</div>
    </div>
  </div>
  <div class="section-title">Performance Summary</div>
  <div class="summary-box">
    The sales trend shows a strong mid-week increase, with the highest performance recorded on ${bestDay.date}.
    Order count and units sold remained healthy across the reporting period, which suggests stable customer demand.
    This layout is useful when you want to export a professional PDF report for management, store owners, or finance review.
  </div>
  <div class="section-title">Daily Sales Table</div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Total Sales</th><th>Orders</th><th>Units Sold</th>
      </tr>
    </thead>
    <tbody>
      ${SALES_DATA.map(row => `
      <tr>
        <td>${row.date}</td>
        <td class="td-sales">$${row.totalSales.toLocaleString()}</td>
        <td><span class="badge-orders">${row.orders}</span></td>
        <td><span class="badge-units">${row.unitsSold}</span></td>
      </tr>`).join("")}
    </tbody>
  </table>
</body>
</html>`;
    const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(printContent);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95vw", sm: "90vw", md: 800 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
          outline: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ px: 4, pt: 3.5, pb: 2 }}>
          <FlexBetween alignItems="flex-start">
            <Box>
              <H3 fontWeight={900} sx={{ fontSize: 22 }}>Sales Performance Full Report</H3>
              <Small color="text.disabled" sx={{ display: "block", mt: 0.5, fontSize: 12 }}>
                Period: {SALES_DATA[0].date} - {SALES_DATA[SALES_DATA.length - 1].date}
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Generated: Today at {now}
              </Small>
            </Box>
            <FlexBox alignItems="center" gap={1.5}>
              <Chip
                label={`${SALES_DATA.length} Daily Records`}
                sx={{
                  bgcolor: "#fff0f0",
                  color: "#c0392b",
                  border: "1.5px solid #c0392b",
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: "20px",
                  height: 32,
                }}
              />
              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  border: "1.5px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  color: "text.secondary",
                  "&:hover": { borderColor: "error.main", color: "error.main" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </FlexBox>
          </FlexBetween>
        </Box>

        <Divider />

        {/* ── Scrollable body ── */}
        <Box sx={{ overflowY: "auto", flex: 1, px: 4, py: 3 }}>

          {/* KPI summary cards */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: "Total Revenue",  value: `$${totalRevenue.toLocaleString()}`, sub: `Combined sales for ${SALES_DATA.length} days` },
              { label: "Total Orders",   value: totalOrders.toLocaleString(),         sub: "All completed and pending sales" },
              { label: "Units Sold",     value: totalUnits.toLocaleString(),          sub: "Across all tracked products" },
              { label: "Best Sales Day", value: bestDay.date.slice(0, 5),             sub: `$${bestDay.totalSales.toLocaleString()} highest revenue` },
            ].map(({ label, value, sub }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
                  <Small color="text.secondary" sx={{ fontSize: 11, fontWeight: 600, display: "block", mb: 0.75 }}>
                    {label}
                  </Small>
                  <Box sx={{ fontSize: 22, fontWeight: 900, color: "#c0392b", lineHeight: 1.1, mb: 0.5 }}>
                    {value}
                  </Box>
                  <Small color="text.disabled" sx={{ fontSize: 11 }}>{sub}</Small>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Performance Summary */}
          <Box mb={3}>
            <H6 fontWeight={800} sx={{ color: "#c0392b", mb: 1.5, fontSize: 15 }}>Performance Summary</H6>
            <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
              <Paragraph color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.75 }}>
                The sales trend shows a strong mid-week increase, with the highest performance recorded on{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{bestDay.date}</Box>.
                Order count and units sold remained healthy across the reporting period, which suggests stable
                customer demand. This layout is useful when you want to export a professional PDF report for
                management, store owners, or finance review.
              </Paragraph>
            </Card>
          </Box>

          {/* Daily Sales Table */}
          <Box>
            <H6 fontWeight={800} sx={{ mb: 1.5, fontSize: 15 }}>Daily Sales Table</H6>
            <Card sx={{ borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", overflow: "hidden" }}>
              {/* Table header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr",
                  bgcolor: "#fff5f5",
                  px: 2.5,
                  py: 1.5,
                  borderBottom: "2px solid rgba(192,57,43,0.12)",
                }}
              >
                {["Date", "Total Sales", "Orders", "Units Sold"].map((col) => (
                  <Box key={col} sx={{ fontSize: 13, fontWeight: 800, color: "#c0392b" }}>{col}</Box>
                ))}
              </Box>

              {/* Table rows */}
              {SALES_DATA.map((row, i) => (
                <Box
                  key={row.date}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr",
                    px: 2.5,
                    py: 1.75,
                    bgcolor: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.015)",
                    borderBottom: i < SALES_DATA.length - 1 ? "1px solid #f0f0f0" : "none",
                    alignItems: "center",
                    "&:hover": { bgcolor: "#fff8f8" },
                  }}
                >
                  <Small sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>{row.date}</Small>
                  <Small sx={{ fontSize: 13, fontWeight: 700, color: "#c0392b" }}>
                    ${row.totalSales.toLocaleString()}
                  </Small>
                  <Box>
                    <Box component="span" sx={{ bgcolor: "rgba(37,99,235,0.10)", color: "#2563eb", borderRadius: "20px", px: 1.5, py: 0.4, fontSize: 12, fontWeight: 700 }}>
                      {row.orders}
                    </Box>
                  </Box>
                  <Box>
                    <Box component="span" sx={{ bgcolor: "rgba(22,163,74,0.10)", color: "#16a34a", borderRadius: "20px", px: 1.5, py: 0.4, fontSize: 12, fontWeight: 700 }}>
                      {row.unitsSold}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Card>
          </Box>
        </Box>

        {/* ── Footer ── */}
        <Divider />
        <Box sx={{ px: 4, py: 2, display: "flex", gap: 1.5, bgcolor: "background.paper" }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            sx={{
              bgcolor: "#c0392b",
              "&:hover": { bgcolor: "#96281b" },
              borderRadius: 2,
              fontWeight: 800,
              fontSize: 13,
              textTransform: "none",
              px: 2.5,
              boxShadow: "0 4px 14px rgba(192,57,43,0.30)",
            }}
          >
            Download as PDF
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "divider",
              color: "text.secondary",
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 13,
              textTransform: "none",
              px: 2.5,
              "&:hover": { borderColor: "#c0392b", color: "#c0392b", bgcolor: "rgba(192,57,43,0.04)" },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
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
  { key: "pendingOrders",  label: "Pending Orders",  Icon: PendingActionsIcon,   color: "#d97706", bgColor: "rgba(217,119,6,0.08)",  format: "count",    highlight: "warning" },
  { key: "lowStockItems",  label: "Low Stock Items", Icon: InventoryIcon,        color: "#dc2626", bgColor: "rgba(220,38,38,0.08)",  format: "count",    highlight: "danger" },
  { key: "totalCustomers", label: "Total Customers", Icon: PeopleIcon,           color: "#0891b2", bgColor: "rgba(8,145,178,0.08)",  format: "count" },
  { key: "totalRefunds",   label: "Total Refunds",   Icon: AssignmentReturnIcon, color: "#9f1239", bgColor: "rgba(159,18,57,0.08)",  format: "count",    highlight: "warning" },
];

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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [stats, setStats]               = useState<DashboardStats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  // ── NEW ──
  const [salesModalOpen, setSalesModalOpen] = useState(false);

  const vendorId = (session as any)?.vendorId ?? "";

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

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

      {/* ── NEW: Sales Modal ── */}
      <SalesPerformanceModal open={salesModalOpen} onClose={() => setSalesModalOpen(false)} />

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>

        {/* Page Header */}
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
              sx={{ bgcolor: "primary.main", borderRadius: 6, fontWeight: 800, fontSize: 13, textTransform: "none", px: 2.5, boxShadow: "0 4px 14px rgba(192,57,43,0.30)", "&:hover": { bgcolor: "#96281b" } }}
            >
              Manage Stores
            </Button>
          </FlexBox>
        </FlexBetween>

        {/* Error banner */}
        {error && (
          <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: "1.5px solid", borderColor: "error.main", boxShadow: "none", bgcolor: "rgba(220,38,38,0.03)" }}>
            <FlexBox alignItems="center" gap={1.5}>
              <WarningAmberIcon sx={{ color: "error.main", fontSize: 18 }} />
              <Small fontWeight={700} color="error.main">{error}</Small>
              <Button size="small" onClick={fetchDashboard} sx={{ ml: "auto", fontWeight: 800, fontSize: 11.5, textTransform: "none" }}>Retry</Button>
            </FlexBox>
          </Card>
        )}

        {/* KPI Cards */}
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
                    // ── NEW: only Total Sales opens the modal ──
                    onClick={config.key === "totalSales" ? () => setSalesModalOpen(true) : undefined}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Actions */}
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