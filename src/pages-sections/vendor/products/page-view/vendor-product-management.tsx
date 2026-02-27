
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import Fade from "@mui/material/Fade";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { H3, H6, Paragraph, Small, Span } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { Product1, ProductVariant } from "models/Product.model";
import {
  useGetVendorProductsQuery,
  useBulkSaveVariantsMutation,
  SaveDetail,
} from "services/vendor-api";
import ReplayIcon from "@mui/icons-material/Replay";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DiscountType = "%" | "LKR";

interface RowState {
  newStock: number;
  newPrice: number;
  discountType: DiscountType;
  discountValue: number;
  status: "idle" | "edited" | "saving" | "saved" | "error";
}

interface Props {
  userId: string;
  storeId: string;
}

// ─── Status chip config ────────────────────────────────────────────────────────

const STATUS_CHIP: Record<
  RowState["status"],
  { label: string; color: "default" | "warning" | "info" | "success" | "error" }
> = {
  idle:   { label: "No changes", color: "default" },
  edited: { label: "Edited",     color: "warning"  },
  saving: { label: "Saving…",    color: "info"     },
  saved:  { label: "Saved",      color: "success"  },
  error:  { label: "Error",      color: "error"    },
};

// ─── Helper: compute discounted price preview ──────────────────────────────────

function applyDiscount(basePrice: number, type: DiscountType, value: number): number {
  if (!value || value <= 0) return basePrice;
  if (type === "%") {
    const pct = Math.min(value, 100);
    return Math.max(0, Math.round((basePrice * (1 - pct / 100)) * 100) / 100);
  }
  return Math.max(0, Math.round((basePrice - value) * 100) / 100);
}

// ─── Helper: build a SaveDetail from product + variant + state ────────────────

function buildSaveDetail(
  product: Product1,
  variant: ProductVariant,
  s: RowState
): SaveDetail {
  return {
    productId:         product.id,
    variantId:         variant.id,
    newStock:          s.newStock,
    newPrice:          s.newPrice,
    newDiscount:       s.discountValue,
    discountType:      s.discountType,
    isDiscountPercent: s.discountType === "%",
  };
}

// ─── NumericField ──────────────────────────────────────────────────────────────
// Fixes the leading-zero problem:
//   • Uses type="text" so the browser doesn't add spin arrows or enforce number formatting
//   • Tracks a local `display` string so the vendor can freely delete and retype
//   • On focus → selects all text (vendor just starts typing their number)
//   • On blur  → parses and commits; empty/invalid falls back to 0
//   • Parent numeric value syncs the display whenever it changes externally (reset/discard)

interface NumericFieldProps {
  value: number;                          // controlled numeric value from parent
  disabled?: boolean;
  min?: number;
  inputStyle?: React.CSSProperties;       // passed straight to the <input> element
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  sx?: object;
  onChange: (committed: number) => void;  // called with parsed number on every valid keystroke & blur
}

const NumericField = ({
  value,
  disabled,
  min = 0,
  inputStyle,
  startAdornment,
  endAdornment,
  sx,
  onChange,
}: NumericFieldProps) => {
  const [display, setDisplay] = useState<string>(value === 0 ? "0" : String(value));
  const committedRef = useRef<number>(value);

  // Sync display when parent resets/discards the value externally
  if (committedRef.current !== value) {
    committedRef.current = value;
    setDisplay(value === 0 ? "0" : String(value));
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all → vendor just types the new number without needing to delete first
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow: empty string (mid-delete), digits, one decimal point
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      setDisplay(raw);
      // Notify parent while typing so the row shows "Edited" immediately
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        const safe = Math.max(min, parsed);
        committedRef.current = safe;
        onChange(safe);
      }
    }
  };

  const handleBlur = () => {
    // Commit: empty or invalid → fall back to min (usually 0)
    const parsed = parseFloat(display);
    const committed = isNaN(parsed) ? min : Math.max(min, parsed);
    committedRef.current = committed;
    setDisplay(String(committed));
    onChange(committed);
  };

  return (
    <TextField
      type="text"
      inputMode="decimal"
      size="small"
      disabled={disabled}
      value={display}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      slotProps={{
        htmlInput: { style: inputStyle },
        input: {
          startAdornment: startAdornment
            ? <InputAdornment position="start">{startAdornment}</InputAdornment>
            : undefined,
          endAdornment: endAdornment
            ? <InputAdornment position="end">{endAdornment}</InputAdornment>
            : undefined,
        },
      }}
      sx={sx}
    />
  );
};

