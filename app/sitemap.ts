import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getAllPlayerSlugs } from "@/lib/players";
import { getSeasonInfo } from "@/lib/seasons";
import { playerPath, seasonLabel } from "@/lib/leagues";

const siteUrl = "https://rupturereport.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/players`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await connection();
    const everyone = await getAllPlayerSlugs();
    const players = everyone.filter((p) => p.league === "NFL");
    const nbaPlayers = everyone.filter((p) => p.league === "NBA");
    // Home + players index change whenever any player record does.
    const newest = players.reduce<string | null>(
      (m, p) => (p.lastModified && (!m || new Date(p.lastModified) > new Date(m)) ? p.lastModified : m),
      null,
    );
    if (newest) {
      entries[0].lastModified = new Date(newest);
      entries[1].lastModified = new Date(newest);
    }
    // Archive season hubs (the current season is "/", so it is not listed twice).
    const info = await getSeasonInfo();
    for (const y of info.withData.filter((y) => y !== info.current)) {
      entries.push({ url: `${siteUrl}/${y}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const p of players) {
      entries.push({
        url: `${siteUrl}/players/${p.slug}`,
        lastModified: p.lastModified ? new Date(p.lastModified) : undefined,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // NBA (same sitemap): league home, players index, archive seasons, players. lastmod advances with any NBA update.
    const newestNba = nbaPlayers.reduce<string | null>(
      (m, p) => (p.lastModified && (!m || new Date(p.lastModified) > new Date(m)) ? p.lastModified : m),
      null,
    );
    const nbaLast = newestNba ? new Date(newestNba) : undefined;
    entries.push(
      { url: `${siteUrl}/nba`, lastModified: nbaLast, changeFrequency: "daily", priority: 1 },
      { url: `${siteUrl}/nba/players`, lastModified: nbaLast, changeFrequency: "daily", priority: 0.9 },
    );
    const nbaInfo = await getSeasonInfo("NBA");
    for (const y of nbaInfo.withData.filter((y) => y !== nbaInfo.current)) {
      entries.push({ url: `${siteUrl}/nba/${seasonLabel("NBA", y)}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const p of nbaPlayers) {
      entries.push({
        url: `${siteUrl}${playerPath("NBA", p.slug)}`,
        lastModified: p.lastModified ? new Date(p.lastModified) : undefined,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch (err) {
    // connection() throws a framework signal during prerender; let it through.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string"
    ) {
      throw err;
    }
    console.error("sitemap: failed to load players", err);
  }

  return entries;
}
