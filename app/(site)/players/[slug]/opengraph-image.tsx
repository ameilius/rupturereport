import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { STAGE_LABELS, formatInjuryType, getPlayerBySlug } from "@/lib/players";

export const alt = "Rupture Report player injury & recovery tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connection();

  let name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  let team = "";
  let injury = "ACL / Achilles";
  let stage = "Recovery tracker";
  try {
    const data = await getPlayerBySlug(slug);
    if (data) {
      name = data.player.fullName;
      team = [data.player.position, data.player.team?.name]
        .filter(Boolean)
        .join(" · ");
      const i = data.injuries[0];
      if (i) {
        injury = `${formatInjuryType(i.injuryType)} injury`;
        const latest = i.updates.at(-1);
        stage = latest ? STAGE_LABELS[latest.stage] : "Awaiting update";
      }
    }
  } catch {
    // DB unavailable: fall back to slug-based card
  }

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
          {iconSrc ? (
            <img src={iconSrc} width={44} height={47} alt="" />
          ) : (
            <div style={{ width: 20, height: 20, borderRadius: 10, background: "#14B8A6" }} />
          )}
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#14B8A6",
            }}
          >
            RUPTURE REPORT
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              color: "#F59E0B",
            }}
          >
            {injury}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: name.length > 22 ? 72 : 92,
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: 12,
            }}
          >
            {name}
          </div>
          {team ? (
            <div
              style={{
                display: "flex",
                fontSize: 36,
                color: "#8B98A5",
                marginTop: 16,
              }}
            >
              {team}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #1F2933",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 32 }}>
            <span style={{ color: "#8B98A5", marginRight: 12 }}>
              Current stage:
            </span>
            <span style={{ color: "#14B8A6", fontWeight: 700 }}>{stage}</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#8B98A5" }}>
            rupturereport.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
