"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// ─── Error message map ────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "Your Google account is not authorised for TRADEZ Vendor Portal.",
  BackendError: "Unable to reach the authentication server. Please try again.",
  OAuthCallback: "Google sign-in was cancelled or failed. Please try again.",
  default: "Sign in failed. Please try again.",
};

// ─── TRADEZ SVG Logo (from existing code) ────────────────────────────────────
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

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Decorative background shapes ────────────────────────────────────────────
function BackgroundShapes() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Top-left large circle */}
      <div style={{
        position: "absolute", top: "-120px", left: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%)",
      }} />
      {/* Bottom-right large circle */}
      <div style={{
        position: "absolute", bottom: "-150px", right: "-100px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 70%)",
      }} />
      {/* Top-right accent */}
      <div style={{
        position: "absolute", top: "60px", right: "80px",
        width: "180px", height: "180px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192,57,43,0.07) 0%, transparent 70%)",
      }} />
      {/* Diagonal stripe pattern */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.025 }}>
        <defs>
          <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#c0392b" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>
      {/* Bottom-left triangle accent */}
      <svg style={{ position: "absolute", bottom: "40px", left: "60px", opacity: 0.06 }} width="120" height="120" viewBox="0 0 120 120">
        <polygon points="60,0 120,120 0,120" fill="#f5a623" />
      </svg>
      {/* Top-right triangle */}
      <svg style={{ position: "absolute", top: "30px", right: "30px", opacity: 0.05 }} width="80" height="80" viewBox="0 0 80 80">
        <polygon points="40,0 80,80 0,80" fill="#c0392b" />
      </svg>
    </div>
  );
}

// ─── Main login content ───────────────────────────────────────────────────────
function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const errorCode = searchParams.get("error");
  const errorMsg = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default)
    : null;

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f6f3" }}>
        <CircularProgress sx={{ color: "#c0392b" }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(145deg, #fdfcfb 0%, #f5f0eb 50%, #fdf8f5 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative",
      padding: "20px",
    }}>
      <BackgroundShapes />

      {/* Card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "440px",
        background: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 8px 60px rgba(0,0,0,0.10), 0 2px 12px rgba(192,57,43,0.06)",
        overflow: "hidden",
        border: "1px solid rgba(192,57,43,0.08)",
      }}>

        {/* Red top accent bar */}
        <div style={{
          height: "4px",
          background: "linear-gradient(90deg, #c0392b 0%, #f5a623 50%, #c0392b 100%)",
        }} />

        <div style={{ padding: "44px 44px 40px" }}>

          {/* Logo section */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <TradezLogo />
              <div style={{ marginTop: "4px" }}>
                <div style={{
                  fontFamily: "'Georgia', serif",
                  fontWeight: 900,
                  letterSpacing: "3px",
                  fontSize: "26px",
                  color: "#1a1a2e",
                  lineHeight: 1,
                }}>
                  TRADE<span style={{ color: "#c0392b" }}>Z</span>
                </div>
                <div style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: "4px",
                  color: "#888",
                  fontSize: "8.5px",
                  marginTop: "5px",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}>
                  THE FUTURE MARKETPLACE
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, #e0d8d0)" }} />
            <span style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "11px",
              color: "#bbb",
              letterSpacing: "1.5px",
              fontWeight: 500,
              textTransform: "uppercase",
            }}>
              Vendor Portal
            </span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, #e0d8d0, transparent)" }} />
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 8px 0",
              lineHeight: 1.3,
            }}>
              Sign in to your account
            </h1>
            <p style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "13.5px",
              color: "#888",
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.5,
            }}>
              Use your authorised Google account to continue
            </p>
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div style={{
              background: "rgba(192,57,43,0.06)",
              border: "1px solid rgba(192,57,43,0.2)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#c0392b"/>
              </svg>
              <span style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: "13px",
                color: "#c0392b",
                lineHeight: 1.5,
              }}>
                {errorMsg}
              </span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px 20px",
              borderRadius: "12px",
              border: hovered ? "1.5px solid #c0392b" : "1.5px solid #e8e0d8",
              background: hovered ? "rgba(192,57,43,0.03)" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              color: "#1a1a2e",
              letterSpacing: "0.2px",
              transition: "all 0.2s ease",
              opacity: loading ? 0.7 : 1,
              boxShadow: hovered
                ? "0 4px 16px rgba(192,57,43,0.10)"
                : "0 2px 8px rgba(0,0,0,0.04)",
              outline: "none",
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ color: "#c0392b" }} />
                <span style={{ color: "#888" }}>Signing in…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Security badge */}
          <div style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2z" stroke="#bbb" strokeWidth="2" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "11.5px",
              color: "#bbb",
              letterSpacing: "0.2px",
            }}>
              Secured by Google OAuth 2.0
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 44px",
          background: "linear-gradient(135deg, #fdf8f5, #f9f4ef)",
          borderTop: "1px solid #f0e8e0",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: "11.5px",
            color: "#aaa",
            margin: 0,
            lineHeight: 1.6,
          }}>
            Only authorised vendor accounts can access this portal.
            <br />
            <span style={{ color: "#c0392b", fontWeight: 500, cursor: "pointer" }}>
              Contact your administrator
            </span>{" "}
            if you need access.
          </p>
        </div>
      </div>

      {/* Version tag */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "24px",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: "10px",
        color: "#ccc",
        letterSpacing: "1px",
        zIndex: 1,
      }}>
        TRADEZ VENDOR · v2.0
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f6f3" }}>
          <CircularProgress sx={{ color: "#c0392b" }} />
        </Box>
      }
    >
      <LoginContent />
    </Suspense>
  );
}