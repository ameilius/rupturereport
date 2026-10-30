import type { Metadata } from "next";
import { statsOgImage } from "@/lib/og";
import { getSeasonInfo } from "@/lib/seasons";
import { seasonLabel, type League } from "@/lib/leagues";
import { statsCopy } from "@/components/StatsPage";

export async function statsMetadata(league: League): Promise<Metadata> {
  let season = new Date().getUTCFullYear();
  try {
    season = (await getSeasonInfo(league)).current;
  } catch {}
  const label = seasonLabel(league, season);
  const { title, description, path } = statsCopy(league, label);
  const img = statsOgImage(league);
  return {
    title: { absolute: `${title} | Rupture Report` },
    description,
    alternates: { canonical: path },
    keywords: [`${league} ACL tear stats ${label}`, `${league} Achilles tear stats ${label}`, `${league} injury statistics`, "torn ACL", "torn Achilles"],
    openGraph: { type: "website", url: path, title, description, images: [img], siteName: "Rupture Report" },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}
