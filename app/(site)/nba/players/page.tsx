import { connection } from "next/server";
import { leagueOgImage } from "@/lib/og";
import { liveLeagueOgVersion } from "@/lib/league-og";
import type { Metadata } from "next";
import PlayersIndex from "@/components/PlayersIndex";

const title = "Tracked NBA Players: ACL & Achilles Tears, All Seasons";
const description =
  "Every NBA player with a tracked ACL or Achilles tear, across all seasons, with recovery stage, tear date and team.";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const img = leagueOgImage("NBA", await liveLeagueOgVersion("NBA"));
  return {
  title,
  description,
  alternates: { canonical: "/nba/players" },
  openGraph: { type: "website", url: "/nba/players", title, description, images: [img] },
  twitter: { card: "summary_large_image", title, description, images: [img.url] },
  };
}

export default function NbaPlayersPage() {
  return <PlayersIndex league="NBA" description={description} />;
}
