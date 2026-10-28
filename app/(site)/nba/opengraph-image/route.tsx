import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

// League card shared by /nba, /nba/{season} and /nba/players. A plain route handler (not the opengraph-image
// file convention) so the URL is stable: /nba/opengraph-image.
export async function GET() {
  let iconSrc: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), "public/brand/icon-white-128.png"));
    iconSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    // icon optional
  }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0F14",
          color: "#E6EDF3",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {iconSrc ? <img src={iconSrc} width={44} height={47} alt="" /> : null}
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 2, color: "#14B8A6" }}>RUPTURE REPORT</div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 2,
              padding: "4px 16px",
              borderRadius: 999,
              border: "3px solid #14B8A6",
            }}
          >
            NBA
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.05 }}>NBA ACL &amp; Achilles</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.05, color: "#14B8A6" }}>Tear Tracker</div>
          <div style={{ display: "flex", fontSize: 36, color: "#8B98A5", marginTop: 24 }}>
            Every torn ACL and Achilles, from injury to return.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "2px solid #1F2933",
            paddingTop: 28,
            fontSize: 26,
            color: "#8B98A5",
          }}
        >
          rupturereport.com/nba
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
