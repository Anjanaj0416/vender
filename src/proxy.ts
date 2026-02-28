import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always allow these paths ───────────────────────────────────────────────
  const publicPaths = [
    "/login",
    "/QRLogin",             // ← QR code landing page (matches QR code URL format)
    "/api/auth",            // ← includes /api/auth/qr-login
    "/_next",
    "/favicon.ico",
    "/tradez-logo.png",
    "/tradez-logo-horizontal.png",
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // ── Check JWT session token ────────────────────────────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|tradez-logo.png).*)"],
};