"use client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { ReduxProvider } from "./redux/provider";

const theme = createTheme({
  palette: {
    primary: { main: "#dc2626" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error:   { main: "#dc2626" },
    background: { default: "#f0f2f5" },
  },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { background: "#f0f2f5" } },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReduxProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          {children}
        </SnackbarProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
