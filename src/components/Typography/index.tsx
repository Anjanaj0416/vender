import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const H3 = styled(Typography)({
  fontSize: "1.25rem",
  fontWeight: 700,
  lineHeight: 1.3,
});
H3.defaultProps = { component: "h3" } as any;

export const H6 = styled(Typography)({
  fontSize: "0.875rem",
  fontWeight: 700,
  lineHeight: 1.4,
});
H6.defaultProps = { component: "h6" } as any;

export const Paragraph = styled(Typography)({
  fontSize: "0.875rem",
  lineHeight: 1.6,
});
Paragraph.defaultProps = { component: "p" } as any;

export const Small = styled(Typography)({
  fontSize: "0.75rem",
  lineHeight: 1.5,
});
Small.defaultProps = { component: "small" } as any;

export const Span = styled(Typography)({
  fontSize: "0.875rem",
});
Span.defaultProps = { component: "span" } as any;
