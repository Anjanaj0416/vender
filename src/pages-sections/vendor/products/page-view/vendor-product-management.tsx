"use client";

import { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { H3, H6, Paragraph, Small, Span } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { Product1, ProductVariant } from "models/Product.model";
import {
  useGetVendorProductsQuery,
  useUpdateProductVariantMutation,
} from "services/vendor-api";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RowState {
  newStock: number;
  newPrice: number;
  status: "idle" | "edited" | "saving" | "saved" | "error";
}

interface Props {
  userId: string;
  storeId: string;
}

// ─── Status chip config ─────────────────────────────────────────────────────────

const STATUS_CHIP: Record<
  RowState["status"],
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  idle:   { label: "No changes", color: "default" },
  edited: { label: "Edited",     color: "warning"  },
  saving: { label: "Saving…",    color: "info"     },
  saved:  { label: "Saved ✓",    color: "success"  },
  error:  { label: "Error",      color: "error"    },
};

// ─── Stat card ──────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "none",
    }}
  >
    <H3 color={color} mb={0.25}>
      {value}
    </H3>
    <Small color="text.secondary" fontWeight={700}>
      {label}
    </Small>
  </Card>
);

// ─── Main Component ─────────────────────────────────────────────────────────────

const VendorProductManagementPageView = ({ userId, storeId }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useGetVendorProductsQuery(
    { userId, storeId },
    { skip: !userId || !storeId }
  );

  const [updateVariant] = useUpdateProductVariantMutation();
  const products: Product1[] = data?.data ?? [];

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("none");

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getState = useCallback(
    (variant: ProductVariant): RowState =>
      rowStates[variant.id] ?? {
        newStock: variant.units,
        newPrice: variant.price,
        status: "idle",
      },
    [rowStates]
  );

  const patchState = useCallback(
    (variantId: string, patch: Partial<RowState>) =>
      setRowStates((prev) => {
        const existing = prev[variantId] ?? { newStock: 0, newPrice: 0, status: "idle" as const };
        return {
          ...prev,
          [variantId]: { ...existing, ...patch } as RowState,
        };
      }),
    []
  );

  const isChanged = useCallback(
    (variant: ProductVariant) => {
      const s = getState(variant);
      return s.newStock !== variant.units || s.newPrice !== variant.price;
    },
    [getState]
  );

  // ── Save single row ───────────────────────────────────────────────────────────

  const saveRow = useCallback(
    async (product: Product1, variant: ProductVariant) => {
      const s = getState(variant);
      patchState(variant.id, { status: "saving" });
      try {
        await updateVariant({
          userId,
          storeId,
          productId: product.id,
          variantId: variant.id,
          body: { units: s.newStock, price: s.newPrice },
        }).unwrap();
        patchState(variant.id, { status: "saved" });
        enqueueSnackbar(`"${product.name}" saved successfully`, {
          variant: "success",
        });
        setTimeout(() => patchState(variant.id, { status: "idle" }), 1500);
      } catch {
        patchState(variant.id, { status: "error" });
        enqueueSnackbar("Save failed. Please try again.", { variant: "error" });
      }
    },
    [getState, patchState, updateVariant, userId, storeId, enqueueSnackbar]
  );

  // ── Flat rows: one per variant ────────────────────────────────────────────────

  const flatRows = useMemo(
    () =>
      products.flatMap((product) =>
        (product.variants ?? []).map((variant) => ({ product, variant }))
      ),
    [products]
  );

  // ── Save all edited ───────────────────────────────────────────────────────────

  const saveAll = async () => {
    const edited = flatRows.filter(({ variant }) => isChanged(variant));
    if (!edited.length) {
      enqueueSnackbar("No changes to save.", { variant: "info" });
      return;
    }
    await Promise.all(
      edited.map(({ product, variant }) => saveRow(product, variant))
    );
  };

  // ── Discard all ───────────────────────────────────────────────────────────────

  const discardAll = () => {
    setRowStates({});
    enqueueSnackbar("All changes discarded.", { variant: "info" });
  };

  // ── Filter + Sort ─────────────────────────────────────────────────────────────

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = flatRows.filter(
      ({ product, variant }) =>
        product.name.toLowerCase().includes(q) ||
        variant.sku?.toLowerCase().includes(q)
    );
    switch (sort) {
      case "stock-asc":  filtered.sort((a, b) => a.variant.units - b.variant.units); break;
      case "stock-desc": filtered.sort((a, b) => b.variant.units - a.variant.units); break;
      case "price-asc":  filtered.sort((a, b) => a.variant.price - b.variant.price); break;
      case "price-desc": filtered.sort((a, b) => b.variant.price - a.variant.price); break;
    }
    return filtered;
  }, [flatRows, search, sort]);

  const editedCount = flatRows.filter(({ variant }) => isChanged(variant)).length;

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const inStock    = flatRows.filter(({ variant }) => variant.units > 0).length;
  const outOfStock = flatRows.filter(({ variant }) => variant.units === 0).length;
  const lowStock   = flatRows.filter(({ variant }) => variant.units > 0 && variant.units <= 5).length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Page header */}
      <FlexBetween mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <H3 mb={0.5}>Products</H3>
          <Paragraph color="text.secondary">
            Update stock and prices. Save per product or save all changes in one go.
          </Paragraph>
        </Box>
        {editedCount > 0 && (
          <Chip
            label={`${editedCount} unsaved ${editedCount === 1 ? "change" : "changes"}`}
            color="warning"
            sx={{ fontWeight: 800 }}
          />
        )}
      </FlexBetween>

      {/* Stats */}
      {isLoading ? (
        <Grid container spacing={2} mb={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Total Variants" value={flatRows.length} color="primary.main" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="In Stock"       value={inStock}         color="success.main" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Out of Stock"   value={outOfStock}      color="error.main"   />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Low Stock (≤5)" value={lowStock}        color="warning.main" />
          </Grid>
        </Grid>
      )}

      {/* Toolbar */}
      <Card
        sx={{
          p: 2, mb: 2,
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5,
          borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none",
        }}
      >
        <TextField
          size="small"
          placeholder="Search item code or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 260, flexShrink: 0 }}
        />

        <Select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          sx={{ minWidth: 185, fontWeight: 700 }}
        >
          <MenuItem value="none">↕ Sort: None</MenuItem>
          <MenuItem value="stock-asc">Stock: Low → High</MenuItem>
          <MenuItem value="stock-desc">Stock: High → Low</MenuItem>
          <MenuItem value="price-asc">Price: Low → High</MenuItem>
          <MenuItem value="price-desc">Price: High → Low</MenuItem>
        </Select>

        <Box flex={1} />

        <Button
          variant="outlined"
          color="error"
          onClick={discardAll}
          sx={{ fontWeight: 800 }}
        >
          Discard Changes
        </Button>

        <LoadingButton
          variant="contained"
          onClick={saveAll}
          sx={{ fontWeight: 800 }}
        >
          Save All Changes
        </LoadingButton>

        <Small color="text.disabled" fontWeight={700} sx={{ width: "100%", mt: 0.5 }}>
          Tip: Edit "New stock" or "New price" to enable Save.
        </Small>
      </Card>

      {/* Table */}
      <Card
        sx={{
          borderRadius: 3, border: "1px solid", borderColor: "divider",
          boxShadow: "none", overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {[
                  { label: "Product",     minWidth: 280 },
                  { label: "SKU",         minWidth: 110 },
                  { label: "Stock",       minWidth: 220 },
                  { label: "Price (LKR)", minWidth: 260 },
                  { label: "Status",      minWidth: 130 },
                  { label: "Actions",     minWidth: 210, align: "right" as const },
                ].map((col) => (
                  <TableCell
                    key={col.label}
                    align={col.align}
                    sx={{
                      minWidth: col.minWidth,
                      fontWeight: 900, fontSize: 11,
                      textTransform: "uppercase", letterSpacing: ".4px",
                      color: "text.secondary",
                      borderBottom: "1.5px solid", borderColor: "divider",
                      py: 1.5,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Loading skeletons */}
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="rounded" height={36} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* Empty state */}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Paragraph color="text.disabled" fontWeight={700}>
                      No products found.
                    </Paragraph>
                  </TableCell>
                </TableRow>
              )}

              {/* Data rows */}
              {!isLoading &&
                rows.map(({ product, variant }) => {
                  const s        = getState(variant);
                  const changed  = isChanged(variant);
                  const isSaving = s.status === "saving";
                  const chip     = STATUS_CHIP[s.status];

                  return (
                    <TableRow
                      key={variant.id}
                      sx={{ "&:hover": { bgcolor: "grey.50" } }}
                    >
                      {/* Product */}
                      <TableCell>
                        <FlexBox alignItems="center" gap={1.5}>
                          <Avatar
                            variant="rounded"
                            alt={product.name}
                            sx={{
                              width: 44, height: 44,
                              bgcolor: "primary.100",
                              color: "primary.main",
                              fontWeight: 900, fontSize: 14,
                              border: "1px solid", borderColor: "divider",
                              flexShrink: 0,
                            }}
                          >
                            {product.name.charAt(0)}
                          </Avatar>
                          <Box overflow="hidden">
                            <H6 fontWeight={800} fontSize={13.5} noWrap title={product.name}>
                              {product.name}
                            </H6>
                            <Small color="text.disabled" fontWeight={700}>
                              {variant.attributes?.map((a) => a.value).join(" / ") || "Default"}
                            </Small>
                          </Box>
                        </FlexBox>
                      </TableCell>

                      {/* SKU */}
                      <TableCell>
                        <Span fontWeight={800} fontSize={13}>{variant.sku ?? "—"}</Span>
                      </TableCell>

                      {/* Stock */}
                      <TableCell>
                        <FlexBox alignItems="flex-end" gap={2}>
                          <Box minWidth={60}>
                            <Small
                              color="text.disabled" fontWeight={800} display="block" mb={0.5}
                              sx={{ textTransform: "uppercase", fontSize: 10.5 }}
                            >
                              Current
                            </Small>
                            <Span
                              fontWeight={800}
                              color={
                                variant.units === 0  ? "error.main"   :
                                variant.units <= 5   ? "warning.main" : "success.main"
                              }
                            >
                              {variant.units === 0 ? "Out of stock" : variant.units}
                            </Span>
                          </Box>
                          <Box>
                            <Small
                              color="text.disabled" fontWeight={800} display="block" mb={0.5}
                              sx={{ textTransform: "uppercase", fontSize: 10.5 }}
                            >
                              New
                            </Small>
                            <TextField
                              size="small" type="number"
                              disabled={isSaving}
                              value={s.newStock}
                              slotProps={{ htmlInput: { min: 0, step: 1 } }}
                              onChange={(e) =>
                                patchState(variant.id, {
                                  newStock: Math.max(0, Number(e.target.value)),
                                  newPrice: s.newPrice,
                                  status: "edited",
                                })
                              }
                              sx={{ width: 90 }}
                            />
                          </Box>
                        </FlexBox>
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <FlexBox alignItems="flex-end" gap={2}>
                          <Box minWidth={90}>
                            <Small
                              color="text.disabled" fontWeight={800} display="block" mb={0.5}
                              sx={{ textTransform: "uppercase", fontSize: 10.5 }}
                            >
                              Current
                            </Small>
                            <Span fontWeight={800}>
                              <Box component="span" sx={{ color: "text.disabled", fontWeight: 900, fontSize: 11, mr: 0.5 }}>
                                LKR
                              </Box>
                              {variant.price.toLocaleString("en-LK")}
                            </Span>
                          </Box>
                          <Box>
                            <Small
                              color="text.disabled" fontWeight={800} display="block" mb={0.5}
                              sx={{ textTransform: "uppercase", fontSize: 10.5 }}
                            >
                              New
                            </Small>
                            <TextField
                              size="small" type="number"
                              disabled={isSaving}
                              value={s.newPrice}
                              slotProps={{
                                htmlInput: { min: 0, step: 0.01 },
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Small fontWeight={900} color="text.disabled" fontSize={11}>
                                        LKR
                                      </Small>
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              onChange={(e) =>
                                patchState(variant.id, {
                                  newStock: s.newStock,
                                  newPrice: Math.max(0, Number(e.target.value)),
                                  status: "edited",
                                })
                              }
                              sx={{ width: 140 }}
                            />
                          </Box>
                        </FlexBox>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={chip.label}
                          color={chip.color}
                          sx={{ fontWeight: 800, fontSize: 11.5 }}
                          icon={
                            isSaving
                              ? <CircularProgress size={10} color="inherit" />
                              : undefined
                          }
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <FlexBox gap={1} justifyContent="flex-end">
                          <LoadingButton
                            size="small" variant="contained"
                            loading={isSaving}
                            disabled={!changed}
                            onClick={() => saveRow(product, variant)}
                            sx={{ fontWeight: 800, minWidth: 70 }}
                          >
                            Save
                          </LoadingButton>
                          <Button
                            size="small" variant="outlined"
                            disabled={isSaving}
                            onClick={() =>
                              patchState(variant.id, {
                                newStock: variant.units,
                                newPrice: variant.price,
                                status: "idle",
                              })
                            }
                            sx={{ fontWeight: 800 }}
                          >
                            Reset
                          </Button>
                        </FlexBox>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        {!isLoading && (
          <FlexBetween
            px={2} py={1.25}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          >
            <Small color="text.disabled" fontWeight={700}>
              Showing {rows.length} of {flatRows.length} variants
            </Small>
            <Small color="text.disabled" fontWeight={700}>
              Tip: Edit "New stock" or "New price" to enable Save
            </Small>
          </FlexBetween>
        )}
      </Card>
    </Box>
  );
};

export default VendorProductManagementPageView;
