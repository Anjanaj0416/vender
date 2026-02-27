import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy — fetches images from the intranet server and serves them
 * through your Next.js app, avoiding CORS/auth issues in the browser.
 *
 * Usage: /api/image-proxy?url=https://intranet_vertical.sltds.lk/store/.../asset/....png
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  // Only allow images from the known intranet server
  if (!imageUrl.startsWith("https://intranet_vertical.sltds.lk/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(imageUrl, { cache: "force-cache" });

    if (!upstream.ok) {
      return new NextResponse(`Upstream 404: ${imageUrl}`, { status: 404 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/png";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.error("[image-proxy] ERROR:", err.message, "url:", imageUrl);
    return new NextResponse("Proxy error", { status: 502 });
  }
}