// ─── Sub-component: product avatar with hover preview (desktop) ───────────────

interface ProductAvatarWithPreviewProps {
  product: Product1;
  variant: ProductVariant;
}

const ProductAvatarWithPreview = ({ product, variant }: ProductAvatarWithPreviewProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const imageUrl = product.images?.[0];
  const variantLabel = variant.attributes?.map((a) => a.value).join(" / ") || "Default";

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    timerRef.current = setTimeout(() => setAnchorEl(target), 250);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnchorEl(null);
  };

  return (
    <>
      <Avatar
        src={imageUrl}
        variant="rounded"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ width: 42, height: 42, bgcolor: "grey.200", fontWeight: 900, fontSize: 16, cursor: "default", flexShrink: 0, border: "1.5px solid", borderColor: "divider" }}
      >
        {!imageUrl && (product.name?.charAt(0)?.toUpperCase() || <ImageIcon fontSize="small" />)}
      </Avatar>

      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="right-start" transition sx={{ zIndex: 1400 }}>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={180}>
            <Paper elevation={8} sx={{ width: 220, borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ width: "100%", height: 160, position: "relative", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {imageUrl ? (
                  <Box component="img" src={imageUrl} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Box sx={{ textAlign: "center", color: "text.disabled" }}>
                    <ImageIcon sx={{ fontSize: 40, mb: 0.5 }} />
                    <Small fontWeight={700} display="block">No image</Small>
                  </Box>
                )}
                {product.brand && (
                  <Box sx={{ position: "absolute", top: 8, left: 8, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, fontWeight: 800, px: 0.75, py: 0.25, borderRadius: 1, backdropFilter: "blur(4px)", letterSpacing: ".3px" }}>
                    {product.brand}
                  </Box>
                )}
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "#fff" }}>
                <H6 fontWeight={800} fontSize={12.5} noWrap title={product.name} sx={{ mb: 0.4 }}>{product.name}</H6>
                <Small color="text.secondary" fontWeight={700} display="block">{variantLabel}</Small>
                
                {product.category && (
                  <FlexBox alignItems="center" justifyContent="space-between" mt={0.5}>
                    <Small color="text.disabled" fontWeight={700} fontSize={10.5}>CATEGORY</Small>
                    <Chip label={product.category.name} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 800, "& .MuiChip-label": { px: 0.75 } }} />
                  </FlexBox>
                )}
              </Box>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

// ─── StatCard ──────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Card sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
    <Span fontWeight={900} fontSize={26} color={color}>{value}</Span>
    <Paragraph color="text.secondary" fontWeight={700} fontSize={13} mt={0.25}>{label}</Paragraph>
  </Card>
);

// ─── Edit Dialog (mobile popup) ────────────────────────────────────────────────

interface EditDialogProps {
  open: boolean;
  product: Product1 | null;
  variant: ProductVariant | null;
  state: RowState | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onPatch: (patch: Partial<RowState>) => void;
}

const EditDialog = ({
  open, product, variant, state, isSaving, onClose, onSave, onPatch,
}: EditDialogProps) => {
  if (!product || !variant || !state) return null;

  const imageUrl = product.images?.[0];
  const savedDiscount = variant.discount ?? 0;
  const savedDiscType = (variant.discountType as DiscountType) ?? "%";
  const discountPreviewPrice =
    state.discountValue > 0
      ? applyDiscount(variant.price, state.discountType, state.discountValue)
      : null;

  const changed =
    state.newStock !== variant.units ||
    state.newPrice !== variant.price ||
    state.discountValue !== (variant.discount ?? 0) ||
    state.discountType !== ((variant.discountType as DiscountType) ?? "%");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{ sx: { bgcolor: "grey.50" } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={onClose} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1} overflow="hidden">
          <H6 fontWeight={800} fontSize={14} noWrap>{product.name}</H6>
          <Small color="text.disabled" fontWeight={700}>{variant.sku ?? "—"}</Small>
        </Box>
        <Chip
          size="small"
          label={STATUS_CHIP[state.status].label}
          color={STATUS_CHIP[state.status].color}
          sx={{ fontWeight: 800, fontSize: 11 }}
        />
      </Box>

      <DialogContent sx={{ p: 2, pt: 2.5 }}>
        {/* Product image */}
        <Box
          sx={{
            width: "100%",
            height: 200,
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            position: "relative",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {imageUrl ? (
            <Box component="img" src={imageUrl} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Box sx={{ textAlign: "center", color: "text.disabled" }}>
              <ImageIcon sx={{ fontSize: 48, mb: 1 }} />
              <Small fontWeight={700}>No image available</Small>
            </Box>
          )}
          {product.brand && (
            <Box sx={{ position: "absolute", top: 10, left: 10, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 800, px: 1, py: 0.4, borderRadius: 1.5, backdropFilter: "blur(4px)" }}>
              {product.brand}
            </Box>
          )}
        </Box>

        {/* ── Stock ── */}
        <Card sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <Small fontWeight={900} sx={{ textTransform: "uppercase", fontSize: 11, letterSpacing: ".5px", color: "text.secondary", display: "block", mb: 1.5 }}>
            Stock
          </Small>
          <FlexBox gap={2}>
            <Box flex={1}>
              <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.5 }}>Current</Small>
              <Span
                fontWeight={800} fontSize={15}
                color={variant.units === 0 ? "error.main" : variant.units <= 5 ? "warning.main" : "success.main"}
              >
                {variant.units === 0 ? "Out of stock" : variant.units}
              </Span>
            </Box>
            <Box flex={1}>
              <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.5 }}>New</Small>
              {/* ✅ NumericField — no leading zero problem */}
              <NumericField
                value={state.newStock}
                disabled={isSaving}
                sx={{ width: "100%" }}
                onChange={(num) => onPatch({ newStock: num, status: "edited" })}
              />
            </Box>
          </FlexBox>
        </Card>

        {/* ── Price ── */}
        <Card sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <Small fontWeight={900} sx={{ textTransform: "uppercase", fontSize: 11, letterSpacing: ".5px", color: "text.secondary", display: "block", mb: 1.5 }}>
            Price (LKR)
          </Small>
          <FlexBox gap={2}>
            <Box flex={1}>
              <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.5 }}>Current</Small>
              <Span fontWeight={800} fontSize={15}>
                <Box component="span" sx={{ color: "text.disabled", fontWeight: 900, fontSize: 11, mr: 0.5 }}>LKR</Box>
                {variant.price.toLocaleString("en-LK")}
              </Span>
            </Box>
            <Box flex={1}>
              <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.5 }}>New</Small>
              {/* ✅ NumericField — no leading zero problem */}
              <NumericField
                value={state.newPrice}
                disabled={isSaving}
                startAdornment={<Small fontWeight={900} color="text.disabled" fontSize={11}>LKR</Small>}
                sx={{ width: "100%" }}
                onChange={(num) => onPatch({ newPrice: num, status: "edited" })}
              />
            </Box>
          </FlexBox>
        </Card>

        {/* ── Discount ── */}
        <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <Small fontWeight={900} sx={{ textTransform: "uppercase", fontSize: 11, letterSpacing: ".5px", color: "text.secondary", display: "block", mb: 1.5 }}>
            Discount
          </Small>

          {savedDiscount > 0 ? (
            <Small display="block" mb={1} fontWeight={700} color="success.main">
              Current: {savedDiscount}{savedDiscType} off
            </Small>
          ) : (
            <Small display="block" mb={1} color="text.disabled" fontWeight={700}>No current discount</Small>
          )}

          <FlexBox gap={1} alignItems="center">
            {/* Type toggle */}
            <Box sx={{ display: "flex", border: "1.5px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
              {(["%", "LKR"] as DiscountType[]).map((t) => (
                <Box
                  key={t}
                  onClick={() => !isSaving && onPatch({ discountType: t, status: "edited" })}
                  sx={{
                    px: 1.5, py: 0.75, fontSize: 12, fontWeight: 800, cursor: isSaving ? "default" : "pointer",
                    bgcolor: state.discountType === t ? "primary.main" : "transparent",
                    color: state.discountType === t ? "#fff" : "text.secondary",
                    transition: "all 0.15s",
                    opacity: isSaving ? 0.5 : 1,
                  }}
                >
                  {t}
                </Box>
              ))}
            </Box>
            {/* ✅ NumericField — no leading zero problem */}
            <NumericField
              value={state.discountValue}
              disabled={isSaving}
              endAdornment={<Small fontWeight={900} color="text.disabled" fontSize={11}>{state.discountType}</Small>}
              sx={{ flex: 1 }}
              onChange={(val) => {
                onPatch({
                  discountValue: val,
                  status: val > 0 || state.newStock !== variant.units || state.newPrice !== variant.price ? "edited" : "idle",
                });
              }}
            />
          </FlexBox>

          {discountPreviewPrice !== null && (
            <Small display="block" mt={1} fontWeight={800} color="primary.main" fontSize={12}>
              → After discount: LKR {discountPreviewPrice.toLocaleString("en-LK")}
            </Small>
          )}
        </Card>

        {/* ── Action buttons ── */}
        <FlexBox gap={1.5} flexDirection="column">
          <LoadingButton
            variant="contained" fullWidth size="large"
            loading={isSaving} disabled={!changed}
            onClick={onSave}
            sx={{ fontWeight: 800, borderRadius: 2.5, py: 1.25 }}
          >
            Save Changes
          </LoadingButton>
          <Button
            variant="outlined" fullWidth size="large"
            disabled={isSaving}
            onClick={onClose}
            sx={{ fontWeight: 800, borderRadius: 2.5, py: 1.25 }}
          >
            Back
          </Button>
        </FlexBox>
      </DialogContent>
    </Dialog>
  );
};

