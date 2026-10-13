import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";
import { playerSlugExists } from "@/lib/player-slugs";
import { getSeasonInfo, parseSeason } from "@/lib/seasons";

const PLAYER_PAGE = /^\/players\/([^/]+)\/?$/;
const PLAYER_STATIC_FILE = /^\/players\/[^/]+\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;

const SINGLE_SEGMENT = /^\/([^/.]+)\/?$/;
// Real top-level pages; anything else with one segment is a season (/2025) or a 404.
const TOP_LEVEL = new Set(["players", "terms", "contact", "admin"]);

function notFoundRewrite(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/_not-found";
  return NextResponse.rewrite(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Season hubs: /{season}. The current season lives at "/" (308 redirect, so one URL per season);
  // past seasons with data get their own page; everything else gets a real 404 before streaming.
  const one = SINGLE_SEGMENT.exec(pathname);
  if (one && TOP_LEVEL.has(one[1]) && one[1] !== "admin") return NextResponse.next();
  if (one && !TOP_LEVEL.has(one[1])) {
    const season = parseSeason(one[1]);
    if (season == null) return notFoundRewrite(req);
    try {
      const info = await getSeasonInfo();
      if (season === info.current) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url, 308);
      }
      if (!info.withData.includes(season)) return notFoundRewrite(req);
    } catch {
      // DB unavailable: let the page render its own fallback.
    }
    return NextResponse.next();
  }

  // Static files under /players (e.g. public/players/{slug}.png headshots, also fetched
  // internally by the /_next/image optimizer) match "/players/:slug" but are not pages.
  if (PLAYER_STATIC_FILE.test(pathname)) return NextResponse.next();

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
      url.pathname = "/_not-found";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return NextResponse.next();

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

export const config = { matcher: ["/admin", "/admin/:path*", "/players/:slug", "/:segment"] };
