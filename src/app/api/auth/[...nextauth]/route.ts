import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

async function callBackendAuth(user: any, account: any): Promise<boolean> {
  const email    = user.email ?? "";
  const name     = user.name ?? "";
  const googleId = account?.providerAccountId ?? "";
  const idToken  = account?.id_token ?? "";

  // ── Attempt 1: POST with JSON body ────────────────────────────────────────
  console.log("[auth] Attempt 1: POST with JSON body");
  try {
    const res1 = await fetch(
      `${LIVE_API_BASE}/TradezProduct/GetLoginViaGoogleAuth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, googleId, idToken }),
        cache: "no-store",
      }
    );
    console.log("[auth] Attempt 1 status:", res1.status);
    const text1 = await res1.text();
    console.log("[auth] Attempt 1 body:", text1);

    if (res1.status !== 404 && res1.status !== 405) {
      return handleResponse(res1.status, text1, user);
    }
  } catch (e: any) {
    console.log("[auth] Attempt 1 error:", e.message);
  }

  // ── Attempt 2: GET with query params ──────────────────────────────────────
  console.log("[auth] Attempt 2: GET with query params");
  try {
    const params = new URLSearchParams({ email, name, googleId, idToken });
    const res2 = await fetch(
      `${LIVE_API_BASE}/TradezProduct/GetLoginViaGoogleAuth?${params}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    console.log("[auth] Attempt 2 status:", res2.status);
    const text2 = await res2.text();
    console.log("[auth] Attempt 2 body:", text2);

    if (res2.status !== 404 && res2.status !== 405) {
      return handleResponse(res2.status, text2, user);
    }
  } catch (e: any) {
    console.log("[auth] Attempt 2 error:", e.message);
  }

  // ── Attempt 3: POST with idToken only ─────────────────────────────────────
  console.log("[auth] Attempt 3: POST with idToken only");
  try {
    const res3 = await fetch(
      `${LIVE_API_BASE}/TradezProduct/GetLoginViaGoogleAuth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        cache: "no-store",
      }
    );
    console.log("[auth] Attempt 3 status:", res3.status);
    const text3 = await res3.text();
    console.log("[auth] Attempt 3 body:", text3);

    if (res3.status !== 404 && res3.status !== 405) {
      return handleResponse(res3.status, text3, user);
    }
  } catch (e: any) {
    console.log("[auth] Attempt 3 error:", e.message);
  }

  // ── All attempts got 404 — endpoint URL is wrong ──────────────────────────
  console.error("[auth] ❌ All 404s — endpoint URL is wrong or API needs VPN/intranet access");
  console.warn("[auth] ⚠️  TEMPORARY BYPASS: allowing login without backend confirmation");
  console.warn("[auth] ⚠️  TODO: confirm correct endpoint URL before production!");

  // TEMPORARY: bypass backend so you can keep developing the rest of the app
  // Remove or set to `return false` once you have the correct endpoint
  (user as any).backendData = { email, name, bypass: true };
  return true;
}

function handleResponse(status: number, rawText: string, user: any): boolean {
  if (!rawText || rawText.trim() === "") {
    if (status >= 200 && status < 300) {
      console.log("[auth] ✅ Empty body + 2xx = success");
      (user as any).backendData = { email: user.email };
      return true;
    }
    return false;
  }

  let json: any;
  try {
    json = JSON.parse(rawText);
    console.log("[auth] Parsed response:", JSON.stringify(json, null, 2));
  } catch {
    if (status >= 200 && status < 300) {
      console.log("[auth] ✅ Non-JSON + 2xx = success:", rawText);
      (user as any).backendData = { email: user.email };
      return true;
    }
    return false;
  }

  const isSuccess =
    json?.success === true ||
    json?.isSuccess === true ||
    (json?.statusCode >= 200 && json?.statusCode < 300) ||
    (status >= 200 && status < 300 && json?.success !== false);

  if (isSuccess) {
    console.log("[auth] ✅ Backend accepted login");
    (user as any).backendData = json?.data ?? json;
    return true;
  }

  console.error("[auth] ❌ Backend rejected:", json?.message ?? "unknown");
  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false;
      const allowed = await callBackendAuth(user, account);
      return allowed || "/login?error=AccessDenied";
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.backendData = (user as any).backendData;
        token.googleId    = account?.providerAccountId;
        token.email       = user.email;
        token.name        = user.name;
        token.picture     = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).backendData = token.backendData;
      (session as any).googleId    = token.googleId;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };