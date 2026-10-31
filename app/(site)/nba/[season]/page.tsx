import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import SeasonHub, { HubSkeleton } from "@/components/SeasonHub";
import { getSeasonInfo } from "@/lib/seasons";
import { parseSeasonSegment } from "@/lib/leagues";
import { seasonMetadata } from "@/lib/season-meta";
import { liveLeagueOgVersion } from "@/lib/league-og";

// NBA archive season hubs ("/nba/2025-26"). proxy.ts validates the segment first (real 404 / 308 to "/nba"
// for the current season); the checks here are a fallback.
type Props = { params: Promise<{ season: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const season = parseSeasonSegment("NBA", (await params).season);
  try {
    const info = await getSeasonInfo("NBA");
    if (season == null || !info.withData.includes(season)) return { title: "Season not found", robots: { index: false } };
    return seasonMetadata(season, season === info.current, "NBA", await liveLeagueOgVersion("NBA"));
  } catch {
    return { title: "Season" };
  }
}

export default function NbaSeasonPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Suspense fallback={<HubSkeleton />}>
        <Season params={params} />
      </Suspense>
    </main>
  );
}

async function Season({ params }: Props) {
  await connection();
  const season = parseSeasonSegment("NBA", (await params).season);
  if (season == null) notFound();
  const info = await getSeasonInfo("NBA");
  if (season === info.current) permanentRedirect("/nba");
  if (!info.withData.includes(season)) notFound();
  return <SeasonHub season={season} info={info} league="NBA" />;
}
