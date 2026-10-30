import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { League } from "@/lib/leagues";

/** Static, stable stats card (no DB): same look as the league cards. */
export async function statsOgResponse(league: League) {
  let iconSrc: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), "public/brand/icon-white-128.png"));
    iconSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {}
  const bars = [
    [0.35, 0.15], [0.5, 0.25], [0.3, 0.1], [0.65, 0.3], [0.45, 0.2], [0.8, 0.35], [0.55, 0.25],
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B0F14", color: "#E6EDF3", padding: "64px 72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {iconSrc ? <img src={iconSrc} width={64} height={64} alt="" /> : null}
          <div style={{ fontSize: 34, fontWeight: 700 }}>Rupture Report</div>
          <div style={{ marginLeft: "auto", display: "flex", fontSize: 26, fontWeight: 700, color: "#14B8A6", border: "2px solid #14B8A6", borderRadius: 999, padding: "6px 22px" }}>{league}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, color: "#14B8A6", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Stats</div>
            <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, marginTop: 8, display: "flex" }}>{`${league} tear stats`}</div>
            <div style={{ fontSize: 30, color: "#8B98A5", marginTop: 16, display: "flex" }}>{"ACL & Achilles tears, charted live"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 220, paddingBottom: 6, borderBottom: "2px solid #1F2933" }}>
            {bars.map(([a, b], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", width: 30 }}>
                <div style={{ height: b * 220, background: "#F59E0B", borderRadius: "4px 4px 0 0" }} />
                <div style={{ height: a * 220, background: "#14B8A6" }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 24, color: "#8B98A5", borderTop: "2px solid #1F2933", paddingTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#14B8A6" }}><div style={{ width: 18, height: 18, borderRadius: 4, background: "#14B8A6" }} />ACL</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F59E0B" }}><div style={{ width: 18, height: 18, borderRadius: 4, background: "#F59E0B" }} />Achilles</div>
          <span style={{ marginLeft: "auto" }}>{`rupturereport.com${league === "NBA" ? "/nba/stats" : "/stats"}`}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
