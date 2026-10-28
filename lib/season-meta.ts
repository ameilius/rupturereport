import type { Metadata } from "next";
import { defaultOgImage, nbaOgImage } from "@/lib/og";
import { LEAGUE } from "@/lib/seasons";
import { seasonHubPath, seasonLabel, type League } from "@/lib/leagues";

/** Title/description/canonical/OG for a season hub. The current season's canonical is the league home ("/" or "/nba"). */
export function seasonCopy(season: number, isCurrent: boolean, league: League = "NFL") {
  if (league === "NBA") {
    const label = seasonLabel("NBA", season);
    return {
      title: isCurrent
        ? `NBA ACL & Achilles Tear Tracker: ${label} Season`
        : `${label} NBA ACL & Achilles Tears: Season Archive`,
      description: `Every torn ACL and Achilles of the ${label} NBA season: dates, teams, positions, game context, mechanism and recovery stage for each player.`,
      path: seasonHubPath("NBA", season, isCurrent ? season : season + 1),
    };
  }
  const title = isCurrent
    ? `${LEAGUE} ACL & Achilles Tear Tracker: ${season} Season`
    : `${season} ${LEAGUE} ACL & Achilles Tears: Season Archive`;
  const description = `Every torn ACL and Achilles of the ${season} ${LEAGUE} season: dates, teams, turf vs grass, mechanism and recovery stage for each player.`;
  const path = isCurrent ? "/" : `/${season}`;
  return { title, description, path };
}

export function seasonMetadata(season: number, isCurrent: boolean, league: League = "NFL"): Metadata {
  const { title, description, path } = seasonCopy(season, isCurrent, league);
  const img = league === "NBA" ? nbaOgImage : defaultOgImage;
  const label = seasonLabel(league, season);
  return {
    title: { absolute: `${title} | Rupture Report` },
    description,
    alternates: { canonical: path },
    keywords:
      league === "NBA"
        ? [
            `NBA ACL tears ${label}`,
            `NBA Achilles tears ${label}`,
            "torn ACL NBA",
            "torn Achilles NBA",
            "NBA injury tracker",
          ]
        : [
            `${LEAGUE} ACL tears ${season}`,
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
