import { playerSlugExists } from "@/lib/player-slugs";
import { renderPlayerOg } from "@/lib/player-og";

// NFL player share card at a stable URL: /players/{slug}/opengraph-image (page metadata + JSON-LD add ?v=).
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if ((await playerSlugExists(slug, "NFL")) === false) return new Response("Not found", { status: 404 });
  const res = await renderPlayerOg(slug, "NFL");
  res.headers.set("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=3600");
  return res;
}
