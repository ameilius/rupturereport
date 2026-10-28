/**
 * League configuration. The NFL stays at the original URLs ("/", "/players", "/{season}");
 * the NBA lives under "/nba" ("/nba", "/nba/players", "/nba/{2026-27}").
 * The database stores `league` ('NFL' | 'NBA') on teams, stadiums (arenas) and players;
 * `injuries.season` is the league year in both leagues (NBA 2026 = the 2026-27 season).
 */
export type League = "NFL" | "NBA";
export const LEAGUES: League[] = ["NFL", "NBA"];

export interface LeagueConfig {
  id: League;
  /** Short label, e.g. "NFL". */
  name: string;
  orgName: string;
  sport: string;
  basePath: string;
  /** Game-number label ("Week 5" vs "Game 5"). */
  gameWord: "Week" | "Game";
  venueWord: "Stadium" | "Arena";
  hasSurface: boolean;
  /** settings key holding the current season year. */
  settingKey: string;
  /** Plural noun for the people ("players" in both, kept for copy variation). */
  teamNoun: string;
}

export const LEAGUE_CONFIG: Record<League, LeagueConfig> = {
  NFL: {
    id: "NFL",
    name: "NFL",
    orgName: "National Football League",
    sport: "American football",
    basePath: "",
    gameWord: "Week",
    venueWord: "Stadium",
    hasSurface: true,
    settingKey: "current_season",
    teamNoun: "team",
  },
  NBA: {
    id: "NBA",
    name: "NBA",
    orgName: "National Basketball Association",
    sport: "Basketball",
    basePath: "/nba",
    gameWord: "Game",
    venueWord: "Arena",
    hasSurface: false,
    settingKey: "current_season_nba",
    teamNoun: "team",
  },
};

export const cfg = (l: League): LeagueConfig => LEAGUE_CONFIG[l];

export function asLeague(v: unknown): League {
  return v === "NBA" ? "NBA" : "NFL";
}

/** NFL season labels are the year ("2026"); NBA seasons span two years ("2026-27"). */
/** Where a player's/team's bundled official image lives under /public. NBA team logos are keyed by abbreviation. */
export function officialImagePath(kind: "players" | "teams", slug: string, league: League, abbreviation?: string | null): string {
  return kind === "teams" && league === "NBA" && abbreviation ? `/teams/nba/${abbreviation}.png` : `/${kind}/${slug}.png`;
}

export function seasonLabel(league: League, season: number): string {
  return league === "NBA" ? `${season}-${String((season + 1) % 100).padStart(2, "0")}` : String(season);
}

/** Parse a URL season segment ("2026" for the NFL, "2026-27" for the NBA). */
export function parseSeasonSegment(league: League, v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (league === "NBA") {
    const m = /^(\d{4})-(\d{2})$/.exec(s);
    if (!m) return null;
    const y = Number(m[1]);
    if (y < 1946 || y > 2200 || Number(m[2]) !== (y + 1) % 100) return null;
    return y;
  }
  if (!/^\d{4}$/.test(s)) return null;
  const n = Number(s);
  return n >= 1920 && n <= 2200 ? n : null;
}

export const homePath = (l: League) => cfg(l).basePath || "/";
export const playersPath = (l: League) => `${cfg(l).basePath}/players`;
export const playerPath = (l: League, slug: string) => `${cfg(l).basePath}/players/${slug}`;
/** The current season lives at the league home; archive seasons at "{base}/{segment}". */
export const seasonHubPath = (l: League, season: number, current: number) =>
  season === current ? homePath(l) : `${cfg(l).basePath}/${seasonLabel(l, season)}`;

export type PositionBucket = "Guards" | "Wings / forwards" | "Bigs";
export const POSITION_BUCKETS: PositionBucket[] = ["Guards", "Wings / forwards", "Bigs"];

/**
 * NBA positions are stored as listed (G, PG, SG, F, SF, PF, C, G-F, F-C ...). The UI groups them
 * into Guards / Wings-forwards / Bigs by the first listed position.
 */
export function positionBucket(pos: string | null | undefined): PositionBucket | null {
  const first = (pos ?? "").toUpperCase().split(/[-/ ]/)[0];
  if (["G", "PG", "SG"].includes(first)) return "Guards";
  if (["F", "SF", "PF", "GF"].includes(first)) return "Wings / forwards";
  if (["C", "FC"].includes(first)) return "Bigs";
  return null;
}

/** Which league's section a URL path belongs to; null on neutral pages (contact, terms). */
export function leagueFromPathname(pathname: string | null | undefined): League | null {
  const p = pathname ?? "/";
  if (p === "/nba" || p.startsWith("/nba/")) return "NBA";
  if (p === "/" || p === "/players" || p.startsWith("/players/") || /^\/\d{4}\/?$/.test(p)) return "NFL";
  return null;
}
