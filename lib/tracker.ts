import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { gated } from "@/lib/images";
import { positionBucket, POSITION_BUCKETS, type League, type PositionBucket } from "@/lib/leagues";

export interface TrackerRow {
  id: number;
  season: number;
  slug: string;
  name: string;
  position: string | null;
  team: string | null;
  teamName: string | null;
  teamLogo: string | null;
  headshot: string | null;
  injuryType: string;
  bodySide: string | null;
  injuryDate: string | null;
  week: number | null;
  phase: string | null;
  mechanism: string | null;
  isGame: boolean;
  opponent: string | null;
  opponentName: string | null;
  homeAway: string | null;
  stadium: string | null;
  surface: string | null;
  surfaceBrand: string | null;
  /** Non-game tears: practice field surface/venue when a credible report states it. Never used in game-surface stats. */
  practiceSurface: string | null;
  practiceVenue: string | null;
  stage: string | null;
  stageDate: string | null;
  lastModified: string | null;
}

function iso(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

/**
 * Tracker rows, newest first. Progress updates always stay attached to their injury,
 * whatever their date, so a row's stage is its latest update ever.
 * - season: only tears from that season
 * - before: only tears from seasons earlier than this one
 * - league: 'NFL' (default) or 'NBA'
 */
export async function getTrackerRows(opts: { season?: number; before?: number; league?: League } = {}): Promise<TrackerRow[]> {
  const where: string[] = ["p.league = ?"];
  const params: unknown[] = [opts.league ?? "NFL"];
  if (opts.season != null) { where.push("i.season = ?"); params.push(opts.season); }
  if (opts.before != null) { where.push("i.season < ?"); params.push(opts.before); }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.id, i.season, p.slug, p.first_name, p.last_name, p.position,
            t.abbreviation team, t.name team_name, t.logo_path, p.headshot_path,
            i.injury_type, i.body_side, i.injury_date, i.week, i.phase, i.mechanism, i.home_away,
            o.abbreviation opponent, o.name opponent_name, s.name stadium, s.surface_type, s.surface_brand, i.practice_surface, i.practice_venue,
            (SELECT u.stage FROM progress_updates u WHERE u.injury_id = i.id
              ORDER BY u.update_date DESC, u.id DESC LIMIT 1) stage,
            (SELECT u.update_date FROM progress_updates u WHERE u.injury_id = i.id
              ORDER BY u.update_date DESC, u.id DESC LIMIT 1) stage_date,
            GREATEST(p.updated_at, i.updated_at,
              COALESCE((SELECT MAX(u.created_at) FROM progress_updates u WHERE u.injury_id = i.id), i.updated_at)) last_modified
       FROM injuries i
       JOIN players p ON p.id = i.player_id
       LEFT JOIN teams t ON t.id = p.team_id
       LEFT JOIN teams o ON o.id = i.opponent_id
       LEFT JOIN stadiums s ON s.id = i.stadium_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY i.injury_date DESC, i.id DESC`,
    params,
  );
  return rows.map((r) => ({
    id: Number(r.id),
    season: Number(r.season),
    slug: r.slug,
    name: `${r.first_name} ${r.last_name}`,
    position: r.position ?? null,
    team: r.team ?? null,
    teamName: r.team_name ?? null,
    teamLogo: gated(r.logo_path),
    headshot: gated(r.headshot_path),
    injuryType: r.injury_type,
    bodySide: r.body_side ?? null,
    injuryDate: iso(r.injury_date),
    week: r.week ?? null,
    phase: r.phase ?? null,
    mechanism: r.mechanism ?? null,
    isGame: r.stadium != null || r.opponent != null,
    opponent: r.opponent ?? null,
    opponentName: r.opponent_name ?? null,
    homeAway: r.home_away ?? null,
    stadium: r.stadium ?? null,
    surface: r.surface_type && r.surface_type !== "hardwood" ? r.surface_type : null,
    surfaceBrand: r.surface_brand ?? null,
    practiceSurface: r.practice_surface ?? null,
    practiceVenue: r.practice_venue ?? null,
    stage: r.stage ?? null,
    stageDate: iso(r.stage_date),
    lastModified: r.last_modified ? new Date(r.last_modified).toISOString() : null,
  }));
}

export function computeStats(rows: TrackerRow[]) {
  const withSurface = rows.filter((r) => r.surface);
  const artificial = withSurface.filter((r) => r.surface === "artificial").length;
  const known = rows.filter((r) => r.mechanism);
  const nonContact = known.filter((r) => r.mechanism === "non_contact").length;
  return {
    total: rows.length,
    acl: rows.filter((r) => r.injuryType === "ACL").length,
    achilles: rows.filter((r) => r.injuryType === "Achilles").length,
    games: withSurface.length,
    inGame: rows.filter((r) => r.isGame).length,
    inGamePct: rows.length ? Math.round((rows.filter((r) => r.isGame).length / rows.length) * 100) : null,
    artificialPct: withSurface.length ? Math.round((artificial / withSurface.length) * 100) : null,
    naturalPct: withSurface.length ? 100 - Math.round((artificial / withSurface.length) * 100) : null,
    mechanismKnown: known.length,
    nonContactPct: known.length ? Math.round((nonContact / known.length) * 100) : null,
  };
}

export interface PositionRow {
  bucket: PositionBucket;
  total: number;
  acl: number;
  achilles: number;
}

/** NBA: tears per position group (Guards / Wings-forwards / Bigs), always all three groups. */
export function positionBreakdown(rows: TrackerRow[]): PositionRow[] {
  return POSITION_BUCKETS.map((bucket) => {
    const r = rows.filter((x) => positionBucket(x.position) === bucket);
    return {
      bucket,
      total: r.length,
      acl: r.filter((x) => x.injuryType === "ACL").length,
      achilles: r.filter((x) => x.injuryType === "Achilles").length,
    };
  });
}

export interface WeeklySeries {
  start: string; // ISO date (Monday) of first bucket
  total: number[];
  acl: number[];
  achilles: number[];
}

/** Tears per calendar week (Mon–Sun, UTC) from the first tracked injury's week through the current week. */
export function weeklySeries(rows: TrackerRow[], now = new Date()): WeeklySeries | null {
  const dates = rows.filter((r) => r.injuryDate).map((r) => new Date(r.injuryDate!.slice(0, 10) + "T00:00:00Z"));
  if (!dates.length) return null;
  const monday = (d: Date) => {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
    return x;
  };
  const start = monday(new Date(Math.min(...dates.map((d) => d.getTime()))));
  const end = monday(new Date(Math.max(now.getTime(), ...dates.map((d) => d.getTime()))));
  const n = Math.round((end.getTime() - start.getTime()) / 604800000) + 1;
  const s: WeeklySeries = { start: start.toISOString().slice(0, 10), total: Array(n).fill(0), acl: Array(n).fill(0), achilles: Array(n).fill(0) };
  for (const r of rows) {
    if (!r.injuryDate) continue;
    const i = Math.floor((new Date(r.injuryDate.slice(0, 10) + "T00:00:00Z").getTime() - start.getTime()) / 604800000);
    s.total[i]++;
    if (r.injuryType === "ACL") s.acl[i]++;
    if (r.injuryType === "Achilles") s.achilles[i]++;
  }
  return s;
}

/**
 * Long-term recovery for season N: tears from earlier seasons not yet "returned"
 * (shown separately, never counted in season N totals), plus how many of the
 * previous season's tears have returned.
 */
export async function getCarryover(season: number, league: League = "NFL") {
  const earlier = await getTrackerRows({ before: season, league });
  const stillRecovering = earlier.filter((r) => r.stage !== "returned");
  const prev = earlier.filter((r) => r.season === season - 1);
  const prevReturnedPlayers = new Set(prev.filter((r) => r.stage === "returned").map((r) => r.slug)).size;
  const prevPlayers = new Set(prev.map((r) => r.slug)).size;
  return { stillRecovering, prevSeason: season - 1, prevPlayers, prevReturnedPlayers };
}
