import { renderPlayerOg } from "@/lib/player-og";

export const alt = "Rupture Report player injury & recovery tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderPlayerOg(slug, "NFL");
}
