import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getAllPlayerSlugs } from "@/lib/players";

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
    const players = await getAllPlayerSlugs();
    // Home + players index change whenever any player record does.
    const newest = players.reduce<string | null>(
      (m, p) => (p.lastModified && (!m || new Date(p.lastModified) > new Date(m)) ? p.lastModified : m),
      null,
    );
    if (newest) {
      entries[0].lastModified = new Date(newest);
      entries[1].lastModified = new Date(newest);
    }
    for (const p of players) {
      entries.push({
        url: `${siteUrl}/players/${p.slug}`,
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
