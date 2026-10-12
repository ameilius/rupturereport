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
  injuryDate: string | null;
  week: number | null;
  phase: string | null;
  mechanism: string | null;
  isGame: boolean;
  opponent: string | null;
  homeAway: string | null;
  stadium: string | null;
  surface: string | null;
  surfaceBrand: string | null;
  stage: string | null;
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
            i.injury_type, i.injury_date, i.week, i.phase, i.mechanism, i.home_away,
            o.abbreviation opponent, s.name stadium, s.surface_type, s.surface_brand,
            (SELECT u.stage FROM progress_updates u WHERE u.injury_id = i.id
              ORDER BY u.update_date DESC, u.id DESC LIMIT 1) stage
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
    injuryDate: iso(r.injury_date),
    week: r.week ?? null,
    phase: r.phase ?? null,
    mechanism: r.mechanism ?? null,
    isGame: r.stadium != null || r.opponent != null,
    opponent: r.opponent ?? null,
    homeAway: r.home_away ?? null,
    stadium: r.stadium ?? null,
    surface: r.surface_type ?? null,
    surfaceBrand: r.surface_brand ?? null,
    stage: r.stage ?? null,
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
