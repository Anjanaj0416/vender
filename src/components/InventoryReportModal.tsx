"use client";

import React, { useState, useMemo } from "react";
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
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { H3, H6, Small } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";

// ─── Types & data ─────────────────────────────────────────────────────────────

interface InventoryRecord {
  productId: string;
  productName: string;
  currentStock: number;
  restockQty: number;
  isLowStock: boolean;
}

const ROL_THRESHOLD = 25;

const INVENTORY_DATA: InventoryRecord[] = [
  { productId: "PRD-001", productName: "Wireless Headphones",  currentStock: 20, restockQty: 25, isLowStock: true  },
  { productId: "PRD-002", productName: "USB-C Hub",            currentStock: 45, restockQty: 0,  isLowStock: false },
  { productId: "PRD-003", productName: "Laptop Stand",         currentStock: 8,  restockQty: 25, isLowStock: true  },
  { productId: "PRD-004", productName: "Mechanical Keyboard",  currentStock: 60, restockQty: 0,  isLowStock: false },
  { productId: "PRD-005", productName: "Webcam HD 1080p",      currentStock: 12, restockQty: 25, isLowStock: true  },
  { productId: "PRD-006", productName: "Bluetooth Speaker",    currentStock: 33, restockQty: 0,  isLowStock: false },
  { productId: "PRD-007", productName: 'Monitor 27"',          currentStock: 5,  restockQty: 25, isLowStock: true  },
  { productId: "PRD-008", productName: "Smart Watch",          currentStock: 72, restockQty: 0,  isLowStock: false },
  { productId: "PRD-009", productName: "Phone Case Pack",      currentStock: 18, restockQty: 25, isLowStock: true  },
  { productId: "PRD-010", productName: "Power Bank 20000mAh",  currentStock: 40, restockQty: 0,  isLowStock: false },
  { productId: "PRD-011", productName: "HDMI Cable 2m",        currentStock: 3,  restockQty: 25, isLowStock: true  },
  { productId: "PRD-012", productName: "Desk Lamp LED",        currentStock: 55, restockQty: 0,  isLowStock: false },
];

const ROWS_PER_PAGE = 6;

// ─── PDF helper ───────────────────────────────────────────────────────────────

