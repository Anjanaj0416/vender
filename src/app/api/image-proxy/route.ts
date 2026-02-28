import { NextRequest, NextResponse } from "next/server";

const INTRANET_BASE = "https://intranet_vertical.sltds.lk/";

/**
 * Image proxy — redirects the browser directly to the intranet image URL.
 *
 * The intranet server is only reachable from the LAN/VPN, so Node.js
 * server-side fetches always return 404. Instead we issue a 302 redirect so
 * the BROWSER (which IS on the LAN) fetches the image directly.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  if (!imageUrl.startsWith(INTRANET_BASE)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Redirect browser directly to the intranet image
  return NextResponse.redirect(imageUrl, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}