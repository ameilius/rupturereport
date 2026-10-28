import { nbaOgImage } from "@/lib/og";
import type { Metadata } from "next";
import PlayersIndex from "@/components/PlayersIndex";

const title = "Tracked NBA Players: ACL & Achilles Tears, All Seasons";
const description =
  "Every NBA player with a tracked ACL or Achilles tear, across all seasons, with recovery stage, tear date and team.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/nba/players" },
  openGraph: { type: "website", url: "/nba/players", title, description, images: [nbaOgImage] },
  twitter: { card: "summary_large_image", title, description, images: [nbaOgImage.url] },
};

export default function NbaPlayersPage() {
  return <PlayersIndex league="NBA" description={description} />;
}