function printInventoryPdf(rows: InventoryRecord[], title: string): void {
  const total    = rows.length;
  const lowCount = rows.filter((r) => r.isLowStock).length;
  const okCount  = total - lowCount;
  const now      = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:36px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
  .title{font-size:24px;font-weight:800}.sub{font-size:12px;color:#666;margin-top:5px}
  .badge{background:#fff7e6;color:#d97706;border:1.5px solid #d97706;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700}
  .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:26px}
  .kpi{border:1.5px solid #e8e8e8;border-radius:10px;padding:16px}
  .kpi-lbl{font-size:11px;color:#888;margin-bottom:6px}
  .kpi-val{font-size:28px;font-weight:900;margin-bottom:2px}
  .kpi-sub{font-size:11px;color:#aaa}
  .sec{font-size:15px;font-weight:800;margin-bottom:10px}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#fffbe6}
  th{padding:11px 14px;text-align:left;font-size:12px;font-weight:800;color:#b45309;border-bottom:2px solid #fde68a}
  td{padding:11px 14px;font-size:12px;color:#333;border-bottom:1px solid #f0f0f0}
  .low-row td{background:#fffde7}
  tr:nth-child(even):not(.low-row) td{background:#fafafa}
  .pill-y{background:#fee2e2;color:#dc2626;border-radius:20px;padding:3px 10px;font-weight:700;font-size:11px;display:inline-block}
  .pill-n{background:#dcfce7;color:#16a34a;border-radius:20px;padding:3px 10px;font-weight:700;font-size:11px;display:inline-block}
  .cell-low{background:#fef08a;color:#92400e;border-radius:6px;padding:2px 8px;font-weight:800;font-size:12px;display:inline-block}
  .cell-ok{color:#16a34a;font-weight:700}
  footer{margin-top:16px;font-size:11px;color:#aaa}
  @media print{body{padding:20px}@page{margin:12mm;size:A4}}
</style></head><body>
<div class="hdr">
  <div>
    <div class="title">${title}</div>
    <div class="sub">Current stock levels and restock requirements (ROL: ${ROL_THRESHOLD} units)</div>
    <div class="sub">Generated: ${now}</div>
  </div>
  <div class="badge">${lowCount} Low Stock Items</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="kpi-lbl">Total Products</div><div class="kpi-val" style="color:#2563eb">${total}</div><div class="kpi-sub">In this report</div></div>
  <div class="kpi"><div class="kpi-lbl">Low Stock (Y)</div><div class="kpi-val" style="color:#dc2626">${lowCount}</div><div class="kpi-sub">Need restocking now</div></div>
  <div class="kpi"><div class="kpi-lbl">Adequate Stock (N)</div><div class="kpi-val" style="color:#16a34a">${okCount}</div><div class="kpi-sub">Stock level sufficient</div></div>
</div>
<div class="sec">Inventory Table</div>
<table>
  <thead><tr><th>Product ID</th><th>Product Name</th><th>Current Stock</th><th>Restock Qty – ROL</th><th>Low Stock</th></tr></thead>
  <tbody>
    ${rows
      .map(
        (r) => `
    <tr class="${r.isLowStock ? "low-row" : ""}">
      <td><strong>${r.productId}</strong></td>
      <td>${r.productName}</td>
      <td>${r.isLowStock ? `<span class="cell-low">${r.currentStock}</span>` : `<span class="cell-ok">${r.currentStock}</span>`}</td>
      <td>${r.isLowStock ? `<span class="cell-low">${r.restockQty}</span>` : "—"}</td>
      <td>${r.isLowStock ? '<span class="pill-y">Y</span>' : '<span class="pill-n">N</span>'}</td>
    </tr>`
      )
      .join("")}
  </tbody>
</table>
<footer>Total ${rows.length} product(s) · TradeZ Vendor Portal · ROL threshold: ${ROL_THRESHOLD} units</footer>
</body></html>`;

  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "none" });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }
}

// ─── Props interface ──────────────────────────────────────────────────────────

export interface InventoryReportModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * "All" → opened from "Total Stores" card  → shows all products
   * "Y"   → opened from "Low Stock Items" card → pre-filtered to low stock only
   */
  defaultFilter?: "All" | "Y" | "N";
}

// ─── Component ────────────────────────────────────────────────────────────────

const InventoryReportModal: React.FC<InventoryReportModalProps> = ({
  open,
  onClose,
  defaultFilter = "All",
}) => {
  const [productIdFilter, setProductIdFilter] = useState<string>("");
  const [lowStockFilter,  setLowStockFilter]  = useState<"All" | "Y" | "N">(defaultFilter);
  const [page,            setPage]            = useState<number>(1);

  // Re-sync local filter whenever defaultFilter prop changes
  React.useEffect(() => {
    if (open) {
      setLowStockFilter(defaultFilter);
      setProductIdFilter("");
      setPage(1);
    }
  }, [open, defaultFilter]);

  const filtered = useMemo(
    () =>
      INVENTORY_DATA.filter((r) => {
        if (
          productIdFilter &&
          !r.productId.toLowerCase().includes(productIdFilter.toLowerCase()) &&
          !r.productName.toLowerCase().includes(productIdFilter.toLowerCase())
        )
          return false;
        if (lowStockFilter === "Y" && !r.isLowStock) return false;
        if (lowStockFilter === "N" && r.isLowStock)  return false;
        return true;
      }),
    [productIdFilter, lowStockFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const lowCount   = filtered.filter((r) => r.isLowStock).length;
  const okCount    = filtered.length - lowCount;
  const now        = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const isLowStockView = defaultFilter === "Y";
  const modalTitle     = isLowStockView ? "Low Stock Report" : "Inventory Report";
  const chipLabel      = isLowStockView ? `${lowCount} Low Stock` : `${filtered.length} Products`;
  const chipSx         = isLowStockView
    ? { bgcolor: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1.5px solid #dc2626" }
    : { bgcolor: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1.5px solid #2563eb" };

  const handleReset = () => {
    setProductIdFilter("");
    setLowStockFilter(defaultFilter);
    setPage(1);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: { xs: "95vw", sm: "90vw", md: 860 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden", outline: "none",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ px: 4, pt: 3.5, pb: 2 }}>
          <FlexBetween alignItems="flex-start">
            <Box>
              <H3 fontWeight={900} sx={{ fontSize: 22 }}>{modalTitle}</H3>
              <Small color="text.disabled" sx={{ display: "block", mt: 0.5, fontSize: 12 }}>
                {isLowStockView
                  ? `Products below the reorder level (ROL: ${ROL_THRESHOLD} units)`
                  : `Current stock levels and restock requirements (ROL: ${ROL_THRESHOLD} units)`}
              </Small>
              <Small color="text.disabled" sx={{ display: "block", fontSize: 12 }}>
                Generated: Today at {now}
              </Small>
            </Box>
            <FlexBox alignItems="center" gap={1.5}>
              <Chip
                label={chipLabel}
                sx={{ ...chipSx, fontWeight: 700, fontSize: 12, borderRadius: "20px", height: 32 }}
              />
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 2, "&:hover": { borderColor: "error.main", color: "error.main" } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </FlexBox>
          </FlexBetween>
        </Box>

        <Divider />

        {/* ── Scrollable body ── */}
        <Box sx={{ overflowY: "auto", flex: 1, px: 4, py: 3 }}>

          {/* Filter card */}
          <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>
                  Product ID
                </Small>
                <TextField
                  size="small" fullWidth
                  placeholder="Search by product ID or name"
                  value={productIdFilter}
                  onChange={(e) => setProductIdFilter(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Small fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 0.75, fontSize: 12 }}>
                  Low Stock (Y/N)
                </Small>
                <Select
                  size="small" fullWidth
                  value={lowStockFilter}
                  onChange={(e) => { setLowStockFilter(e.target.value as "All" | "Y" | "N"); setPage(1); }}
                  sx={{ borderRadius: 2, fontSize: 13 }}
                >
                  {defaultFilter === "All" && <MenuItem value="All" sx={{ fontSize: 13 }}>All</MenuItem>}
                  <MenuItem value="Y" sx={{ fontSize: 13 }}>Y — Low Stock</MenuItem>
                  {defaultFilter !== "Y" && <MenuItem value="N" sx={{ fontSize: 13 }}>N — Adequate</MenuItem>}
                </Select>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FlexBox gap={1} mt={{ xs: 0, sm: 2.75 }}>
                  <Button
                    variant="contained"
                    startIcon={<FilterAltIcon />}
                    onClick={() => setPage(1)}
                    sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2.5 }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                    sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, fontWeight: 700, fontSize: 13, textTransform: "none", px: 2, "&:hover": { borderColor: "#c0392b", color: "#c0392b" } }}
                  >
                    Reset
                  </Button>
                </FlexBox>
              </Grid>
            </Grid>
          </Card>

          {/* KPI summary cards */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: "Total Products",    value: filtered.length, sub: "In this report",         color: "#2563eb" },
              { label: "Low Stock (Y)",      value: lowCount,        sub: "Need restocking now",    color: "#dc2626" },
              { label: "Adequate Stock (N)", value: okCount,         sub: "Stock level sufficient", color: "#16a34a" },
            ].map(({ label, value, sub, color }) => (
              <Grid item xs={12} sm={4} key={label}>
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none" }}>
                  <Small color="text.secondary" sx={{ fontSize: 11, fontWeight: 600, display: "block", mb: 0.75 }}>{label}</Small>
                  <Box sx={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1.1, mb: 0.5 }}>{value}</Box>
                  <Small color="text.disabled" sx={{ fontSize: 11 }}>{sub}</Small>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Inventory Table */}
          <Box>
            <FlexBetween mb={1.5}>
              <Box>
                <H6 fontWeight={800} sx={{ fontSize: 15 }}>Inventory Table</H6>
                <Small color="text.disabled" sx={{ fontSize: 12 }}>
                  {isLowStockView
                    ? "Showing only low-stock items that require restocking."
                    : `Yellow rows indicate items below the reorder level (${ROL_THRESHOLD} units).`}
                </Small>
              </Box>
              <Button
                variant="contained" size="small"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => printInventoryPdf(filtered, modalTitle)}
                sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 700, fontSize: 12, textTransform: "none" }}
              >
                Export as PDF
              </Button>
            </FlexBetween>

            <Card sx={{ borderRadius: 3, border: "1.5px solid", borderColor: "divider", boxShadow: "none", overflow: "hidden" }}>
              {/* Column headers */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 2.4fr 1.3fr 1.6fr 1fr",
                bgcolor: "#fffbe6", px: 2.5, py: 1.25,
                borderBottom: "2px solid rgba(180,83,9,0.15)",
              }}>
                {["Product ID", "Product Name", "Current Stock", "Restock Qty – ROL", "Low Stock"].map((col) => (
                  <Small key={col} sx={{ fontWeight: 800, fontSize: 12, color: "#b45309" }}>{col}</Small>
                ))}
              </Box>

              {/* Rows */}
              {paginated.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Small color="text.disabled" sx={{ fontSize: 13 }}>No products match the selected filters.</Small>
                </Box>
              ) : (
                paginated.map((row, i) => (
                  <Box
                    key={row.productId}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 2.4fr 1.3fr 1.6fr 1fr",
                      px: 2.5, py: 1.7,
                      bgcolor: row.isLowStock
                        ? "rgba(253,230,138,0.30)"
                        : i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.012)",
                      borderBottom: i < paginated.length - 1 ? "1px solid #f0f0f0" : "none",
                      borderLeft: row.isLowStock ? "3px solid #f59e0b" : "3px solid transparent",
                      alignItems: "center",
                      "&:hover": { bgcolor: row.isLowStock ? "rgba(253,230,138,0.55)" : "#fff8f8" },
                      transition: "background 0.12s",
                    }}
                  >
                    <Small sx={{ fontWeight: 700, fontSize: 13 }}>{row.productId}</Small>

                    <FlexBox alignItems="center" gap={0.75}>
                      <Small sx={{ fontSize: 13 }}>{row.productName}</Small>
                      {row.isLowStock && <WarningAmberIcon sx={{ fontSize: 14, color: "#f59e0b" }} />}
                    </FlexBox>

                    {/* Current Stock — yellow badge if low */}
                    <Box sx={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      bgcolor: row.isLowStock ? "#fef08a" : "rgba(22,163,74,0.10)",
                      color: row.isLowStock ? "#92400e" : "#16a34a",
                      borderRadius: 1.5, px: 1.5, py: 0.4,
                      fontSize: 13, fontWeight: 800, width: "fit-content",
                    }}>
                      {row.currentStock}
                    </Box>

                    {/* Restock Qty — yellow badge if low, dash otherwise */}
                    {row.isLowStock ? (
                      <Box sx={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        bgcolor: "#fef08a", color: "#92400e",
                        borderRadius: 1.5, px: 1.5, py: 0.4,
                        fontSize: 13, fontWeight: 800, width: "fit-content",
                      }}>
                        {row.restockQty}
                      </Box>
                    ) : (
                      <Small sx={{ fontSize: 13, color: "text.disabled" }}>—</Small>
                    )}

                    {/* Y / N badge */}
                    <Box>
                      <Box
                        component="span"
                        sx={{
                          bgcolor: row.isLowStock ? "rgba(220,38,38,0.10)" : "rgba(22,163,74,0.10)",
                          color: row.isLowStock ? "#dc2626" : "#16a34a",
                          borderRadius: "20px", px: 1.5, py: 0.4,
                          fontSize: 12, fontWeight: 800,
                        }}
                      >
                        {row.isLowStock ? "Y" : "N"}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}

              {/* Pagination */}
              <FlexBetween sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Small color="text.disabled" sx={{ fontSize: 12 }}>
                  Showing {paginated.length} of {filtered.length} products
                </Small>
                <FlexBox gap={0.75}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Box
                      key={p}
                      onClick={() => setPage(p)}
                      sx={{
                        width: 32, height: 32, borderRadius: 1.5,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        bgcolor: p === page ? "#c0392b" : "transparent",
                        color: p === page ? "#fff" : "text.secondary",
                        border: "1.5px solid", borderColor: p === page ? "#c0392b" : "divider",
                        "&:hover": { borderColor: "#c0392b", color: p === page ? "#fff" : "#c0392b" },
                        transition: "all 0.15s",
                      }}
                    >
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
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => printInventoryPdf(filtered, modalTitle)}
            sx={{ bgcolor: "#c0392b", "&:hover": { bgcolor: "#96281b" }, borderRadius: 2, fontWeight: 800, fontSize: 13, textTransform: "none", px: 2.5, boxShadow: "0 4px 14px rgba(192,57,43,0.30)" }}
          >
            Download PDF
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
};

export default InventoryReportModal;