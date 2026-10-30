import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { getCarryover, getTrackerRows, type TrackerRow } from "@/lib/tracker";
import { getSeasonInfo } from "@/lib/seasons";
import { cfg, seasonLabel, type League } from "@/lib/leagues";
import { STAGE_LABELS, STAGE_ORDER, type Stage } from "@/lib/players";

/** One ACL/Achilles split row (every breakdown on the stats page uses this shape). */
export interface Split {
  label: string;
  acl: number;
  achilles: number;
  total: number;
}

export interface SeriesBucket {
  start: string; // ISO date, bucket start
  acl: number;
  achilles: number;
  cumulative: number;
}

export interface LeagueStats {
  league: League;
  season: number;
  label: string;
  total: number;
  acl: number;
  achilles: number;
  inGame: number;
  nonGame: number;
  granularity: "week" | "month";
  series: SeriesBucket[];
  where: Split[];
  mechanism: Split[];
  mechanismKnown: number;
  /** null for leagues without surface data (NBA). */
  surface: { rows: Split[]; gamesWithSurface: number; gamesWithoutSurface: number } | null;
  positions: Split[];
  positionCounts: [string, number][];
  teams: (Split & { abbr: string })[];
  teamsWithTears: number;
  stages: { stage: Stage; label: string; count: number }[];
  surgery: { name: string; slug: string; team: string | null; type: string; tearDate: string; days: number }[];
  medianDaysToSurgery: number | null;
  ages: { known: number; average: number | null; youngest: AgePick | null; oldest: AgePick | null };
  repeats: { name: string; slug: string; team: string | null; note: string }[];
  busiest: { teams: string[]; total: number; acl: number; achilles: number } | null;
  carryover: { count: number; label: string };
  updated: string | null;
}

interface AgePick {
  name: string;
  slug: string;
  team: string | null;
  position: string | null;
  age: number;
}

interface Extra {
  injuryId: number;
  dob: string | null;
  surgery: string | null;
  notes: string | null;
  playerTears: number;
}

