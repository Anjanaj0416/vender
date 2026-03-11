"use client";

import { useState, useMemo } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { H3, H6, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";

// ─── Store option type ────────────────────────────────────────────────────────

export interface StoreOption {
  storeUuid: string;
  storeName: string;
}

// ─── Types & data ─────────────────────────────────────────────────────────────

export interface OrderRecord {
  orderId: string;
  orderDate: string;
  deliveryDate: string;
  productQuantity: number;
  orderStatus: "Delivered" | "Pending" | "Cancelled";
  paymentStatus: "Paid" | "Unpaid";
  totalAmount: number;
}

const ORDER_DATA: OrderRecord[] = [
  { orderId: "ORD-1001", orderDate: "2026-03-01", deliveryDate: "2026-03-03", productQuantity: 4,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 12500 },
  { orderId: "ORD-1002", orderDate: "2026-03-01", deliveryDate: "2026-03-04", productQuantity: 2,  orderStatus: "Pending",    paymentStatus: "Unpaid", totalAmount: 7800  },
  { orderId: "ORD-1003", orderDate: "2026-03-02", deliveryDate: "2026-03-05", productQuantity: 7,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 21400 },
  { orderId: "ORD-1004", orderDate: "2026-03-03", deliveryDate: "2026-03-06", productQuantity: 1,  orderStatus: "Cancelled",  paymentStatus: "Unpaid", totalAmount: 3200  },
  { orderId: "ORD-1005", orderDate: "2026-03-04", deliveryDate: "2026-03-07", productQuantity: 5,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 16900 },
  { orderId: "ORD-1006", orderDate: "2026-03-05", deliveryDate: "2026-03-08", productQuantity: 3,  orderStatus: "Pending",    paymentStatus: "Paid",   totalAmount: 9600  },
  { orderId: "ORD-1007", orderDate: "2026-03-06", deliveryDate: "2026-03-09", productQuantity: 6,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 18700 },
  { orderId: "ORD-1008", orderDate: "2026-03-07", deliveryDate: "2026-03-10", productQuantity: 2,  orderStatus: "Cancelled",  paymentStatus: "Unpaid", totalAmount: 4500  },
  { orderId: "ORD-1009", orderDate: "2026-03-08", deliveryDate: "2026-03-11", productQuantity: 9,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 31200 },
  { orderId: "ORD-1010", orderDate: "2026-03-09", deliveryDate: "2026-03-12", productQuantity: 1,  orderStatus: "Pending",    paymentStatus: "Unpaid", totalAmount: 2900  },
  { orderId: "ORD-1011", orderDate: "2026-03-10", deliveryDate: "2026-03-13", productQuantity: 4,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 13600 },
  { orderId: "ORD-1012", orderDate: "2026-03-11", deliveryDate: "2026-03-14", productQuantity: 3,  orderStatus: "Delivered",  paymentStatus: "Paid",   totalAmount: 10200 },
];

const ROWS_PER_PAGE = 6;

const ORDER_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Delivered: { bg: "rgba(22,163,74,0.12)",  color: "#16a34a" },
  Pending:   { bg: "rgba(217,119,6,0.12)",  color: "#d97706" },
  Cancelled: { bg: "rgba(220,38,38,0.12)",  color: "#dc2626" },
};

const PAYMENT_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Paid:   { bg: "rgba(22,163,74,0.12)",  color: "#16a34a" },
  Unpaid: { bg: "rgba(220,38,38,0.12)",  color: "#dc2626" },
};

// ─── CSV helper ───────────────────────────────────────────────────────────────