// ─── Mobile Product Card ───────────────────────────────────────────────────────

interface MobileProductCardProps {
  product: Product1;
  variant: ProductVariant;
  state: RowState;
  onEdit: () => void;
}

const MobileProductCard = ({ product, variant, state, onEdit }: MobileProductCardProps) => {
  const imageUrl = product.images?.[0];
  const savedDiscount = variant.discount ?? 0;
  const savedDiscType = (variant.discountType as DiscountType) ?? "%";
  const chip = STATUS_CHIP[state.status];

  return (
    <Card sx={{
      borderRadius: 3, border: "1px solid", borderColor: "divider",
      boxShadow: "none", overflow: "hidden", position: "relative",
      ...(state.status === "edited" && { borderColor: "warning.main", borderWidth: 1.5 }),
    }}>
      {/* Edit button — top-right corner */}
      <IconButton
        onClick={onEdit}
        size="small"
        sx={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          bgcolor: "background.paper", border: "1px solid",
          borderColor: "divider", boxShadow: 1,
          "&:hover": { bgcolor: "primary.main", color: "#fff", borderColor: "primary.main" },
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      {/* Product image + name */}
      <FlexBox alignItems="center" gap={1.5} p={1.5} pb={1}>
        <Avatar
          src={imageUrl}
          variant="rounded"
          sx={{ width: 56, height: 56, bgcolor: "grey.200", flexShrink: 0, border: "1.5px solid", borderColor: "divider", borderRadius: 2 }}
        >
          {!imageUrl && (product.name?.charAt(0)?.toUpperCase() || <ImageIcon fontSize="small" />)}
        </Avatar>
        <Box overflow="hidden" pr={4}>
          <H6 fontWeight={800} fontSize={13.5} noWrap title={product.name}>{product.name}</H6>
          <Small color="text.disabled" fontWeight={700}>{variant.sku ?? "—"}</Small>
        </Box>
      </FlexBox>

      <Divider />

      {/* Stats row: Stock | Price | Discount */}
      <FlexBox px={1.5} py={1.25} gap={0} sx={{ "& > *": { flex: 1 } }}>
        {/* Stock */}
        <Box>
          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 9.5, letterSpacing: ".3px", display: "block", mb: 0.4 }}>Stock</Small>
          <Span
            fontWeight={800} fontSize={13}
            color={variant.units === 0 ? "error.main" : variant.units <= 5 ? "warning.main" : "text.primary"}
          >
            {variant.units === 0 ? "Out" : variant.units}
          </Span>
        </Box>

        {/* Divider */}
        <Box sx={{ width: "1px", bgcolor: "divider", mx: 1, alignSelf: "stretch" }} />

        {/* Price */}
        <Box>
          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 9.5, letterSpacing: ".3px", display: "block", mb: 0.4 }}>Price</Small>
          <Span fontWeight={800} fontSize={13}>
            <Box component="span" sx={{ fontSize: 10, fontWeight: 700, color: "text.disabled", mr: 0.3 }}>LKR</Box>
            {variant.price.toLocaleString("en-LK")}
          </Span>
        </Box>

        {/* Divider */}
        <Box sx={{ width: "1px", bgcolor: "divider", mx: 1, alignSelf: "stretch" }} />

        {/* Discount */}
        <Box>
          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 9.5, letterSpacing: ".3px", display: "block", mb: 0.4 }}>Discount</Small>
          {savedDiscount > 0 ? (
            <Span fontWeight={800} fontSize={13} color="success.main">{savedDiscount}{savedDiscType}</Span>
          ) : (
            <Span fontWeight={700} fontSize={12} color="text.disabled">None</Span>
          )}
        </Box>
      </FlexBox>

      {/* Status badge */}
      {state.status !== "idle" && (
        <Box px={1.5} pb={1.25}>
          <Chip
            size="small" label={chip.label} color={chip.color}
            sx={{ fontWeight: 800, fontSize: 10.5, height: 20 }}
            icon={state.status === "saving" ? <CircularProgress size={9} color="inherit" /> : undefined}
          />
        </Box>
      )}
    </Card>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const VendorProductManagementPageView = ({ userId, storeId }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading } = useGetVendorProductsQuery(
    { storeId },
    { skip: !storeId }
  );

  // ✅ Single mutation used for both single-save and save-all
  const [bulkSave] = useBulkSaveVariantsMutation();

  const products: Product1[] = data?.data ?? [];

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("stock-asc");

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<{ product: Product1; variant: ProductVariant } | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getState = useCallback(
    (variant: ProductVariant): RowState =>
      rowStates[variant.id] ?? {
        newStock:      variant.units,
        newPrice:      variant.price,
        discountType:  (variant.discountType as DiscountType) ?? "%",
        discountValue: variant.discount ?? 0,
        status: "idle",
      },
    [rowStates]
  );

  const makeDefaults = (variant: ProductVariant) => ({
    units:        variant.units,
    price:        variant.price,
    discount:     variant.discount ?? 0,
    discountType: (variant.discountType as DiscountType) ?? "%",
  });

  const patchState = useCallback(
    (
      variantId: string,
      defaults: { units: number; price: number; discount: number; discountType: DiscountType },
      patch: Partial<RowState>
    ) =>
      setRowStates((prev) => {
        const existing = prev[variantId] ?? {
          newStock:      defaults.units,
          newPrice:      defaults.price,
          discountType:  defaults.discountType,
          discountValue: defaults.discount,
          status: "idle" as const,
        };
        return { ...prev, [variantId]: { ...existing, ...patch } as RowState };
      }),
    []
  );

  const isChanged = useCallback(
    (variant: ProductVariant) => {
      const s = getState(variant);
      return (
        s.newStock      !== variant.units ||
        s.newPrice      !== variant.price ||
        s.discountValue !== (variant.discount ?? 0) ||
        s.discountType  !== ((variant.discountType as DiscountType) ?? "%")
      );
    },
    [getState]
  );

  // ── Save single row → 1 item in listUpdateDetails[] ──────────────────────────

  const saveRow = useCallback(
    async (product: Product1, variant: ProductVariant) => {
      const s = getState(variant);
      const defaults = makeDefaults(variant);
      patchState(variant.id, defaults, { status: "saving" });

      try {
        await bulkSave({
          storeId,
          items: [buildSaveDetail(product, variant, s)],
        }).unwrap();

        setRowStates((prev) => {
          const next = { ...prev };
          delete next[variant.id];
          return next;
        });

        enqueueSnackbar(`"${product.name}" saved successfully`, { variant: "success" });
        setEditTarget(null);
      } catch (err) {
        console.error("[saveRow] failed:", err);
        patchState(variant.id, defaults, { status: "error" });
        enqueueSnackbar("Save failed. Please try again.", { variant: "error" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getState, patchState, bulkSave, storeId, enqueueSnackbar]
  );

  // ── Flat rows ─────────────────────────────────────────────────────────────────

  const flatRows = useMemo(
    () => products.flatMap((product) =>
      (product.variants ?? []).map((variant) => ({ product, variant }))
    ),
    [products]
  );

  // ── Save all → ONE request with all changed items in listUpdateDetails[] ──────

  const saveAll = async () => {
    const edited = flatRows.filter(({ variant }) => isChanged(variant));
    if (!edited.length) { enqueueSnackbar("No changes to save.", { variant: "info" }); return; }

    // Mark all as saving
    setRowStates((prev) => {
      const next = { ...prev };
      for (const { variant } of edited) {
        if (next[variant.id]) next[variant.id] = { ...next[variant.id], status: "saving" };
      }
      return next;
    });

    try {
      await bulkSave({
        storeId,
        items: edited.map(({ product, variant }) =>
          buildSaveDetail(product, variant, getState(variant))
        ),
      }).unwrap();

      setRowStates((prev) => {
        const next = { ...prev };
        for (const { variant } of edited) delete next[variant.id];
        return next;
      });

      enqueueSnackbar(`${edited.length} product${edited.length !== 1 ? "s" : ""} saved successfully`, { variant: "success" });
    } catch (err) {
      console.error("[saveAll] failed:", err);
      setRowStates((prev) => {
        const next = { ...prev };
        for (const { variant } of edited) {
          if (next[variant.id]) next[variant.id] = { ...next[variant.id], status: "error" };
        }
        return next;
      });
      enqueueSnackbar("Bulk save failed. Please try again.", { variant: "error" });
    }
  };

  const discardAll = () => {
    setRowStates({});
    enqueueSnackbar("All changes discarded.", { variant: "info" });
  };

  // ── Filter + Sort ─────────────────────────────────────────────────────────────

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = flatRows.filter(({ product, variant }) =>
      product.name.toLowerCase().includes(q) || variant.sku?.toLowerCase().includes(q)
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
  const inStock     = flatRows.filter(({ variant }) => variant.units > 0).length;
  const outOfStock  = flatRows.filter(({ variant }) => variant.units === 0).length;
  const lowStock    = flatRows.filter(({ variant }) => variant.units > 0 && variant.units <= 5).length;

  // Edit dialog handlers
  const editState    = editTarget ? getState(editTarget.variant) : null;
  const editDefaults = editTarget ? makeDefaults(editTarget.variant) : null;

  const handleEditPatch = (patch: Partial<RowState>) => {
    if (!editTarget || !editDefaults) return;
    patchState(editTarget.variant.id, editDefaults, patch);
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    saveRow(editTarget.product, editTarget.variant);
  };

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
          <Grid item xs={6} sm={3}><StatCard label="Total Products" value={flatRows.length} color="primary.main" /></Grid>
          <Grid item xs={6} sm={3}><StatCard label="In Stock"       value={inStock}         color="success.main" /></Grid>
          <Grid item xs={6} sm={3}><StatCard label="Out of Stock"   value={outOfStock}      color="error.main"   /></Grid>
          <Grid item xs={6} sm={3}><StatCard label="Low Stock (≤5)" value={lowStock}        color="warning.main" /></Grid>
        </Grid>
      )}

      {/* Toolbar */}
      <Card sx={{ p: 2, mb: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
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
        <Select size="small" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 185, fontWeight: 700 }}>
          <MenuItem value="none">↕ Sort: None</MenuItem>
          <MenuItem value="stock-asc">Stock: Low → High</MenuItem>
          <MenuItem value="stock-desc">Stock: High → Low</MenuItem>
          <MenuItem value="price-asc">Price: Low → High</MenuItem>
          <MenuItem value="price-desc">Price: High → Low</MenuItem>
        </Select>
        <Box flex={1} />
        <Button variant="outlined" color="error" onClick={discardAll} sx={{ fontWeight: 800 }}>
          Discard Changes
        </Button>
        <LoadingButton variant="contained" onClick={saveAll} sx={{ fontWeight: 800 }}>
          Save All Changes
        </LoadingButton>
        <Small color="text.disabled" fontWeight={700} sx={{ width: "100%", mt: 0.5 }}>
          Tip: Edit "New stock", "New price", or "Discount" to enable Save. Hover over the product thumbnail for a larger preview.
        </Small>
      </Card>

      {/* ── MOBILE: Card grid (hidden on md+) ── */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {isLoading ? (
          <Grid container spacing={1.5}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} key={i}>
                <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : rows.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Paragraph color="text.disabled" fontWeight={700}>No products found.</Paragraph>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {rows.map(({ product, variant }) => (
              <Grid item xs={12} key={variant.id}>
                <MobileProductCard
                  product={product}
                  variant={variant}
                  state={getState(variant)}
                  onEdit={() => setEditTarget({ product, variant })}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ── DESKTOP: Table (hidden on xs/sm) ── */}
      <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none", overflow: "hidden", display: { xs: "none", md: "block" } }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["Product", "Stock", "Price (LKR)", "Discount", "Status", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px", color: "text.secondary", py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading && [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((__, j) => (
                    <TableCell key={j}><Skeleton variant="rounded" height={40} /></TableCell>
                  ))}
                </TableRow>
              ))}

              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Paragraph color="text.disabled" fontWeight={700}>No products found.</Paragraph>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && rows.map(({ product, variant }) => {
                const s        = getState(variant);
                const changed  = isChanged(variant);
                const isSaving = s.status === "saving";
                const chip     = STATUS_CHIP[s.status];
                const defaults = makeDefaults(variant);

                const discountPreviewPrice =
                  s.discountValue > 0
                    ? applyDiscount(s.newPrice, s.discountType, s.discountValue)
                    : null;

                return (
                  <TableRow
                    key={variant.id}
                    sx={{ "&:hover": { bgcolor: "grey.50" }, transition: "background 0.15s" }}
                  >
                    {/* ── Product ── */}
                    <TableCell>
                      <FlexBox alignItems="center" gap={1.5}>
                        <ProductAvatarWithPreview product={product} variant={variant} />
                        <Box>
                          <H6 fontWeight={800} fontSize={13}>{product.name}</H6>
                          <Small color="text.disabled" fontWeight={700}>{variant.sku ?? "—"}</Small>
                        </Box>
                      </FlexBox>
                    </TableCell>

                    {/* ── Stock ── */}
                    <TableCell>
                      <FlexBox alignItems="center" gap={2}>
                        <Box>
                          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.25 }}>Current</Small>
                          <Span
                            fontWeight={800} fontSize={14}
                            color={variant.units === 0 ? "error.main" : variant.units <= 5 ? "warning.main" : "text.primary"}
                          >
                            {variant.units}
                          </Span>
                        </Box>
                        <Box>
                          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.25 }}>New</Small>
                          {/* ✅ NumericField — vendor types freely, no leading zero */}
                          <NumericField
                            value={s.newStock}
                            disabled={isSaving}
                            inputStyle={{ width: 64, fontWeight: 800, padding: "5px 8px" }}
                            onChange={(num) => patchState(variant.id, defaults, { newStock: num, status: "edited" })}
                          />
                        </Box>
                      </FlexBox>
                    </TableCell>

                    {/* ── Price ── */}
                    <TableCell>
                      <FlexBox alignItems="center" gap={2}>
                        <Box>
                          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.25 }}>Current</Small>
                          <Span fontWeight={700} fontSize={13} color="text.secondary">
                            LKR {variant.price.toLocaleString("en-LK")}
                          </Span>
                        </Box>
                        <Box>
                          <Small color="text.disabled" fontWeight={800} sx={{ textTransform: "uppercase", fontSize: 10, display: "block", mb: 0.25 }}>New</Small>
                          {/* ✅ NumericField — vendor types freely, no leading zero */}
                          <NumericField
                            value={s.newPrice}
                            disabled={isSaving}
                            startAdornment={<Small fontWeight={700} color="text.disabled" fontSize={10}>LKR</Small>}
                            inputStyle={{ width: 90, fontWeight: 800, padding: "5px 4px" }}
                            onChange={(num) => patchState(variant.id, defaults, { newPrice: num, status: "edited" })}
                          />
                        </Box>
                      </FlexBox>
                    </TableCell>

                    {/* ── Discount ── */}
                    <TableCell>
                      <Box>
                        {(variant.discount ?? 0) > 0 && (
                          <Small color="success.main" fontWeight={800} display="block" mb={0.5} fontSize={11}>
                            CURRENT: {variant.discount}{variant.discountType ?? "%"}
                          </Small>
                        )}
                        <FlexBox alignItems="center" gap={0.75}>
                          {/* Type toggle */}
                          <Box sx={{ display: "flex", border: "1.5px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                            {(["%", "LKR"] as DiscountType[]).map((t) => (
                              <Box
                                key={t}
                                onClick={() => !isSaving && patchState(variant.id, defaults, { discountType: t, status: "edited" })}
                                sx={{
                                  px: 1, py: 0.4, fontSize: 11, fontWeight: 800,
                                  cursor: isSaving ? "default" : "pointer",
                                  bgcolor: s.discountType === t ? "primary.main" : "transparent",
                                  color: s.discountType === t ? "#fff" : "text.secondary",
                                  transition: "all 0.15s", userSelect: "none",
                                }}
                              >
                                {t}
                              </Box>
                            ))}
                          </Box>
                          {/* ✅ NumericField — vendor types freely, no leading zero */}
                          <NumericField
                            value={s.discountValue}
                            disabled={isSaving}
                            endAdornment={<Small fontWeight={700} color="text.disabled" fontSize={10}>{s.discountType}</Small>}
                            inputStyle={{ width: 52, fontWeight: 800, padding: "5px 4px" }}
                            sx={{ width: 110 }}
                            onChange={(num) => patchState(variant.id, defaults, {
                              discountValue: num,
                              status: "edited",
                            })}
                          />
                        </FlexBox>

                        {discountPreviewPrice !== null && (
                          <Small display="block" mt={0.75} fontWeight={800} color="primary.main" fontSize={11}>
                            → LKR {discountPreviewPrice.toLocaleString("en-LK")}
                          </Small>
                        )}
                      </Box>
                    </TableCell>

                    {/* ── Status ── */}
                    <TableCell>
                      <Chip
                        size="small" label={chip.label} color={chip.color}
                        sx={{ fontWeight: 800, fontSize: 11.5 }}
                        icon={isSaving ? <CircularProgress size={10} color="inherit" /> : undefined}
                      />
                    </TableCell>

                    {/* ── Actions ── */}
                    <TableCell align="right">
                      <FlexBox gap={1} justifyContent="flex-end">
                        <LoadingButton
                          size="small" variant="contained"
                          loading={isSaving} disabled={!changed}
                          onClick={() => saveRow(product, variant)}
                          sx={{ fontWeight: 800, minWidth: 70 }}
                        >
                          Save
                        </LoadingButton>
                        <IconButton
                          size="small"
                          disabled={isSaving || !changed}
                          onClick={() => patchState(variant.id, defaults, {
                            newStock:      defaults.units,
                            newPrice:      defaults.price,
                            discountType:  defaults.discountType,
                            discountValue: defaults.discount,
                            status: "idle",
                          })}
                          title="Reset changes"
                          sx={{
                            border: "1px solid",
                            borderColor: isSaving || !changed ? "divider" : "error.main",
                            color: isSaving || !changed ? "text.disabled" : "error.main",
                            "&:hover": { bgcolor: "error.main", color: "#fff", borderColor: "error.main" },
                          }}
                        >
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                      </FlexBox>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {!isLoading && (
          <FlexBetween px={2} py={1.25} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <Small color="text.disabled" fontWeight={700}>Showing {rows.length} of {flatRows.length} variants</Small>
            <Small color="text.disabled" fontWeight={700}>Tip: Hover thumbnail for product preview</Small>
          </FlexBetween>
        )}
      </Card>

      {/* Edit Dialog (mobile) */}
      <EditDialog
        open={Boolean(editTarget)}
        product={editTarget?.product ?? null}
        variant={editTarget?.variant ?? null}
        state={editState}
        isSaving={editState?.status === "saving"}
        onClose={() => setEditTarget(null)}
        onSave={handleEditSave}
        onPatch={handleEditPatch}
      />
    </Box>
  );
};

export default VendorProductManagementPageView;