function iso(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

async function extras(ids: number[]): Promise<Map<number, Extra>> {
  if (!ids.length) return new Map();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.id, p.dob, i.severity_notes,
            (SELECT MIN(u.update_date) FROM progress_updates u WHERE u.injury_id = i.id AND u.stage = 'surgery') surgery,
            (SELECT COUNT(*) FROM injuries x WHERE x.player_id = i.player_id) tears
       FROM injuries i JOIN players p ON p.id = i.player_id
      WHERE i.id IN (?)`,
    [ids],
  );
  return new Map(
    rows.map((r) => [
      Number(r.id),
      { injuryId: Number(r.id), dob: iso(r.dob), surgery: iso(r.surgery), notes: r.severity_notes ?? null, playerTears: Number(r.tears) },
    ]),
  );
}

const split = (label: string, rows: TrackerRow[]): Split => {
  const acl = rows.filter((r) => r.injuryType === "ACL").length;
  const achilles = rows.filter((r) => r.injuryType === "Achilles").length;
  return { label, acl, achilles, total: rows.length };
};

const day = (s: string) => new Date(`${s}T00:00:00Z`);
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function ageAt(dob: string, at: string): number {
  const b = day(dob);
  const t = day(at);
  let a = t.getUTCFullYear() - b.getUTCFullYear();
  if (t.getUTCMonth() < b.getUTCMonth() || (t.getUTCMonth() === b.getUTCMonth() && t.getUTCDate() < b.getUTCDate())) a--;
  return a;
}

function buildSeries(rows: TrackerRow[], gran: "week" | "month", now: Date): SeriesBucket[] {
  const dates = rows.map((r) => r.injuryDate).filter((d): d is string => !!d).sort();
  if (!dates.length) return [];
  const first = day(dates[0]);
  let start: Date;
  if (gran === "week") {
    start = new Date(first);
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7)); // Monday
  } else {
    start = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
  }
  const last = new Date(Math.max(now.getTime(), day(dates[dates.length - 1]).getTime()));
  const out: SeriesBucket[] = [];
  let cum = 0;
  for (let cur = start; cur <= last; ) {
    const next =
      gran === "week"
        ? new Date(cur.getTime() + 7 * 86400000)
        : new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
    const inB = rows.filter((r) => r.injuryDate && day(r.injuryDate) >= cur && day(r.injuryDate) < next);
    const acl = inB.filter((r) => r.injuryType === "ACL").length;
    const achilles = inB.filter((r) => r.injuryType === "Achilles").length;
    cum += acl + achilles;
    out.push({ start: isoDay(cur), acl, achilles, cumulative: cum });
    cur = next;
  }
  return out;
}

// Prior tears of the same ligament/tendon mentioned in the sourced notes ("third tear", "tore his other Achilles" ...).
const REPEAT_RE = /[^.]*\b(?:(?:second|third|fourth)\s+(?:torn\s+)?(?:ACL|Achilles|tear)|(?:tearing|tore) the other Achilles|same (?:knee|ACL)[^.]*(?:again|before|previous))[^.]*\./i;

export function computeLeagueStats(
  league: League,
  season: number,
  rows: TrackerRow[],
  ex: Map<number, Extra>,
  carryCount: number,
  now = new Date(),
): LeagueStats {
  const c = cfg(league);
  const game = rows.filter((r) => r.isGame);
  const non = rows.filter((r) => !r.isGame);

  const mech = [
    split("Non-contact", rows.filter((r) => r.mechanism === "non_contact")),
    split("Contact", rows.filter((r) => r.mechanism === "contact")),
    split("Not reported", rows.filter((r) => !r.mechanism)),
  ];

  const surface = c.hasSurface
    ? {
        rows: [
          split("Artificial turf", game.filter((r) => r.surface === "artificial")),
          split("Natural grass", game.filter((r) => r.surface === "natural")),
          split("Hybrid grass", game.filter((r) => r.surface === "hybrid")),
          ...(game.some((r) => !r.surface) ? [split("Not reported", game.filter((r) => !r.surface))] : []),
        ],
        gamesWithSurface: game.filter((r) => r.surface).length,
        gamesWithoutSurface: game.filter((r) => !r.surface).length,
      }
    : null;

  const first = (p: string | null) => (p ?? "").toUpperCase().split(/[-/ ]/)[0];
  const grouped = new Set<number>();
  const positions = c.positionGroups.map((g) => {
    const r = rows.filter((x) => g.positions.includes(first(x.position)));
    r.forEach((x) => grouped.add(x.id));
    return split(g.label, r);
  });
  const other = rows.filter((x) => !grouped.has(x.id));
  if (other.length) positions.push(split("Other / not reported", other));
  const pc = new Map<string, number>();
  for (const r of rows) pc.set(r.position ?? "—", (pc.get(r.position ?? "—") ?? 0) + 1);
  const positionCounts = [...pc.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const byTeam = new Map<string, TrackerRow[]>();
  for (const r of rows) if (r.team) byTeam.set(r.team, [...(byTeam.get(r.team) ?? []), r]);
  const teams = [...byTeam.entries()]
    .map(([abbr, r]) => ({ abbr, ...split(abbr, r), name: r[0].teamName }))
    .sort((a, b) => b.total - a.total || b.achilles - a.achilles || a.abbr.localeCompare(b.abbr));
  const max = teams[0]?.total ?? 0;
  const busiest = max
    ? (() => {
        const top = teams.filter((t) => t.total === max);
        return {
          teams: top.map((t) => t.name ?? t.abbr),
          total: max,
          acl: top.length === 1 ? top[0].acl : 0,
          achilles: top.length === 1 ? top[0].achilles : 0,
        };
      })()
    : null;

  const stageCount = new Map<string, number>();
  for (const r of rows) stageCount.set(r.stage ?? "diagnosis", (stageCount.get(r.stage ?? "diagnosis") ?? 0) + 1);
  const stages = ([...STAGE_ORDER, "reinjured"] as Stage[])
    .map((s) => ({ stage: s, label: STAGE_LABELS[s], count: stageCount.get(s) ?? 0 }))
    .filter((s) => s.count > 0);

  const surgery = rows
    .map((r) => {
      const s = ex.get(r.id)?.surgery;
      if (!s || !r.injuryDate) return null;
      return {
        name: r.name,
        slug: r.slug,
        team: r.team,
        type: r.injuryType,
        tearDate: r.injuryDate,
        days: Math.round((day(s).getTime() - day(r.injuryDate).getTime()) / 86400000),
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x && x.days >= 0)
    .sort((a, b) => a.days - b.days || a.tearDate.localeCompare(b.tearDate));
  const sd = surgery.map((s) => s.days).sort((a, b) => a - b);
  const medianDaysToSurgery = sd.length
    ? sd.length % 2
      ? sd[(sd.length - 1) / 2]
      : (sd[sd.length / 2 - 1] + sd[sd.length / 2]) / 2
    : null;

  const aged = rows
    .map((r) => {
      const dob = ex.get(r.id)?.dob;
      return dob && r.injuryDate ? { r, age: ageAt(dob, r.injuryDate), dob } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const pick = (x: (typeof aged)[number] | undefined): AgePick | null =>
    x ? { name: x.r.name, slug: x.r.slug, team: x.r.team, position: x.r.position, age: x.age } : null;
  const byDob = [...aged].sort((a, b) => a.dob.localeCompare(b.dob));

  const repeats = rows
    .map((r) => {
      const e = ex.get(r.id);
      const m = e?.notes ? REPEAT_RE.exec(e.notes) : null;
      if (m) return { name: r.name, slug: r.slug, team: r.team, note: m[0].trim() };
      if (e && e.playerTears > 1) return { name: r.name, slug: r.slug, team: r.team, note: `${e.playerTears} tears tracked on Rupture Report.` };
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const updated = rows.reduce<string | null>((m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m), null);

  return {
    league,
    season,
    label: seasonLabel(league, season),
    total: rows.length,
    acl: rows.filter((r) => r.injuryType === "ACL").length,
    achilles: rows.filter((r) => r.injuryType === "Achilles").length,
    inGame: game.length,
    nonGame: non.length,
    granularity: c.seriesGranularity,
    series: buildSeries(rows, c.seriesGranularity, now),
    where: [split("In games", game), split("Practice / offseason", non)],
    mechanism: mech,
    mechanismKnown: rows.filter((r) => r.mechanism).length,
    surface,
    positions,
    positionCounts,
    teams,
    teamsWithTears: teams.length,
    stages,
    surgery,
    medianDaysToSurgery,
    ages: {
      known: aged.length,
      average: aged.length ? aged.reduce((s, x) => s + x.age, 0) / aged.length : null,
      youngest: pick(byDob[byDob.length - 1]),
      oldest: pick(byDob[0]),
    },
    repeats,
    busiest,
    carryover: { count: carryCount, label: "" },
    updated,
  };
}

/** Live stats for a league's CURRENT season (settings.current_season / current_season_nba). */
export async function getLeagueStats(league: League): Promise<LeagueStats> {
  const info = await getSeasonInfo(league);
  const [rows, carry] = await Promise.all([getTrackerRows({ league, season: info.current }), getCarryover(info.current, league)]);
  const ex = await extras(rows.map((r) => r.id));
  const s = computeLeagueStats(league, info.current, rows, ex, new Set(carry.stillRecovering.map((r) => r.slug)).size);
  const prevSeasons = [...new Set(carry.stillRecovering.map((r) => r.season))].sort();
  s.carryover.label = prevSeasons.map((y) => seasonLabel(league, y)).join(", ");
  return s;
}
