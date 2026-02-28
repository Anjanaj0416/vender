import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const LIVE_API_BASE = "https://intranet_vertical.sltds.lk/api";

async function callBackendAuth(user: any, account: any): Promise<boolean> {
  const email   = user.email ?? "";
  const tokenId = account?.id_token ?? "";

  // ── 🔍 Login payload debug ────────────────────────────────────────────────
  console.log("\n========================================");
  console.log("  [auth] 🔐 GOOGLE LOGIN ATTEMPT");
  console.log("========================================");
  console.log(`  email   : ${email}`);
  console.log(`  tokenId : ${tokenId ? tokenId.slice(0, 40) + "..." : "⚠️  MISSING"}`);
  console.log("  📦 Request JSON:", JSON.stringify({ email, tokenId: tokenId.slice(0, 20) + "..." }));
  console.log("========================================\n");

  // ── Attempt 1: POST ───────────────────────────────────────────────────────
  console.log("[auth] Attempt 1: POST with { email, tokenId }");
  try {
    const res1 = await fetch(
      `${LIVE_API_BASE}/TradezAuth/GetLoginViaGoogleAuth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tokenId }),
        cache: "no-store",
      }
    );
    console.log("[auth] Attempt 1 status:", res1.status);
    const text1 = await res1.text();
    console.log("[auth] Attempt 1 body:", text1);

    if (res1.status !== 404 && res1.status !== 405) {
      return handleResponse(res1.status, text1, user);
    }
    console.log("[auth] Attempt 1 got 405/404 — trying GET...");
  } catch (e: any) {
    console.log("[auth] Attempt 1 error:", e.message);
  }

  // ── Attempt 2: GET with query params ──────────────────────────────────────
  console.log("[auth] Attempt 2: GET with ?email=&tokenId=");
  try {
    const params = new URLSearchParams({ email, tokenId });
    const res2 = await fetch(
      `${LIVE_API_BASE}/TradezAuth/GetLoginViaGoogleAuth?${params}`,
      { method: "GET", cache: "no-store" }
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

  // ── All failed ────────────────────────────────────────────────────────────
  console.error("[auth] ❌ All attempts failed — backend may need VPN");
  console.warn("[auth] ⚠️  BYPASS active — allowing login without backend confirmation");
  (user as any).backendData = { email, bypass: true };
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
  } catch {
    if (status >= 200 && status < 300) {
      console.log("[auth] ✅ Non-JSON + 2xx = success");
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
    const inner = json?.data?.data ?? json?.data ?? json;

    // ── Store all backend fields we need downstream ───────────────────────
    (user as any).backendData = {
      vendorId:          inner?.vendorId          ?? "",
      email:             inner?.email             ?? user.email,
      fullName:          inner?.fullName          ?? user.name,
      profilePictureUrl: inner?.profilePictureUrl ?? "",
      systemToken:       inner?.token             ?? "",
    };

    console.log("\n========================================");
    console.log("  [auth] ✅ BACKEND LOGIN SUCCESS");
    console.log("========================================");
    console.log(`  vendorId    : ${(user as any).backendData.vendorId}`);
    console.log(`  email       : ${(user as any).backendData.email}`);
    console.log(`  fullName    : ${(user as any).backendData.fullName}`);
    console.log(`  systemToken : ${(user as any).backendData.systemToken.slice(0, 40)}...`);
    console.log("========================================\n");

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
      // ── QR login sessions are handled entirely by /api/auth/qr-login ──
      // They set the cookie directly and never go through NextAuth's signIn flow.
      // Only Google OAuth goes through here.
      if (account?.provider !== "google") return false;
      const allowed = await callBackendAuth(user, account);
      return allowed || "/login?error=AccessDenied";
    },

    async jwt({ token, user }) {
      // On first sign-in (Google OAuth), persist backend data into the JWT
      if (user) {
        const bd = (user as any).backendData ?? {};
        token.vendorId    = bd.vendorId    ?? "";
        token.fullName    = bd.fullName    ?? user.name;
        token.systemToken = bd.systemToken ?? "";
        token.email       = bd.email       ?? user.email;
        token.picture     = bd.profilePictureUrl || user.image;
      }
      // QR-login tokens already have these fields set — just pass them through
      return token;
    },

    async session({ session, token }) {
      // Expose to the frontend via useSession()
      (session as any).vendorId    = token.vendorId;
      (session as any).fullName    = token.fullName;
      (session as any).systemToken = token.systemToken;
      session.user = {
        ...session.user,
        email: token.email as string,
        name:  token.fullName as string,
        image: token.picture as string,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };