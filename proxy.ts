import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";
import { playerSlugExists } from "@/lib/player-slugs";
import { getSeasonInfo, parseSeason } from "@/lib/seasons";
import { parseSeasonSegment } from "@/lib/leagues";

const PLAYER_PAGE = /^\/players\/([^/]+)\/?$/;
const PLAYER_STATIC_FILE = /^\/players\/[^/]+\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;
const NBA_SEGMENT = /^\/nba\/([^/.]+)\/?$/;
const NBA_PLAYER_PAGE = /^\/nba\/players\/([^/]+)\/?$/;

const SINGLE_SEGMENT = /^\/([^/.]+)\/?$/;
// Real top-level pages; anything else with one segment is a season (/2025) or a 404.
const TOP_LEVEL = new Set(["players", "terms", "contact", "admin", "nba"]);

function notFoundRewrite(req: NextRequest, league: "NFL" | "NBA" = "NFL") {
  const url = req.nextUrl.clone();
  url.pathname = "/_not-found";
  // Lets the shared 404 view pick league-appropriate copy and links.
  const headers = new Headers(req.headers);
  headers.set("x-rr-league", league);
  return NextResponse.rewrite(url, { request: { headers } });
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

  // NBA season hubs: /nba/{2025-26}. Same rules as the NFL: current season 308s to "/nba", past seasons with data
  // render, everything else is a real 404. "/nba/players" is a real page.
  const nbaOne = NBA_SEGMENT.exec(pathname);
  if (nbaOne && (nbaOne[1] === "players" || nbaOne[1].startsWith("opengraph-image"))) return NextResponse.next();
  if (nbaOne) {
    const season = parseSeasonSegment("NBA", nbaOne[1]);
    if (season == null) return notFoundRewrite(req, "NBA");
    try {
      const info = await getSeasonInfo("NBA");
      if (season === info.current) {
        const url = req.nextUrl.clone();
        url.pathname = "/nba";
        return NextResponse.redirect(url, 308);
      }
      if (!info.withData.includes(season)) return notFoundRewrite(req, "NBA");
    } catch {
      // DB unavailable: let the page render its own fallback.
    }
    return NextResponse.next();
  }

  const nbaPlayer = NBA_PLAYER_PAGE.exec(pathname);
  if (nbaPlayer) {
    let slug = nbaPlayer[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {}
    if ((await playerSlugExists(slug, "NBA")) === false) return notFoundRewrite(req, "NBA");
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

export const config = { matcher: ["/admin", "/admin/:path*", "/players/:slug", "/:segment", "/nba/:segment", "/nba/players/:slug"] };
