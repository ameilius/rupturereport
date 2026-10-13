import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";
import { playerSlugExists } from "@/lib/player-slugs";

const PLAYER_PAGE = /^\/players\/([^/]+)\/?$/;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Unknown player slugs: rewrite to an unmatched path so the themed root
  // not-found page renders with a real 404 status (page streams otherwise).
  const m = PLAYER_PAGE.exec(pathname);
  if (m) {
    let slug = m[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {}
    if ((await playerSlugExists(slug)) === false) {
      const url = req.nextUrl.clone();
      url.pathname = "/_not-found-player";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // First line of defence for admin; every admin page and action re-verifies the session.
  if (pathname === "/admin/login") return NextResponse.next();
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*", "/players/:slug"] };
