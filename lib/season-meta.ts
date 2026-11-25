import type { Metadata } from "next";
import { leagueOgImage } from "@/lib/og";
import { brandedTitle } from "@/lib/player-seo";
import { LEAGUE } from "@/lib/seasons";
import { seasonHubPath, seasonLabel, type League } from "@/lib/leagues";

/**
 * Carryover-only archive: a season before the first fully tracked season (see isCarryoverOnly). Its page lists only
 * tears whose players were still recovering going into `trackedFrom`, so the copy must not read as a full season.
 */
export interface CarryoverCopy {
  trackedFrom: number;
}

/** Title/description/canonical/OG for a season hub. The current season's canonical is the league home ("/" or "/nba"). */
/** Live current-season counts for the hub description; omitted when unavailable. */
export interface HubCounts {
  acl: number;
  achilles: number;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function seasonCopy(
  season: number,
  isCurrent: boolean,
  league: League = "NFL",
  carryover?: CarryoverCopy | null,
  counts?: HubCounts | null,
) {
  const so = isCurrent && counts ? `: ${counts.acl} ACL and ${plural(counts.achilles, "Achilles tear")} so far,` : ",";
  if (carryover && !isCurrent) {
    const label = seasonLabel(league, season);
    const from = seasonLabel(league, carryover.trackedFrom);
    const details = league === "NBA" ? "injury date, team, position, game context" : "injury date, team, game, turf vs grass";
    return {
      title: `${label} ${league} ACL & Achilles Tears: Still Recovering in ${from}`,
      description: `${league} players who tore an ACL or Achilles in the ${label} season and were still recovering going into the ${from} season: ${details} and recovery stage. Not a complete list of ${label} tears.`,
      path: seasonHubPath(league, season, season + 1), // never the current season
    };
  }
  if (league === "NBA") {
    const label = seasonLabel("NBA", season);
    return {
      title: isCurrent
        ? `NBA ACL & Achilles Tears ${label}: Injured Players List`
        : `${label} NBA ACL & Achilles Tears: Season Archive`,
      description: isCurrent
        ? `Every NBA player with a torn ACL or Achilles in the ${label} season${so} with dates, teams, game context and recovery stage.`
        : `Every torn ACL and Achilles of the ${label} NBA season: dates, teams, positions, game context, mechanism and recovery stage for each player.`,
      path: seasonHubPath("NBA", season, isCurrent ? season : season + 1),
    };
  }
  const title = isCurrent
    ? `${LEAGUE} ACL & Achilles Injuries ${season}: Tear List & Tracker`
    : `${season} ${LEAGUE} ACL & Achilles Tears: Season Archive`;
  const description = isCurrent
    ? `Every ${LEAGUE} player with a torn ACL or Achilles in the ${season} season${so} with dates, teams, turf vs grass and recovery stage.`
    : `Every torn ACL and Achilles of the ${season} ${LEAGUE} season: dates, teams, turf vs grass, mechanism and recovery stage for each player.`;
  const path = isCurrent ? "/" : `/${season}`;
  return { title, description, path };
}

/** `ogVersion`: ?v= for the league card (see liveLeagueOgVersion), so shares never show stale counts. */
export function seasonMetadata(
  season: number,
  isCurrent: boolean,
  league: League = "NFL",
  ogVersion?: string | null,
  carryover?: CarryoverCopy | null,
  counts?: HubCounts | null,
): Metadata {
  const { title, description, path } = seasonCopy(season, isCurrent, league, carryover, counts);
  const img = leagueOgImage(league, ogVersion);
  const label = seasonLabel(league, season);
  return {
    title: { absolute: brandedTitle(title) },
    description,
    alternates: { canonical: path },
    keywords:
      league === "NBA"
        ? [
            `NBA ACL tears ${label}`,
            "ACL injury NBA players list",
            `NBA Achilles tears ${label}`,
            "torn ACL NBA",
            "torn Achilles NBA",
            "NBA injury tracker",
          ]
        : [
            `${LEAGUE} ACL tears ${season}`,
            `${LEAGUE} ACL injuries ${season}`,
            `${LEAGUE} Achilles tears ${season}`,
            `torn ACL ${LEAGUE}`,
            `torn Achilles ${LEAGUE}`,
            `${LEAGUE} injury tracker`,
            "turf vs grass",
          ],
    openGraph: { type: "website", url: path, title, description, images: [img], siteName: "Rupture Report" },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}
