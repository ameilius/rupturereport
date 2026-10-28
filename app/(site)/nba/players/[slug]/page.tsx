import type { Metadata } from "next";
import PlayerPageView, { playerMetadata } from "@/components/PlayerPageView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return playerMetadata({ params, league: "NBA" });
}

export default function NbaPlayerPage({ params }: Props) {
  return <PlayerPageView params={params} league="NBA" />;
}
