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

import { H3, H6, Paragraph, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import CANCELLED_DATA_BY_STORE from "data/cancelledOrdersData.json";

// ─── Store option type ────────────────────────────────────────────────────────

export interface StoreOption {
  storeUuid: string;
  storeName: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CancelledOrderRecord {
  orderId: string;
  customerId: string;
  productName: string;
  quantity: number;
  orderDate: string;
  cancellationDate: string;
}

const ALL_CANCELLED_DATA: CancelledOrderRecord[] =
  Object.values(CANCELLED_DATA_BY_STORE).flat() as CancelledOrderRecord[];

const ROWS_PER_PAGE = 6;

// ─── CSV helper ───────────────────────────────────────────────────────────────

function downloadCsv(rows: CancelledOrderRecord[]) {
  const headers = ["Order ID", "Customer ID", "Product Name", "Quantity", "Order Date", "Cancellation Date"];
  const lines   = rows.map(r => [
    r.orderId,
    r.customerId,
    `"${r.productName}"`,
    r.quantity,
    r.orderDate,
    r.cancellationDate,
  ].join(","));
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `cancelled-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── PDF helper ───────────────────────────────────────────────────────────────

function printCancelledPdf(rows: CancelledOrderRecord[], storeName: string) {
  if (rows.length === 0) return;
  const totalQty     = rows.reduce((s, r) => s + r.quantity, 0);
  const uniqueCustomers = new Set(rows.map(r => r.customerId)).size;
  const productCount = new Map<string, number>();
  rows.forEach(r => productCount.set(r.productName, (productCount.get(r.productName) ?? 0) + 1));
  const topProduct   = [...productCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const now          = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Cancelled Orders Report – ${storeName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:32px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
  .title{font-size:24px;font-weight:800}.sub{font-size:12px;color:#666;margin-top:5px}
  .store-tag{font-size:12px;color:#7c3aed;font-weight:700;margin-top:4px}
  .badge{background:#fff0f0;color:#c0392b;border:1.5px solid #c0392b;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
  .kpi{border:1.5px solid #e8e8e8;border-radius:10px;padding:16px}
  .kpi-lbl{font-size:11px;color:#888;margin-bottom:6px}
  .kpi-val{font-size:24px;font-weight:900;margin-bottom:2px}
  .kpi-sub{font-size:11px;color:#aaa}
  .sec{font-size:15px;font-weight:800;color:#c0392b;margin-bottom:10px}
  .summary{border:1.5px solid #e8e8e8;border-radius:10px;padding:16px;font-size:13px;color:#444;line-height:1.7;margin-bottom:26px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#fff0f0}
  th{padding:12px 14px;text-align:left;font-size:11px;font-weight:800;color:#c0392b;border-bottom:2px solid #fad4d4}
  td{padding:10px 14px;font-size:11px;color:#333;border-bottom:1px solid #f5f5f5}
  tr:nth-child(even) td{background:#fafafa}
  .badge-b{background:#e8f0fe;color:#2563eb;border-radius:20px;padding:3px 10px;font-weight:700;font-size:10px;display:inline-block}
  footer{margin-top:16px;font-size:11px;color:#aaa}
  @media print{body{padding:20px}@page{margin:15mm;size:A4 landscape}}
</style></head><body>
<div class="hdr">
  <div>
    <div class="title">Cancelled Orders Report</div>
    <div class="store-tag">Store: ${storeName}</div>
    <div class="sub">Order cancellation activity overview</div>
    <div class="sub">Generated: Today at ${now}</div>
  </div>
  <div class="badge">${rows.length} Cancelled Orders</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="kpi-lbl">Total Cancelled</div><div class="kpi-val" style="color:#c0392b">${rows.length}</div><div class="kpi-sub">Orders cancelled</div></div>
  <div class="kpi"><div class="kpi-lbl">Total Items Lost</div><div class="kpi-val" style="color:#2563eb">${totalQty}</div><div class="kpi-sub">Units across all cancellations</div></div>
  <div class="kpi"><div class="kpi-lbl">Unique Customers</div><div class="kpi-val" style="color:#7c3aed">${uniqueCustomers}</div><div class="kpi-sub">Customers who cancelled</div></div>
  <div class="kpi"><div class="kpi-lbl">Top Cancelled Product</div><div class="kpi-val" style="color:#16a34a;font-size:13px;padding-top:6px">${topProduct ? topProduct[0] : "—"}</div><div class="kpi-sub">${topProduct ? topProduct[1] + " cancellations" : "No data"}</div></div>
</div>
<div class="sec">Cancellation Summary</div>
<div class="summary">
  A total of <strong>${rows.length}</strong> orders were cancelled during this period, affecting <strong>${uniqueCustomers}</strong> unique customers.
  The total quantity of items lost due to cancellations is <strong>${totalQty} units</strong>.
  ${topProduct ? `The most frequently cancelled product is <strong>${topProduct[0]}</strong> with ${topProduct[1]} cancellations.` : ""}
  Review these cancellations to identify patterns and reduce future order drop-off rates.
</div>
<div class="sec">Cancelled Orders Table</div>
<table>
  <thead><tr>
    <th>Order ID</th><th>Customer ID</th><th>Product Name</th><th>Quantity</th><th>Order Date</th><th>Cancellation Date</th>
  </tr></thead>
  <tbody>
    ${rows.map(r => `<tr>
      <td><strong style="color:#c0392b">${r.orderId}</strong></td>
      <td>${r.customerId}</td>
      <td><strong>${r.productName}</strong></td>
      <td><span class="badge-b">${r.quantity}</span></td>
      <td>${r.orderDate}</td>
      <td>${r.cancellationDate}</td>
    </tr>`).join("")}
  </tbody>
</table>
<footer>Total ${rows.length} cancelled order(s) · TradeZ Vendor Portal</footer>
</body></html>`;

  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "none" });
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

interface CancelledOrdersReportModalProps {
  open: boolean;
  onClose: () => void;
  stores?: StoreOption[];
}

export default function CancelledOrdersReportModal({ open, onClose, stores = [] }: CancelledOrdersReportModalProps) {
  const [selectedStore,  setSelectedStore]  = useState("All");
  const [fromDate,       setFromDate]       = useState("");
  const [toDate,         setToDate]         = useState("");
  const [orderIdFilter,  setOrderIdFilter]  = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [page,           setPage]           = useState(1);

  const storeData = useMemo((): CancelledOrderRecord[] => {
    if (selectedStore === "All") return ALL_CANCELLED_DATA;
    return ((CANCELLED_DATA_BY_STORE as Record<string, CancelledOrderRecord[]>)[selectedStore] ?? []);
  }, [selectedStore]);

  const filtered = useMemo(() => storeData.filter(r => {
    if (orderIdFilter  && !r.orderId.toLowerCase().includes(orderIdFilter.toLowerCase()))    return false;
    if (customerFilter && !r.customerId.toLowerCase().includes(customerFilter.toLowerCase())) return false;
    if (fromDate && r.orderDate < fromDate) return false;
    if (toDate   && r.orderDate > toDate)   return false;
    return true;
  }), [storeData, orderIdFilter, customerFilter, fromDate, toDate]);

  const totalPages      = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated       = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const totalQty        = filtered.reduce((s, r) => s + r.quantity, 0);
  const uniqueCustomers = new Set(filtered.map(r => r.customerId)).size;

  const productCount = new Map<string, number>();
  filtered.forEach(r => productCount.set(r.productName, (productCount.get(r.productName) ?? 0) + 1));
  const topProduct = [...productCount.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const selectedStoreName = selectedStore === "All"
    ? "All Stores"
    : stores.find(s => s.storeUuid === selectedStore)?.storeName ?? "All Stores";

  const handleReset = () => {
    setSelectedStore("All"); setFromDate(""); setToDate("");
    setOrderIdFilter(""); setCustomerFilter(""); setPage(1);
  };

  const COLS = "1.3fr 1.3fr 2fr 0.8fr 1.2fr 1.3fr";

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: { xs: "98vw", sm: "95vw", md: 1060 },
        maxHeight: "90vh",
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        overflow: "hidden", outline: "none",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <Box sx={{ px: 4, pt: 3.5, pb: 2 }}>
          <FlexBetween alignItems="flex-start">
            <Box>
              <H3 fontWeight={900} sx={{ fontSize: 22 }}>Cancelled Orders Report</H3>
              <Small sx={{ display: "block", mt: 0.5, fontSize: 12, color: "#7c3aed", fontWeight: 700 }}>
                Store: {selectedStoreName}
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Order cancellation activity overview
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Generated: Today at {now}
              </Small>
            </Box>
            <FlexBox alignItems="center" gap={1.5}>
              <Chip
                label={`${filtered.length} Cancelled Orders`}
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

          {/* Filter card */}
          <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={2.5}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Store</Small>
                <Select size="small" fullWidth value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setPage(1); }} sx={{ borderRadius: 2, fontSize: 13 }} displayEmpty>
                  <MenuItem value="All" sx={{ fontSize: 13 }}>All Stores</MenuItem>
                  {stores.map(s => (
                    <MenuItem key={s.storeUuid} value={s.storeUuid} sx={{ fontSize: 13 }}>{s.storeName}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>From Date</Small>
                <TextField size="small" fullWidth type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>To Date</Small>
                <TextField size="small" fullWidth type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Order ID</Small>
                <TextField size="small" fullWidth placeholder="Search Order ID" value={orderIdFilter}
                  onChange={e => { setOrderIdFilter(e.target.value); setPage(1); }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>Customer ID</Small>
                <TextField size="small" fullWidth placeholder="Search Customer ID" value={customerFilter}
                  onChange={e => { setCustomerFilter(e.target.value); setPage(1); }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Grid>
              <Grid item xs={12} sm={6} md="auto">
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

          {/* KPI cards */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: "Total Cancelled",      value: filtered.length.toString(),      sub: "Orders cancelled",                  color: "#c0392b" },
              { label: "Total Items Lost",      value: totalQty.toString(),             sub: "Units across all cancellations",    color: "#2563eb" },
              { label: "Unique Customers",      value: uniqueCustomers.toString(),      sub: "Customers who cancelled",           color: "#7c3aed" },
              { label: "Top Cancelled Product", value: topProduct ? topProduct[0] : "—", sub: topProduct ? `${topProduct[1]} cancellations` : "No data", color: "#16a34a" },
            ].map(({ label, value, sub, color }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
                  <Small color="text.secondary" sx={{ fontSize: 11, fontWeight: 600, display: "block", mb: 0.75 }}>{label}</Small>
                  <Box sx={{ fontSize: label === "Top Cancelled Product" ? 14 : 22, fontWeight: 900, color, lineHeight: 1.2, mb: 0.5, wordBreak: "break-word" }}>{value}</Box>
                  <Small color="text.disabled" sx={{ fontSize: 11 }}>{sub}</Small>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Cancellation Summary */}
          <Box mb={3}>
            <H6 fontWeight={800} sx={{ color: "#c0392b", mb: 1.5, fontSize: 15 }}>Cancellation Summary</H6>
            <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
              <Paragraph color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.75 }}>
                A total of{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{filtered.length} orders</Box>
                {" "}were cancelled during this period, affecting{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{uniqueCustomers} unique customers</Box>.
                The total quantity of items lost due to cancellations is{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{totalQty} units</Box>.
                {topProduct && (
                  <> The most frequently cancelled product is{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: "#c0392b" }}>{topProduct[0]}</Box>
                    {" "}with {topProduct[1]} cancellations.</>
                )}
                {" "}Review these cancellations to identify patterns and reduce future order drop-off rates.
              </Paragraph>
            </Card>
          </Box>

          {/* Table */}
          <Box>
            <FlexBetween mb={1.5}>
              <Box>
                <H6 fontWeight={800} sx={{ fontSize: 15 }}>Cancelled Orders Table</H6>
                <Small color="text.disabled" sx={{ fontSize: 12 }}>This section is the selected report area for PDF export.</Small>
              </Box>
              <FlexBox gap={1}>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => downloadCsv(filtered)}
                  sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 12, textTransform: "none", "&:hover": { borderColor: "#16a34a", color: "#16a34a" } }}>
                  CSV
                </Button>
                <Button variant="contained" size="small" startIcon={<PictureAsPdfIcon />} onClick={() => printCancelledPdf(filtered, selectedStoreName)}
                  sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 700, fontSize: 12, textTransform: "none" }}>
                  Export as PDF
                </Button>
              </FlexBox>
            </FlexBetween>

            <Card sx={{ borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", overflow: "hidden" }}>
              {/* Column headers */}
              <Box sx={{ display: "grid", gridTemplateColumns: COLS, bgcolor: "#fff5f5", px: 2.5, py: 1.5, borderBottom: "2px solid rgba(192,57,43,0.12)" }}>
                {["Order ID", "Customer ID", "Product Name", "Qty", "Order Date", "Cancellation Date"].map(col => (
                  <Small key={col} sx={{ fontWeight: 800, fontSize: 11, color: "#c0392b" }}>{col}</Small>
                ))}
              </Box>

              {paginated.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Small color="text.disabled" sx={{ fontSize: 13 }}>No cancelled orders match the selected filters.</Small>
                </Box>
              ) : paginated.map((row, i) => (
                <Box key={row.orderId} sx={{
                  display: "grid", gridTemplateColumns: COLS,
                  px: 2.5, py: 1.75,
                  bgcolor: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.015)",
                  borderBottom: i < paginated.length - 1 ? "1px solid #f0f0f0" : "none",
                  alignItems: "center",
                  "&:hover": { bgcolor: "#fff8f8" },
                  transition: "background 0.12s",
                }}>
                  <Small sx={{ fontWeight: 700, fontSize: 12, color: "#c0392b" }}>{row.orderId}</Small>
                  <Small sx={{ fontSize: 12, color: "text.secondary" }}>{row.customerId}</Small>
                  <Small sx={{ fontWeight: 700, fontSize: 12 }}>{row.productName}</Small>
                  <Box>
                    <Box component="span" sx={{ bgcolor: "rgba(37,99,235,0.10)", color: "#2563eb", borderRadius: "20px", px: 1.5, py: 0.4, fontSize: 12, fontWeight: 700 }}>
                      {row.quantity}
                    </Box>
                  </Box>
                  <Small sx={{ fontSize: 12, color: "text.secondary" }}>{row.orderDate}</Small>
                  <Small sx={{ fontSize: 12, color: "text.secondary" }}>{row.cancellationDate}</Small>
                </Box>
              ))}

              {/* Pagination footer */}
              <FlexBetween sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Small color="text.disabled" sx={{ fontSize: 12 }}>
                  Showing {paginated.length} of {filtered.length} records
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

        {/* ── Footer ── */}
        <Divider />
        <Box sx={{ px: 4, py: 2, display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadCsv(filtered)}
            sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2.5, "&:hover": { borderColor: "#16a34a", color: "#16a34a" } }}>
            Download CSV
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={() => printCancelledPdf(filtered, selectedStoreName)}
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
