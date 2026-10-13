import type { Metadata } from "next";
import { defaultOgImage } from "@/lib/og";
import { LEAGUE } from "@/lib/seasons";

/** Title/description/canonical/OG for a season hub. The current season's canonical is "/". */
export function seasonCopy(season: number, isCurrent: boolean) {
  const title = isCurrent
    ? `${LEAGUE} ACL & Achilles Tear Tracker: ${season} Season`
    : `${season} ${LEAGUE} ACL & Achilles Tears: Season Archive`;
  const description = `Every torn ACL and Achilles of the ${season} ${LEAGUE} season: dates, teams, turf vs grass, mechanism and recovery stage for each player.`;
  const path = isCurrent ? "/" : `/${season}`;
  return { title, description, path };
}

export function seasonMetadata(season: number, isCurrent: boolean): Metadata {
  const { title, description, path } = seasonCopy(season, isCurrent);
  return {
    title: { absolute: `${title} | Rupture Report` },
    description,
    alternates: { canonical: path },
    keywords: [
      `${LEAGUE} ACL tears ${season}`,
      `${LEAGUE} Achilles tears ${season}`,
      `torn ACL ${LEAGUE}`,
      `torn Achilles ${LEAGUE}`,
      `${LEAGUE} injury tracker`,
      "turf vs grass",
    ],
    openGraph: { type: "website", url: path, title, description, images: [defaultOgImage], siteName: "Rupture Report" },
    twitter: { card: "summary_large_image", title, description, images: [defaultOgImage.url] },
  };
}
