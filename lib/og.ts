import type { League } from "@/lib/leagues";
import type { PlayerDetail } from "@/lib/players";
import { playerPath } from "@/lib/leagues";
import { tearContext, tearSide } from "@/lib/tear-context";

/**
 * Share cards. Every card is a route handler at a stable path; the metadata adds `?v=<hash of what the card shows>`
 * so X / iMessage / Slack re-fetch the moment the numbers, stage or badge change instead of serving a stale cached card.
 */
const W = 1200;
const H = 630;

/** Short, stable, dependency-free hash (djb2, base36). */
export function ogHash(parts: (string | number | null | undefined)[]): string {
  let h = 5381;
  const s = parts.map((p) => (p == null ? "" : String(p))).join("|");
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

const withV = (path: string, v?: string | null) => (v ? `${path}?v=${v}` : path);

/** League hub card: "/" + /players + contact/terms use the NFL card; /nba + /nba/players the NBA card. */
export const leagueOgImage = (league: League, v?: string | null) => ({
  url: withV(league === "NBA" ? "/nba/opengraph-image" : "/opengraph-image", v),
  width: W,
  height: H,
  alt: `Rupture Report — ${league} ACL & Achilles Tear Tracker`,
});

/** Back-compat names. */
export const defaultOgImage = leagueOgImage("NFL");
export const nbaOgImage = leagueOgImage("NBA");

export const statsOgImage = (league: League, v?: string | null) => ({
  url: withV(league === "NBA" ? "/nba/stats/opengraph-image" : "/stats/opengraph-image", v),
  width: W,
  height: H,
  alt: `Rupture Report — ${league} ACL & Achilles Tear Stats`,
});

/** Version for league/stats cards from the live counts they print. */
export function leagueOgVersion(s: { total: number; acl: number; achilles: number; season: number; updated: string | null }): string {
  return ogHash(["l2", s.season, s.total, s.acl, s.achilles, s.updated]);
}

export function playerOgImage(d: PlayerDetail, league: League) {
  const i = d.injuries[0];
  const v = ogHash([
    "p3",
    d.player.fullName,
    d.player.team?.abbreviation,
    d.player.position,
    d.player.headshotPath,
    i?.injuryType,
    i ? tearSide(i) : null,
    i ? tearContext(i, league) : null,
    i?.season,
    i?.updates.at(-1)?.stage,
    d.lastModified,
  ]);
  return {
    url: withV(`${playerPath(league, d.player.slug)}/opengraph-image`, v),
    width: W,
    height: H,
    alt: `${d.player.fullName} ${league === "NBA" ? "NBA " : ""}tear & recovery tracker`,
  };
}
