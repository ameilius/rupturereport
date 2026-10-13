import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { gated } from "@/lib/images";

export interface TrackerRow {
  id: number;
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
  stage: string | null;
  stageDate: string | null;
  lastModified: string | null;
}

function iso(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export async function getTrackerRows(): Promise<TrackerRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.id, p.slug, p.first_name, p.last_name, p.position,
            t.abbreviation team, t.name team_name, t.logo_path, p.headshot_path,
            i.injury_type, i.body_side, i.injury_date, i.week, i.phase, i.mechanism, i.home_away,
            o.abbreviation opponent, o.name opponent_name, s.name stadium, s.surface_type, s.surface_brand,
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
      ORDER BY i.injury_date DESC, i.id DESC`,
  );
  return rows.map((r) => ({
    id: Number(r.id),
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
    surface: r.surface_type ?? null,
    surfaceBrand: r.surface_brand ?? null,
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
    artificialPct: withSurface.length ? Math.round((artificial / withSurface.length) * 100) : null,
    naturalPct: withSurface.length ? 100 - Math.round((artificial / withSurface.length) * 100) : null,
    mechanismKnown: known.length,
    nonContactPct: known.length ? Math.round((nonContact / known.length) * 100) : null,
  };
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
