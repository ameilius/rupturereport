import { defaultOgImage } from "@/lib/og";
import type { Metadata } from "next";
import PlayersIndex from "@/components/PlayersIndex";

const title = "Tracked NFL Players: ACL & Achilles Tears, All Seasons";
const description =
  "Every NFL player with a tracked ACL or Achilles tear, across all seasons, with recovery stage, tear date and team.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/players" },
  openGraph: { type: "website", url: "/players", title, description, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title, description, images: [defaultOgImage.url] },
};

export default function PlayersPage() {
  return <PlayersIndex league="NFL" description={description} />;
}
