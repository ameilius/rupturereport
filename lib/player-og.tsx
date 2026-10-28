/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { contrast, initials, isCustomUpload, localImage, teamColors, textOn } from "@/lib/images";
import { bioLine } from "@/lib/format";
import { readUpload } from "@/lib/uploads";
import { STAGE_LABELS, formatInjuryType, getPlayerBySlug } from "@/lib/players";
import { seasonLabel, type League } from "@/lib/leagues";

export const ogSize = { width: 1200, height: 630 };

/** Shared player share card (NFL and NBA). The NBA variant adds a league pill and uses the team accent for the headshot border. */
export async function renderPlayerOg(slug: string, league: League = "NFL") {
  const size = ogSize;
  const nba = league === "NBA";
  await connection();

  let name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  let team = "";
  let teamAbbr: string | null = null;
  let headshotPath: string | null = null;
  let logoPath: string | null = null;
  let injury = "ACL / Achilles";
  let stage = "Recovery tracker";
  let bio: string | null = null;
  try {
    const data = await getPlayerBySlug(slug, league);
    if (data) {
      name = data.player.fullName;
      team = [data.player.position, data.player.team?.name]
        .filter(Boolean)
        .join(" · ");
      teamAbbr = data.player.team?.abbreviation ?? null;
      headshotPath = data.player.headshotPath;
      logoPath = data.player.team?.logoPath ?? null;
      bio = bioLine(data.player);
      const i = data.injuries[0];
      if (i) {
        injury = `${formatInjuryType(i.injuryType)} tear · ${seasonLabel(league, i.season ?? 0)} season`;
        const latest = i.updates.at(-1);
        stage = latest ? STAGE_LABELS[latest.stage] : "Awaiting update";
      }
    }
  } catch {
    // DB unavailable: fall back to slug-based card
  }

  async function dataUrl(publicPath: string | null): Promise<string | null> {
    const p = localImage(publicPath);
    if (!p) return null;
    try {
      const buf = isCustomUpload(p)
        ? await readUpload(p)
        : await readFile(join(process.cwd(), "public", p));
      if (!buf) return null;
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  }
  const [headshotSrc, logoSrc] = await Promise.all([dataUrl(headshotPath), dataUrl(logoPath)]);
  const [primary, secondary] = teamColors(teamAbbr, league);
  const accent = contrast(primary, "#121821") >= contrast(secondary, "#121821") ? primary : secondary;

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
          {nba ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#E6EDF3",
                padding: "4px 16px",
                borderRadius: 999,
                border: `3px solid ${accent}`,
              }}
            >
              NBA
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
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
                alignItems: "center",
                color: "#8B98A5",
                marginTop: 16,
              }}
            >
              {logoSrc ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 28, background: "rgba(241,245,249,0.92)", marginRight: 16 }}>
                  <img src={logoSrc} width={40} height={40} alt="" />
                </div>
              ) : null}
              {team}
            </div>
          ) : null}
          {bio ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                fontSize: 30,
                fontWeight: 600,
                color: "#E6EDF3",
                marginTop: 18,
                padding: "8px 18px",
                borderRadius: 10,
                background: "#121821",
                borderLeft: `6px solid ${accent}`,
              }}
            >
              {bio}
            </div>
          ) : null}
        </div>
          {headshotSrc ? (
            <img
              src={headshotSrc}
              width={260}
              height={260}
              alt=""
              style={{ borderRadius: 130, border: `6px solid ${nba ? accent : "#14B8A6"}`, background: "#121821" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 260,
                height: 260,
                borderRadius: 130,
                background: primary,
                color: textOn(primary),
                fontSize: 104,
                fontWeight: 800,
                border: `6px solid ${nba ? accent : secondary}`,
              }}
            >
              {initials(name)}
            </div>
          )}
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
