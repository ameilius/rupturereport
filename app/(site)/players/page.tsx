import { connection } from "next/server";
import { leagueOgImage } from "@/lib/og";
import { liveLeagueOgVersion } from "@/lib/league-og";
import type { Metadata } from "next";
import PlayersIndex from "@/components/PlayersIndex";

const title = "Tracked NFL Players: ACL & Achilles Tears, All Seasons";
const description =
  "Every NFL player with a tracked ACL or Achilles tear, across all seasons, with recovery stage, tear date and team.";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const img = leagueOgImage("NFL", await liveLeagueOgVersion("NFL"));
  return {
  title,
  description,
  alternates: { canonical: "/players" },
  openGraph: { type: "website", url: "/players", title, description, images: [img] },
  twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}

export default function PlayersPage() {
  return <PlayersIndex league="NFL" description={description} />;
}
