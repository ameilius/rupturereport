/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { connection } from "next/server";
import { getSeasonInfo } from "@/lib/seasons";
import { getTrackerRows } from "@/lib/tracker";
import { getLeagueStats } from "@/lib/stats";
import { leagueOgVersion } from "@/lib/og";
import { seasonLabel, type League } from "@/lib/leagues";
import { formatDate } from "@/lib/format";

export interface LeagueSummary {
  season: number;
  total: number;
  acl: number;
  achilles: number;
  updated: string | null;
}

/** Current-season counts (same rows and rules as the tracker and /stats). */
export async function leagueSummary(league: League): Promise<LeagueSummary> {
  const info = await getSeasonInfo(league);
  const rows = await getTrackerRows({ league, season: info.current });
  const updated = rows.reduce<string | null>((m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m), null);
  return {
    season: info.current,
    total: rows.length,
    acl: rows.filter((r) => r.injuryType === "ACL").length,
    achilles: rows.filter((r) => r.injuryType === "Achilles").length,
    updated,
  };
}

/** `?v=` for a league/stats card; null (no param) if the DB is unavailable. */
export async function liveLeagueOgVersion(league: League): Promise<string | null> {
  try {
    return leagueOgVersion(await leagueSummary(league));
  } catch {
    return null;
  }
}

const TEAL = "#14B8A6";
const AMBER = "#F59E0B";
const MUTED = "#8B98A5";

async function icon(): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public/brand/icon-white-128.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function Kpi({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", paddingRight: 44, marginRight: 44, borderRight: "2px solid #1F2933" }}>
      <div style={{ display: "flex", fontSize: 88, fontWeight: 900, lineHeight: 1, color }}>{String(n)}</div>
      <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 3, color: MUTED, marginTop: 10 }}>{label}</div>
    </div>
  );
}

/**
 * League hub ("/", "/nba") and stats ("/stats", "/nba/stats") share cards: one design for both leagues, with live
 * current-season counts. Same header as the player cards (icon, RUPTURE REPORT, league pill).
 */
export async function leagueOgResponse(league: League, kind: "hub" | "stats") {
  await connection();
  const nba = league === "NBA";
  let s: LeagueSummary | null = null;
  let series: { acl: number; achilles: number }[] = [];
  try {
    if (kind === "stats") {
      const st = await getLeagueStats(league);
      s = { season: st.season, total: st.total, acl: st.acl, achilles: st.achilles, updated: st.updated };
      series = st.series.slice(-12).map((b) => ({ acl: b.acl, achilles: b.achilles }));
    } else {
      s = await leagueSummary(league);
    }
  } catch {
    s = null; // DB unavailable: card without numbers
  }
  const iconSrc = await icon();
  const label = s ? seasonLabel(league, s.season) : null;
  const max = Math.max(1, ...series.map((b) => b.acl + b.achilles));
  const path = `rupturereport.com${nba ? "/nba" : ""}${kind === "stats" ? "/stats" : ""}`;
  const sub =
    kind === "stats"
      ? nba
        ? "Every torn ACL and Achilles on the court, charted."
        : "Every torn ACL and Achilles on the field, charted."
      : nba
        ? "Every torn ACL and Achilles on the court, from tear to return."
        : "Every torn ACL and Achilles, from tear to return.";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B0F14", color: "#E6EDF3", padding: "56px 72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {iconSrc ? <img src={iconSrc} width={44} height={47} alt="" /> : <div style={{ width: 20, height: 20, borderRadius: 10, background: TEAL }} />}
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 2, color: TEAL }}>RUPTURE REPORT</div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 800, letterSpacing: 2, padding: "4px 16px", borderRadius: 999, border: `3px solid ${TEAL}` }}>{league}</div>
          {label ? <div style={{ display: "flex", marginLeft: "auto", fontSize: 26, fontWeight: 700, color: MUTED }}>{`${label} season`}</div> : null}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {kind === "stats" ? (
              <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>
                <span>{`${league}\u00a0`}</span>
                <span style={{ color: TEAL }}>Tear Stats</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>{`${league} ACL & Achilles`}</div>
                <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1.05, color: TEAL }}>Tear Tracker</div>
              </div>
            )}
            <div style={{ display: "flex", fontSize: 30, color: MUTED, marginTop: 16 }}>{sub}</div>
          </div>
          {kind === "stats" && series.length > 1 ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 190, paddingBottom: 4, borderBottom: "2px solid #1F2933" }}>
              {series.map((b, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: 18, height: 186 }}>
                  {b.achilles ? <div style={{ display: "flex", height: Math.round((b.achilles / max) * 186), background: AMBER, borderRadius: b.acl ? "3px 3px 0 0" : 3 }} /> : null}
                  {b.acl ? <div style={{ display: "flex", height: Math.round((b.acl / max) * 186), background: TEAL, borderRadius: b.achilles ? 0 : "3px 3px 0 0" }} /> : null}
                  {!b.acl && !b.achilles ? <div style={{ display: "flex", height: 3, background: "#1F2933" }} /> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderTop: "2px solid #1F2933", paddingTop: 26 }}>
          {s ? (
            <div style={{ display: "flex" }}>
              <Kpi n={s.total} label={s.total === 1 ? "TEAR" : "TEARS"} color="#E6EDF3" />
              <Kpi n={s.acl} label="ACL" color={TEAL} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 88, fontWeight: 900, lineHeight: 1, color: AMBER }}>{String(s.achilles)}</div>
                <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 3, color: MUTED, marginTop: 10 }}>ACHILLES</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 26, color: MUTED }}>
            {s?.updated ? <div style={{ display: "flex", fontSize: 22, marginBottom: 6 }}>{`Updated ${formatDate(s.updated)}`}</div> : null}
            <div style={{ display: "flex" }}>{path}</div>
          </div>
        </div>
      </div>
    ),
    // URLs carry ?v=<hash of these numbers>, so a short shared-cache window is plenty.
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" } },
  );
}
