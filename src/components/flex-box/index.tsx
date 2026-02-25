import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

export const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center",
});

export const FlexBetween = styled(FlexBox)({
  justifyContent: "space-between",
});
