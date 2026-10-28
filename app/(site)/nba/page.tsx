import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import SeasonHub, { HubSkeleton } from "@/components/SeasonHub";
import { getSeasonInfo } from "@/lib/seasons";
import { seasonMetadata } from "@/lib/season-meta";

// "/nba" always shows the CURRENT NBA season (settings.current_season_nba). /nba/{current} 308-redirects here (see proxy.ts).
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  try {
    const info = await getSeasonInfo("NBA");
    return seasonMetadata(info.current, true, "NBA");
  } catch {
    return seasonMetadata(new Date().getUTCFullYear(), true, "NBA");
  }
}

export default function NbaHome() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Suspense fallback={<HubSkeleton />}>
        <CurrentSeason />
      </Suspense>
    </main>
  );
}

async function CurrentSeason() {
  await connection();
  let info;
  try {
    info = await getSeasonInfo("NBA");
  } catch {
    const y = new Date().getUTCFullYear();
    info = { current: y, withData: [], listed: [y] };
  }
  return <SeasonHub season={info.current} info={info} league="NBA" />;
}
