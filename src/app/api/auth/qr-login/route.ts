import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const qrToken = searchParams.get("QRToken") ?? searchParams.get("qrToken") ?? searchParams.get("token");

  if (!qrToken) {
    return NextResponse.redirect(new URL("/QRLogin?error=QRTokenMissing", request.url));
  }

  console.log("\n========================================");
  console.log("  [qr-auth] 📷 QR LOGIN ATTEMPT");
  console.log("========================================");
  console.log(`  QRToken : ${qrToken}`);
  console.log("========================================\n");

  try {
    // ── Call backend QR auth endpoint ─────────────────────────────────────
    const res = await fetch(
      `${LIVE_API_BASE}/TradezAuth/GetLoginViaQR?QRToken=${encodeURIComponent(qrToken)}`,
      { method: "GET", cache: "no-store" }
    );

    const rawText = await res.text();
    console.log("[qr-auth] Backend status:", res.status);
    console.log("[qr-auth] Backend body:", rawText.slice(0, 200));

    let json: any;
    try {
      json = JSON.parse(rawText);
    } catch {
      console.error("[qr-auth] ❌ Failed to parse backend response");
      return NextResponse.redirect(new URL("/QRLogin?error=QRBackendError", request.url));
    }

    const isSuccess =
      json?.success === true ||
      json?.isSuccess === true ||
      (json?.statusCode >= 200 && json?.statusCode < 300) ||
      (res.status >= 200 && res.status < 300 && json?.success !== false);

    if (!isSuccess) {
      console.error("[qr-auth] ❌ Backend rejected QR token:", json?.message);
      return NextResponse.redirect(new URL("/QRLogin?error=QRAccessDenied", request.url));
    }

    // ── Extract vendor data ────────────────────────────────────────────────
    const inner = json?.data?.data ?? json?.data ?? json;

    const vendorId           = inner?.vendorId          ?? "";
    const email              = inner?.email             ?? "";
    const fullName           = inner?.fullName          ?? "";
    const profilePictureUrl  = inner?.profilePictureUrl ?? "";
    const systemToken        = inner?.token             ?? "";

    console.log("[qr-auth] ✅ QR LOGIN SUCCESS");
    console.log(`  vendorId  : ${vendorId}`);
    console.log(`  email     : ${email}`);
    console.log(`  fullName  : ${fullName}`);

    // ── Build a NextAuth-compatible JWT and set the session cookie ─────────
    const secret = process.env.NEXTAUTH_SECRET!;

    const tokenPayload = {
      // Standard NextAuth JWT claims
      name:         fullName,
      email,
      picture:      profilePictureUrl,
      sub:          vendorId || email,
      // Custom fields used by the app
      vendorId,
      fullName,
      systemToken,
      // Provider flag (not a real OAuth provider)
      provider:     "qr",
      iat:          Math.floor(Date.now() / 1000),
      exp:          Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    const encodedToken = await encode({
      token: tokenPayload,
      secret,
    });

    // ── Set the session cookie and redirect to dashboard ──────────────────
    const isSecure = request.url.startsWith("https");
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(cookieName, encodedToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error("[qr-auth] ❌ Unexpected error:", err.message);
    return NextResponse.redirect(new URL("/QRLogin?error=QRBackendError", request.url));
  }
}