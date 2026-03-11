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
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { H3, H6, Paragraph, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";

// ─── Types & data ─────────────────────────────────────────────────────────────

interface SalesRecord {
  date: string;    // display "DD/MM/YYYY"
  iso: string;     // filter "YYYY-MM-DD"
  totalSales: number;
  orders: number;
  unitsSold: number;
}

const SALES_DATA: SalesRecord[] = [
  { date: "01/03/2025", iso: "2025-03-01", totalSales: 5000, orders: 120, unitsSold: 150 },
  { date: "02/03/2025", iso: "2025-03-02", totalSales: 4200, orders: 100, unitsSold: 130 },
  { date: "03/03/2025", iso: "2025-03-03", totalSales: 6800, orders: 165, unitsSold: 210 },
  { date: "04/03/2025", iso: "2025-03-04", totalSales: 3900, orders: 88,  unitsSold: 105 },
  { date: "05/03/2025", iso: "2025-03-05", totalSales: 7200, orders: 182, unitsSold: 240 },
  { date: "06/03/2025", iso: "2025-03-06", totalSales: 5500, orders: 134, unitsSold: 175 },
  { date: "07/03/2025", iso: "2025-03-07", totalSales: 4800, orders: 115, unitsSold: 148 },
];

// ─── PDF helper ───────────────────────────────────────────────────────────────

function printSalesPdf(rows: SalesRecord[]) {
  if (rows.length === 0) return;
  const totalRevenue = rows.reduce((s, r) => s + r.totalSales, 0);
  const totalOrders  = rows.reduce((s, r) => s + r.orders, 0);
  const totalUnits   = rows.reduce((s, r) => s + r.unitsSold, 0);
  const bestDay      = rows.reduce((b, r) => (r.totalSales > b.totalSales ? r : b), rows[0]);
  const now          = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Sales Performance Full Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:32px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
  .title{font-size:24px;font-weight:800}.sub{font-size:12px;color:#666;margin-top:5px}
  .badge{background:#fff0f0;color:#c0392b;border:1.5px solid #c0392b;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
  .kpi{border:1.5px solid #e8e8e8;border-radius:10px;padding:16px}
  .kpi-lbl{font-size:11px;color:#888;margin-bottom:6px}
  .kpi-val{font-size:24px;font-weight:900;color:#c0392b;margin-bottom:2px}
  .kpi-sub{font-size:11px;color:#aaa}
  .sec{font-size:15px;font-weight:800;color:#c0392b;margin-bottom:10px}
  .summary{border:1.5px solid #e8e8e8;border-radius:10px;padding:16px;font-size:13px;color:#444;line-height:1.7;margin-bottom:26px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#fff0f0}
  th{padding:12px 16px;text-align:left;font-size:12px;font-weight:800;color:#c0392b;border-bottom:2px solid #fad4d4}
  td{padding:12px 16px;font-size:12px;color:#333;border-bottom:1px solid #f5f5f5}
  tr:nth-child(even) td{background:#fafafa}
  .badge-b{background:#e8f0fe;color:#2563eb;border-radius:20px;padding:3px 12px;font-weight:700;font-size:11px;display:inline-block}
  .badge-g{background:#e6f9f0;color:#16a34a;border-radius:20px;padding:3px 12px;font-weight:700;font-size:11px;display:inline-block}
  @media print{body{padding:20px}@page{margin:15mm;size:A4}}
</style></head><body>
<div class="hdr">
  <div>
    <div class="title">Sales Performance Full Report</div>
    <div class="sub">Period: ${rows[0].date} – ${rows[rows.length - 1].date}</div>
    <div class="sub">Generated: Today at ${now}</div>
  </div>
  <div class="badge">${rows.length} Daily Records</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="kpi-lbl">Total Revenue</div><div class="kpi-val">$${totalRevenue.toLocaleString()}</div><div class="kpi-sub">Combined sales for ${rows.length} days</div></div>
  <div class="kpi"><div class="kpi-lbl">Total Orders</div><div class="kpi-val">${totalOrders.toLocaleString()}</div><div class="kpi-sub">All completed and pending sales</div></div>
  <div class="kpi"><div class="kpi-lbl">Units Sold</div><div class="kpi-val">${totalUnits.toLocaleString()}</div><div class="kpi-sub">Across all tracked products</div></div>
  <div class="kpi"><div class="kpi-lbl">Best Sales Day</div><div class="kpi-val">${bestDay.date.slice(0,5)}</div><div class="kpi-sub">$${bestDay.totalSales.toLocaleString()} highest revenue</div></div>
</div>
<div class="sec">Performance Summary</div>
<div class="summary">
  The sales trend shows a strong mid-week increase, with the highest performance recorded on <strong>${bestDay.date}</strong>.
  Order count and units sold remained healthy across the reporting period, which suggests stable customer demand.
  This layout is useful when you want to export a professional PDF report for management, store owners, or finance review.
</div>
<div class="sec">Daily Sales Table</div>
<table>
  <thead><tr><th>Date</th><th>Total Sales</th><th>Orders</th><th>Units Sold</th></tr></thead>
  <tbody>
    ${rows.map(r => `<tr>
      <td>${r.date}</td>
      <td style="color:#c0392b;font-weight:700">$${r.totalSales.toLocaleString()}</td>
      <td><span class="badge-b">${r.orders}</span></td>
      <td><span class="badge-g">${r.unitsSold}</span></td>
    </tr>`).join("")}
  </tbody>
</table>
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

interface SalesReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SalesReportModal({ open, onClose }: SalesReportModalProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  const filtered = useMemo(() => SALES_DATA.filter(r => {
    if (fromDate && r.iso < fromDate) return false;
    if (toDate   && r.iso > toDate)   return false;
    return true;
  }), [fromDate, toDate]);

  const totalRevenue = filtered.reduce((s, r) => s + r.totalSales, 0);
  const totalOrders  = filtered.reduce((s, r) => s + r.orders, 0);
  const totalUnits   = filtered.reduce((s, r) => s + r.unitsSold, 0);
  const bestDay      = filtered.length > 0
    ? filtered.reduce((b, r) => r.totalSales > b.totalSales ? r : b, filtered[0])
    : null;
  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: { xs: "95vw", sm: "90vw", md: 800 },
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
              <H3 fontWeight={900} sx={{ fontSize: 22 }}>Sales Performance Full Report</H3>
              <Small color="text.disabled" sx={{ display: "block", mt: 0.5, fontSize: 12 }}>
                Period: {filtered[0]?.date ?? "—"} – {filtered[filtered.length - 1]?.date ?? "—"}
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Generated: Today at {now}
              </Small>
            </Box>
            <FlexBox alignItems="center" gap={1.5}>
              <Chip
                label={`${filtered.length} Daily Records`}
                sx={{ bgcolor: "#fff0f0", color: "#c0392b", border: "1.5px solid #c0392b", fontWeight: 700, fontSize: 12, borderRadius: "20px", height: 32 }}
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

          {/* Date filter */}
          <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>From Date</Small>
                <TextField
                  type="date" size="small" fullWidth value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>To Date</Small>
                <TextField
                  type="date" size="small" fullWidth value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FlexBox gap={1} mt={{ xs: 0, sm: 2.75 }}>
                  <Button
                    variant="contained"
                    startIcon={<FilterAltIcon />}
                    sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2.5 }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={() => { setFromDate(""); setToDate(""); }}
                    sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2, "&:hover": { borderColor: "#c0392b", color: "#c0392b" } }}
                  >
                    Reset
                  </Button>
                </FlexBox>
              </Grid>
            </Grid>
          </Card>

          {/* KPI cards */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: "Total Revenue",  value: `$${totalRevenue.toLocaleString()}`, sub: `Combined sales for ${filtered.length} days` },
              { label: "Total Orders",   value: totalOrders.toLocaleString(),         sub: "All completed and pending sales" },
              { label: "Units Sold",     value: totalUnits.toLocaleString(),          sub: "Across all tracked products" },
              { label: "Best Sales Day", value: bestDay ? bestDay.date.slice(0, 5) : "—", sub: bestDay ? `$${bestDay.totalSales.toLocaleString()} highest revenue` : "No data" },
            ].map(({ label, value, sub }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
                  <Small color="text.secondary" sx={{ fontSize: 11, fontWeight: 600, display: "block", mb: 0.75 }}>{label}</Small>
                  <Box sx={{ fontSize: 22, fontWeight: 900, color: "#c0392b", lineHeight: 1.1, mb: 0.5 }}>{value}</Box>
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
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>{bestDay?.date ?? "—"}</Box>.
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
              <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr", bgcolor: "#fff5f5", px: 2.5, py: 1.5, borderBottom: "2px solid rgba(192,57,43,0.12)" }}>
                {["Date", "Total Sales", "Orders", "Units Sold"].map(col => (
                  <Box key={col} sx={{ fontSize: 13, fontWeight: 800, color: "#c0392b" }}>{col}</Box>
                ))}
              </Box>

              {filtered.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Small color="text.disabled" sx={{ fontSize: 13 }}>No records match the selected date range.</Small>
                </Box>
              ) : filtered.map((row, i) => (
                <Box key={row.date} sx={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr",
                  px: 2.5, py: 1.75,
                  bgcolor: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.015)",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                  alignItems: "center",
                  "&:hover": { bgcolor: "#fff8f8" },
                }}>
                  <Small sx={{ fontSize: 13, color: "text.secondary" }}>{row.date}</Small>
                  <Small sx={{ fontSize: 13, fontWeight: 700, color: "#c0392b" }}>${row.totalSales.toLocaleString()}</Small>
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
        <Box sx={{ px: 4, py: 2, display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => printSalesPdf(filtered)}
            sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 800, fontSize: 13, textTransform: "none", px: 2.5, boxShadow: "0 4px 14px rgba(192,57,43,0.30)" }}
          >
            Download as PDF
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2.5, "&:hover": { borderColor: "#c0392b", color: "#c0392b" } }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}