function downloadCsv(rows: OrderRecord[]) {
  const headers = ["Order ID","Order Date","Delivery Date","Product Quantity","Order Status","Payment Status","Total Amount (LKR)"];
  const lines   = rows.map(r => [r.orderId, r.orderDate, r.deliveryDate, r.productQuantity, r.orderStatus, r.paymentStatus, r.totalAmount].join(","));
  const blob    = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href = url; a.download = `order-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── PDF helper ───────────────────────────────────────────────────────────────

function printOrderPdf(rows: OrderRecord[], storeName: string) {
  const total     = rows.length;
  const delivered = rows.filter(r => r.orderStatus === "Delivered").length;
  const pending   = rows.filter(r => r.orderStatus === "Pending").length;
  const cancelled = rows.filter(r => r.orderStatus === "Cancelled").length;
  const now       = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const sc = (s: string) => s === "Delivered" ? "#16a34a" : s === "Pending" ? "#d97706" : "#dc2626";
  const pc = (s: string) => s === "Paid" ? "#16a34a" : "#dc2626";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Order Report – ${storeName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:36px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
  .title{font-size:24px;font-weight:800}.sub{font-size:12px;color:#666;margin-top:5px}
  .store-tag{font-size:12px;color:#7c3aed;font-weight:700;margin-top:4px}
  .badge{background:#f0f4ff;color:#2563eb;border:1.5px solid #2563eb;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
  .kpi{border:1.5px solid #e8e8e8;border-radius:10px;padding:16px}
  .kpi-lbl{font-size:11px;color:#888;margin-bottom:6px}
  .kpi-val{font-size:24px;font-weight:900;margin-bottom:2px}
  .kpi-sub{font-size:11px;color:#aaa}
  .sec{font-size:15px;font-weight:800;margin-bottom:10px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#f5f5f5}
  th{padding:11px 14px;text-align:left;font-size:12px;font-weight:800;color:#444;border-bottom:2px solid #e8e8e8}
  td{padding:11px 14px;font-size:12px;color:#333;border-bottom:1px solid #f0f0f0}
  tr:nth-child(even) td{background:#fafafa}
  .pill{border-radius:20px;padding:3px 12px;font-weight:700;font-size:11px;display:inline-block}
  footer{margin-top:16px;font-size:11px;color:#aaa}
  @media print{body{padding:20px}@page{margin:12mm;size:A4}}
</style></head><body>
<div class="hdr">
  <div>
    <div class="title">Order Report</div>
    <div class="store-tag">Store: ${storeName}</div>
    <div class="sub">Filtered order data by date, order ID, and status</div>
    <div class="sub">Generated: ${now}</div>
  </div>
  <div class="badge">${total} Records</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="kpi-lbl">Total Orders</div><div class="kpi-val" style="color:#2563eb">${total}</div><div class="kpi-sub">For selected date range</div></div>
  <div class="kpi"><div class="kpi-lbl">Delivered</div><div class="kpi-val" style="color:#16a34a">${delivered}</div><div class="kpi-sub">Successfully completed</div></div>
  <div class="kpi"><div class="kpi-lbl">Pending</div><div class="kpi-val" style="color:#d97706">${pending}</div><div class="kpi-sub">Awaiting fulfillment</div></div>
  <div class="kpi"><div class="kpi-lbl">Cancelled</div><div class="kpi-val" style="color:#dc2626">${cancelled}</div><div class="kpi-sub">Orders cancelled</div></div>
</div>
<div class="sec">Filtered Order List</div>
<table>
  <thead><tr><th>Order ID</th><th>Order Date</th><th>Delivery Date</th><th>Qty</th><th>Order Status</th><th>Payment</th><th>Total (LKR)</th></tr></thead>
  <tbody>
    ${rows.map(r => `<tr>
      <td><strong>${r.orderId}</strong></td><td>${r.orderDate}</td><td>${r.deliveryDate}</td><td>${r.productQuantity}</td>
      <td><span class="pill" style="background:${sc(r.orderStatus)}22;color:${sc(r.orderStatus)}">${r.orderStatus}</span></td>
      <td><span class="pill" style="background:${pc(r.paymentStatus)}22;color:${pc(r.paymentStatus)}">${r.paymentStatus}</span></td>
      <td><strong>LKR ${r.totalAmount.toLocaleString()}</strong></td>
    </tr>`).join("")}
  </tbody>
</table>
<footer>Total ${rows.length} order(s) exported · TradeZ Vendor Portal</footer>
</body></html>`;

  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position:"fixed", right:"0", bottom:"0", width:"0", height:"0", border:"none" });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderReportModalProps {
  open: boolean;
  onClose: () => void;
  stores?: StoreOption[];
}

