"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Root page — redirects to /dashboard (authenticated) or /login (unauthenticated).
 * The actual store listing lives at /stores (src/app/stores/page.tsx).
 * The dashboard with KPI cards lives at /dashboard (src/app/dashboard/page.tsx).
 */
export default function RootPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress sx={{ color: "primary.main" }} />
    </Box>
  );
}