import type { NextRequest } from "next/server";
import { formatDate } from "@/lib/format";
import { homePath, type League } from "@/lib/leagues";
import { EMBED_H, SITE, embedData } from "@/lib/embed";

// Standalone, framable count card (no JS). Only /embed/* sends frame-ancestors *; every other page is unchanged.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function GET(req: NextRequest, { params }: { params: Promise<{ league: string }> }) {
  const { league: seg } = await params;
  const league: League | null = seg === "nfl" ? "NFL" : seg === "nba" ? "NBA" : null;
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy": "frame-ancestors *",
    "X-Robots-Tag": "noindex, follow",
  };
  if (!league) return new Response("Not found", { status: 404, headers: { ...headers, "Content-Type": "text/plain" } });

  const light = req.nextUrl.searchParams.get("theme") === "light";
  const t = light
    ? { bg: "#FFFFFF", fg: "#0B0F14", muted: "#5B6670", border: "#D9DEE3", teal: "#0D9488", amber: "#B45309", tile: "#F4F6F8" }
    : { bg: "#0B0F14", fg: "#E6EDF3", muted: "#8B98A5", border: "#1F2933", teal: "#14B8A6", amber: "#F59E0B", tile: "#121821" };
  const home = `${SITE}${homePath(league) === "/" ? "/" : homePath(league)}`;

  let body: string;
  let status = 200;
  try {
    const d = await embedData(league);
    const updated = formatDate(d.updated);
    const kpi = (n: number, label: string, color: string) =>
      `<div class="k"><b style="color:${color}">${n}</b><span>${esc(label)}</span></div>`;
    body = `<div class="card">
<div class="h">${esc(d.label)} ${league} season</div>
<div class="t">ACL &amp; Achilles tears</div>
<div class="row">${kpi(d.total, "Total", t.fg)}${kpi(d.acl, "ACL", t.teal)}${kpi(d.achilles, "Achilles", t.amber)}${kpi(d.returned, "Returned", t.fg)}</div>
<div class="f">${updated ? `Updated ${esc(updated)} · ` : ""}Data: <a href="${home}" target="_blank" rel="noopener">Rupture Report</a></div>
</div>`;
  } catch {
    status = 503;
    body = `<div class="card"><div class="t">Data temporarily unavailable</div><div class="f">Data: <a href="${home}" target="_blank" rel="noopener">Rupture Report</a></div></div>`;
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, follow"><title>${league} ACL &amp; Achilles tear count | Rupture Report</title>
<style>
*{box-sizing:border-box}html,body{margin:0;background:transparent}
body{font:14px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:${t.fg}}
.card{width:100%;max-width:400px;height:${EMBED_H}px;background:${t.bg};border:1px solid ${t.border};border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;overflow:hidden}
.h{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${t.muted}}
.t{margin-top:2px;font-size:16px;font-weight:800}
.row{margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.k{background:${t.tile};border:1px solid ${t.border};border-radius:10px;padding:8px 6px;text-align:center;min-width:0}
.k b{display:block;font-size:26px;font-weight:900;line-height:1}
.k span{display:block;margin-top:4px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${t.muted}}
.f{margin-top:auto;font-size:11px;color:${t.muted}}
.f a{color:${t.teal};font-weight:700;text-decoration:none}.f a:hover{text-decoration:underline}
</style></head><body>${body}</body></html>`;

  return new Response(html, {
    status,
    headers: { ...headers, "Cache-Control": status === 200 ? "public, max-age=300, s-maxage=600" : "no-store" },
  });
}
