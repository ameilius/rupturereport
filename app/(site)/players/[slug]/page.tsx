import type { Metadata } from "next";
import PlayerPageView, { playerMetadata } from "@/components/PlayerPageView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return playerMetadata({ params, league: "NFL" });
}

export default function PlayerPage({ params }: Props) {
  return <PlayerPageView params={params} league="NFL" />;
}
