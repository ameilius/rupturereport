import { playerSlugExists } from "@/lib/player-slugs";
import { renderPlayerOg } from "@/lib/player-og";

// NBA player share card at a stable URL: /nba/players/{slug}/opengraph-image (referenced from the page metadata and JSON-LD).
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if ((await playerSlugExists(slug, "NBA")) === false) return new Response("Not found", { status: 404 });
  const res = await renderPlayerOg(slug, "NBA");
  res.headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  return res;
}
