import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import SeasonHub, { HubSkeleton } from "@/components/SeasonHub";
import { getSeasonInfo } from "@/lib/seasons";
import { seasonMetadata } from "@/lib/season-meta";
import { liveLeagueOgVersion } from "@/lib/league-og";

// "/" always shows the CURRENT season (settings.current_season). /{current} 308-redirects here (see proxy.ts).
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  try {
    const info = await getSeasonInfo();
    return seasonMetadata(info.current, true, "NFL", await liveLeagueOgVersion("NFL"));
  } catch {
    return seasonMetadata(new Date().getUTCFullYear(), true, "NFL", await liveLeagueOgVersion("NFL"));
  }
}

export default function Home() {
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
    info = await getSeasonInfo();
  } catch {
    const y = new Date().getUTCFullYear();
    info = { current: y, withData: [], listed: [y] };
  }
  return <SeasonHub season={info.current} info={info} />;
}
