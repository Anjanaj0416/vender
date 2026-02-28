import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always allow these paths ───────────────────────────────────────────────
  const publicPaths = [
    "/login",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/tradez-logo.png",
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