export default function OrderReportModal({ open, onClose, stores = [] }: OrderReportModalProps) {
  const [fromDate,      setFromDate]      = useState("");
  const [toDate,        setToDate]        = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [orderStatus,   setOrderStatus]   = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [selectedStore, setSelectedStore] = useState("All");
  const [page,          setPage]          = useState(1);

  const filtered = useMemo(() => ORDER_DATA.filter(r => {
    if (fromDate      && r.orderDate < fromDate)                                           return false;
    if (toDate        && r.orderDate > toDate)                                             return false;
    if (orderIdFilter && !r.orderId.toLowerCase().includes(orderIdFilter.toLowerCase()))   return false;
    if (orderStatus  !== "All" && r.orderStatus  !== orderStatus)                          return false;
    if (paymentStatus !== "All" && r.paymentStatus !== paymentStatus)                      return false;
    return true;
  }), [fromDate, toDate, orderIdFilter, orderStatus, paymentStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const delivered  = filtered.filter(r => r.orderStatus === "Delivered").length;
  const pending    = filtered.filter(r => r.orderStatus === "Pending").length;
  const cancelled  = filtered.filter(r => r.orderStatus === "Cancelled").length;
  const now        = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const selectedStoreName = selectedStore === "All"
    ? "All Stores"
    : stores.find(s => s.storeUuid === selectedStore)?.storeName ?? "All Stores";

  const handleReset = () => {
    setFromDate(""); setToDate(""); setOrderIdFilter("");
    setOrderStatus("All"); setPaymentStatus("All"); setSelectedStore("All"); setPage(1);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: { xs: "95vw", sm: "92vw", md: 920 },
        maxHeight: "90vh",
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        overflow: "hidden", outline: "none",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header — identical layout to SalesReportModal ── */}
        <Box sx={{ px: 4, pt: 3.5, pb: 2 }}>
          <FlexBetween alignItems="flex-start">
            <Box>
              <H3 fontWeight={900} sx={{ fontSize: 22 }}>Order Report</H3>
              <Small sx={{ display: "block", mt: 0.5, fontSize: 12, color: "#7c3aed", fontWeight: 700 }}>
                Store: {selectedStoreName}
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Filter order data by date, order ID, and status
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Generated: Today at {now}
              </Small>
            </Box>
            <FlexBox alignItems="center" gap={1.5}>
              <Chip
                label={`${filtered.length} Records`}
                sx={{ bgcolor: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1.5px solid #2563eb", fontWeight: 700, fontSize: 12, borderRadius: "20px", height: 32 }}
              />
              <IconButton onClick={onClose} size="small" sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 2, "&:hover": { borderColor: "error.main", color: "error.main" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </FlexBox>
          </FlexBetween>
        </Box>

        <Divider />

        {/* ── Body ── */}
        <Box sx={{ overflowY: "auto", flex: 1, px: 4, py: 3 }}>

          {/* Filter card — same card style as Sales date filter */}
          <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4} md={2.5}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Store</Small>
                <Select size="small" fullWidth value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setPage(1); }} sx={{ borderRadius: 2, fontSize: 13 }} displayEmpty>
                  <MenuItem value="All" sx={{ fontSize: 13 }}>All Stores</MenuItem>
                  {stores.map(s => (
                    <MenuItem key={s.storeUuid} value={s.storeUuid} sx={{ fontSize: 13 }}>{s.storeName}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>From Date</Small>
                <TextField type="date" size="small" fullWidth value={fromDate} onChange={e => setFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>To Date</Small>
                <TextField type="date" size="small" fullWidth value={toDate} onChange={e => setToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={12} sm={4} md={2.5}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Order ID</Small>
                <TextField size="small" fullWidth placeholder="Enter order ID" value={orderIdFilter}
                  onChange={e => setOrderIdFilter(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Order Status</Small>
                <Select size="small" fullWidth value={orderStatus} onChange={e => setOrderStatus(e.target.value)} sx={{ borderRadius: 2, fontSize: 13 }}>
                  {["All","Delivered","Pending","Cancelled"].map(s => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s === "All" ? "All Status" : s}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Payment Status</Small>
                <Select size="small" fullWidth value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} sx={{ borderRadius: 2, fontSize: 13 }}>
                  {["All","Paid","Unpaid"].map(s => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s === "All" ? "All Payments" : s}</MenuItem>)}
                </Select>
              </Grid>
              <Grid item xs={12} sm={4} md="auto">
                <FlexBox gap={1} mt={{ xs: 0, md: 2.75 }}>
                  <Button variant="contained" startIcon={<FilterAltIcon />} onClick={() => setPage(1)}
                    sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2, whiteSpace: "nowrap" }}>
                    Apply
                  </Button>
                  <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset}
                    sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2, "&:hover": { borderColor: "#c0392b", color: "#c0392b" } }}>
                    Reset
                  </Button>
                </FlexBox>
              </Grid>
            </Grid>
          </Card>

          {/* KPI cards — same card style as Sales */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: "Total Orders", value: filtered.length, sub: "For selected date range",        color: "#2563eb" },
              { label: "Delivered",    value: delivered,       sub: "Successfully completed orders",  color: "#16a34a" },
              { label: "Pending",      value: pending,         sub: "Orders waiting for fulfillment", color: "#d97706" },
              { label: "Cancelled",    value: cancelled,       sub: "Orders cancelled in period",     color: "#dc2626" },
            ].map(({ label, value, sub, color }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
                  <Small color="text.secondary" sx={{ fontSize: 11, fontWeight: 600, display: "block", mb: 0.75 }}>{label}</Small>
                  <Box sx={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1.1, mb: 0.5 }}>{value}</Box>
                  <Small color="text.disabled" sx={{ fontSize: 11 }}>{sub}</Small>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filtered Order List — same section style as Sales table */}
          <Box>
            <FlexBetween mb={1.5}>
              <Box>
                <H6 fontWeight={800} sx={{ fontSize: 15 }}>Filtered Order List</H6>
                <Small color="text.disabled" sx={{ fontSize: 12 }}>This section is the selected report area for PDF export.</Small>
              </Box>
              <FlexBox gap={1}>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => downloadCsv(filtered)}
                  sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 12, textTransform: "none", "&:hover": { borderColor: "#16a34a", color: "#16a34a" } }}>
                  CSV
                </Button>
                <Button variant="contained" size="small" startIcon={<PictureAsPdfIcon />} onClick={() => printOrderPdf(filtered, selectedStoreName)}
                  sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 700, fontSize: 12, textTransform: "none" }}>
                  Export as PDF
                </Button>
              </FlexBox>
            </FlexBetween>

            <Card sx={{ borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", overflow: "hidden" }}>
              {/* Column headers — same pink tinted header as Sales table */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1.3fr 1.3fr 0.7fr 1.3fr 1.2fr 1.3fr", bgcolor: "#fff5f5", px: 2.5, py: 1.25, borderBottom: "2px solid rgba(192,57,43,0.10)" }}>
                {["Order ID","Order Date","Delivery Date","Qty","Order Status","Payment Status","Total Amount"].map(col => (
                  <Small key={col} sx={{ fontWeight: 800, fontSize: 12, color: "#c0392b" }}>{col}</Small>
                ))}
              </Box>

              {paginated.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Small color="text.disabled" sx={{ fontSize: 13 }}>No orders match the selected filters.</Small>
                </Box>
              ) : paginated.map((row, i) => (
                <Box key={row.orderId} sx={{
                  display: "grid", gridTemplateColumns: "1.2fr 1.3fr 1.3fr 0.7fr 1.3fr 1.2fr 1.3fr",
                  px: 2.5, py: 1.6,
                  bgcolor: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)",
                  borderBottom: i < paginated.length - 1 ? "1px solid #f0f0f0" : "none",
                  alignItems: "center",
                  "&:hover": { bgcolor: "#fff8f8" },
                  transition: "background 0.12s",
                }}>
                  <Small sx={{ fontWeight: 700, fontSize: 13 }}>{row.orderId}</Small>
                  <Small sx={{ fontSize: 13, color: "text.secondary" }}>{row.orderDate}</Small>
                  <Small sx={{ fontSize: 13, color: "text.secondary" }}>{row.deliveryDate}</Small>
                  <Small sx={{ fontSize: 13, fontWeight: 600 }}>{row.productQuantity}</Small>
                  <Box>
                    <Box component="span" sx={{ bgcolor: ORDER_STATUS_STYLE[row.orderStatus].bg, color: ORDER_STATUS_STYLE[row.orderStatus].color, borderRadius: "20px", px: 1.5, py: 0.4, fontSize: 12, fontWeight: 700 }}>
                      {row.orderStatus}
                    </Box>
                  </Box>
                  <Box>
                    <Box component="span" sx={{ bgcolor: PAYMENT_STATUS_STYLE[row.paymentStatus].bg, color: PAYMENT_STATUS_STYLE[row.paymentStatus].color, borderRadius: "20px", px: 1.5, py: 0.4, fontSize: 12, fontWeight: 700 }}>
                      {row.paymentStatus}
                    </Box>
                  </Box>
                  <Small sx={{ fontSize: 13, fontWeight: 800 }}>LKR {row.totalAmount.toLocaleString()}</Small>
                </Box>
              ))}

              {/* Pagination footer */}
              <FlexBetween sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Small color="text.disabled" sx={{ fontSize: 12 }}>
                  Showing {paginated.length} of {filtered.length} records in selected report area
                </Small>
                <FlexBox gap={0.75}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Box key={p} onClick={() => setPage(p)} sx={{
                      width: 32, height: 32, borderRadius: 1.5,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      bgcolor: p === page ? "#c0392b" : "transparent",
                      color: p === page ? "#fff" : "text.secondary",
                      border: "1.5px solid", borderColor: p === page ? "#c0392b" : "divider",
                      "&:hover": { borderColor: "#c0392b", color: p === page ? "#fff" : "#c0392b" },
                      transition: "all 0.15s",
                    }}>
                      {p}
                    </Box>
                  ))}
                </FlexBox>
              </FlexBetween>
            </Card>
          </Box>
        </Box>

        {/* ── Footer — same layout as SalesReportModal ── */}
        <Divider />
        <Box sx={{ px: 4, py: 2, display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadCsv(filtered)}
            sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2.5, "&:hover": { borderColor: "#16a34a", color: "#16a34a" } }}>
            Download CSV
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={() => printOrderPdf(filtered, selectedStoreName)}
            sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 800, fontSize: 13, textTransform: "none", px: 2.5, boxShadow: "0 4px 14px rgba(192,57,43,0.30)" }}>
            Download PDF
          </Button>
          <Button variant="outlined" onClick={onClose}
            sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2.5, "&:hover": { borderColor: "#c0392b", color: "#c0392b" } }}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}