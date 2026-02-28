"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// ─── TRADEZ SVG Logo ──────────────────────────────────────────────────────────
function TradezLogo() {
  return (
    <svg width="110" height="90" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,10 100,55 75,55" fill="#f5a623" />
      <polygon points="20,55 60,10 45,55" fill="#f5a623" />
      <polygon points="20,55 75,55 60,85 45,70" fill="#f0c040" />
      <path d="M52,22 Q60,14 68,22" stroke="#c0392b" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── QR scan icon ─────────────────────────────────────────────────────────────
function QRIcon({ size = 48, color = "#c0392b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="5" y="5" width="3" height="3" fill={color} stroke="none" />
      <rect x="16" y="5" width="3" height="3" fill={color} stroke="none" />
      <rect x="5" y="16" width="3" height="3" fill={color} stroke="none" />
      <path d="M14 14h2v2h-2z" fill={color} stroke="none" />
      <path d="M18 14h3" />
      <path d="M14 18h3" />
      <path d="M18 18h3" />
      <path d="M18 21v-3" />
    </svg>
  );
}

// ─── Background decorative shapes ────────────────────────────────────────────
function BackgroundShapes() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "-120px", left: "-120px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-150px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 70%)" }} />
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.025 }}>
        <defs>
          <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#c0392b" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>
    </div>
  );
}

// ─── Error messages ───────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  QRTokenMissing:  "Invalid QR code — no token found. Please use the QR code provided by TRADEZ.",
  QRAccessDenied:  "This QR code is not linked to an active vendor account.",
  QRBackendError:  "Unable to reach the authentication server. Please try again.",
  default:         "QR sign-in failed. Please try again or contact your administrator.",
};

// ─── Main content ─────────────────────────────────────────────────────────────
function QRLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Accept token from ?QRToken=, ?qrToken=, or ?token=
  const qrToken =
    searchParams.get("QRToken") ??
    searchParams.get("qrToken") ??
    searchParams.get("token");

  const errorCode = searchParams.get("error");

  const [status, setStatus] = useState<"loading" | "redirecting" | "error">(
    errorCode ? "error" : qrToken ? "loading" : "error"
  );
  const [errorMsg, setErrorMsg] = useState<string>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default) : ""
  );

  useEffect(() => {
    if (!qrToken || errorCode) return;

    // Redirect to the API route which will authenticate and set the cookie
    setStatus("redirecting");
    window.location.href = `/api/auth/qr-login?QRToken=${encodeURIComponent(qrToken)}`;
    // Note: /api/auth/qr-login is the backend handler; /QRLogin is this landing page
  }, [qrToken, errorCode]);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "20px",
    padding: "44px 44px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid rgba(192,57,43,0.08)",
    position: "relative",
    zIndex: 1,
    textAlign: "center",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdf6f4 0%, #f5f0ee 40%, #faf4f0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <BackgroundShapes />

      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
          <TradezLogo />
        </div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", color: "#c0392b", textTransform: "uppercase", marginBottom: "28px" }}>
          VENDOR PORTAL
        </div>

        {/* ── Loading / Redirecting state ── */}
        {(status === "loading" || status === "redirecting") && (
          <>
            <div style={{ margin: "0 auto 20px", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(192,57,43,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QRIcon size={32} />
            </div>

            <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "20px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
              Signing you in…
            </h2>
            <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "14px", color: "#888", margin: "0 0 28px", lineHeight: 1.5 }}>
              Verifying your QR code with the TRADEZ server.
            </p>

            <CircularProgress size={36} sx={{ color: "#c0392b" }} />

            <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "12px", color: "#bbb", marginTop: "20px" }}>
              Please wait — do not close this tab.
            </p>
          </>
        )}

        {/* ── Error state ── */}
        {status === "error" && (
          <>
            <div style={{ margin: "0 auto 20px", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(192,57,43,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "20px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
              QR Sign-In Failed
            </h2>
            <p style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "14px", color: "#888", margin: "0 0 28px", lineHeight: 1.5 }}>
              {errorMsg || ERROR_MESSAGES.default}
            </p>

            <button
              onClick={() => router.push("/login")}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: "12px",
                border: "1.5px solid #c0392b",
                background: "#c0392b",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.2px",
              }}
            >
              Back to Login
            </button>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f0e8e0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2z" stroke="#bbb" strokeWidth="2" fill="none" />
              <path d="M9 12l2 2 4-4" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "11.5px", color: "#bbb", letterSpacing: "0.2px" }}>
              TRADEZ Secure QR Authentication
            </span>
          </div>
        </div>
      </div>
    </Box>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function QRLoginPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fdf6f4 0%, #f5f0ee 100%)" }}>
        <CircularProgress sx={{ color: "#c0392b" }} />
      </Box>
    }>
      <QRLoginContent />
    </Suspense>
  );
}