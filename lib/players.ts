import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { gated } from "@/lib/images";

export type InjuryType = "ACL" | "Achilles" | "MCL" | "other";

export const STAGE_ORDER = [
  "diagnosis",
  "surgery",
  "immobilization",
  "non_weight_bearing",
  "weight_bearing",
  "jogging",
  "cutting",
  "practice_limited",
  "practice_full",
  "game_ready",
  "returned",
] as const;

export type Stage = (typeof STAGE_ORDER)[number] | "reinjured";

export const STAGE_LABELS: Record<Stage, string> = {
  diagnosis: "Diagnosis",
  surgery: "Surgery",
  immobilization: "Immobilization",
  non_weight_bearing: "Non-weight-bearing",
  weight_bearing: "Weight-bearing",
  jogging: "Jogging",
  cutting: "Cutting",
  practice_limited: "Limited practice",
  practice_full: "Full practice",
  game_ready: "Game ready",
  returned: "Returned",
  reinjured: "Re-injured",
};

export interface Team {
  id: number;
  abbreviation: string;
  name: string;
  slug: string;
  logoPath: string | null;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  slug: string;
  position: string | null;
  dob: string | null;
  heightIn: number | null;
  weightLb: number | null;
  updatedAt: string | null;
  headshotPath: string | null;
  team: Team | null;
}

export interface ProgressUpdate {
  id: number;
  injuryId: number;
  updateDate: string | null;
  stage: Stage;
  statusLabel: string | null;
  notes: string | null;
  source: string | null;
  createdAt: string | null;
}

export interface Injury {
  id: number;
  injuryType: InjuryType;
  injuryDate: string | null;
  season: number | null;
  week: number | null;
  homeAway: string | null;
  mechanism: string | null;
  bodySide: string | null;
  phase: string | null;
  severityNotes: string | null;
  source: string | null;
  updatedAt: string | null;
  stadium: {
    name: string;
    slug: string;
    city: string | null;
    state: string | null;
    surfaceType: string | null;
    surfaceBrand: string | null;
  } | null;
  opponent: { name: string; abbreviation: string } | null;
  updates: ProgressUpdate[];
}

export interface PlayerDetail {
  player: Player;
  injuries: Injury[];
  lastModified: string | null;
}

export interface PlayerListItem {
  slug: string;
  fullName: string;
  position: string | null;
  teamName: string | null;
  teamAbbreviation: string | null;
  teamLogo: string | null;
  headshotPath: string | null;
  injuryType: InjuryType;
  injuryDate: string | null;
  latestStage: Stage | null;
}

function toIsoDate(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString();
  return String(v);
}

function maxDate(dates: (string | null)[]): string | null {
  let best: string | null = null;
  for (const d of dates) {
    if (d && (!best || new Date(d) > new Date(best))) best = d;
  }
  return best;
}

export function formatInjuryType(t: InjuryType): string {
  return t === "other" ? "Major" : t;
}

export async function getPlayerBySlug(
  slug: string,
): Promise<PlayerDetail | null> {
  const [playerRows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.first_name, p.last_name, p.slug, p.position, p.dob,
            p.height_in, p.weight_lb, p.updated_at, p.headshot_path,
            t.id AS team_id, t.abbreviation AS team_abbr, t.name AS team_name,
            t.slug AS team_slug, t.logo_path AS team_logo
       FROM players p
       LEFT JOIN teams t ON t.id = p.team_id
      WHERE p.slug = ?
      LIMIT 1`,
    [slug],
  );
  const r = playerRows[0];
  if (!r) return null;

  const player: Player = {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    fullName: `${r.first_name} ${r.last_name}`,
    slug: r.slug,
    position: r.position ?? null,
    dob: toIsoDate(r.dob),
    heightIn: r.height_in ?? null,
    weightLb: r.weight_lb ?? null,
    updatedAt: toIsoDate(r.updated_at),
    headshotPath: gated(r.headshot_path),
    team: r.team_id
      ? {
          id: r.team_id,
          abbreviation: r.team_abbr,
          name: r.team_name,
          slug: r.team_slug,
          logoPath: gated(r.team_logo),
        }
      : null,
  };

  const [injuryRows] = await pool.query<RowDataPacket[]>(
    `SELECT i.*, s.name AS stadium_name, s.slug AS stadium_slug,
            s.city AS stadium_city, s.state AS stadium_state,
            s.surface_type, s.surface_brand,
            o.name AS opponent_name, o.abbreviation AS opponent_abbr
       FROM injuries i
       LEFT JOIN stadiums s ON s.id = i.stadium_id
       LEFT JOIN teams o ON o.id = i.opponent_id
      WHERE i.player_id = ?
      ORDER BY i.injury_date DESC, i.id DESC`,
    [player.id],
  );

  const injuryIds = injuryRows.map((i) => i.id as number);
  let updateRows: RowDataPacket[] = [];
  if (injuryIds.length > 0) {
    [updateRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM progress_updates
        WHERE injury_id IN (?)
        ORDER BY update_date ASC, id ASC`,
      [injuryIds],
    );
  }

  const injuries: Injury[] = injuryRows.map((i) => ({
    id: i.id,
    injuryType: i.injury_type,
    injuryDate: toIsoDate(i.injury_date),
    season: i.season ?? null,
    week: i.week ?? null,
    homeAway: i.home_away ?? null,
    mechanism: i.mechanism ?? null,
    bodySide: i.body_side ?? null,
    phase: i.phase ?? null,
    severityNotes: i.severity_notes ?? null,
    source: i.source ?? null,
    updatedAt: toIsoDate(i.updated_at),
    stadium: i.stadium_name
      ? {
          name: i.stadium_name,
          slug: i.stadium_slug,
          city: i.stadium_city ?? null,
          state: i.stadium_state ?? null,
          surfaceType: i.surface_type ?? null,
          surfaceBrand: i.surface_brand ?? null,
        }
      : null,
    opponent: i.opponent_name
      ? { name: i.opponent_name, abbreviation: i.opponent_abbr }
      : null,
    updates: updateRows
      .filter((u) => u.injury_id === i.id)
      .map((u) => ({
        id: u.id,
        injuryId: u.injury_id,
        updateDate: toIsoDate(u.update_date),
        stage: u.stage,
        statusLabel: u.status_label ?? null,
        notes: u.notes ?? null,
        source: u.source ?? null,
        createdAt: toIsoDate(u.created_at),
      })),
  }));

  const lastModified = maxDate([
    player.updatedAt,
    ...injuries.map((i) => i.updatedAt),
    ...injuries.flatMap((i) => i.updates.map((u) => u.createdAt)),
  ]);

  return { player, injuries, lastModified };
}

export async function getAllPlayerSlugs(): Promise<
  { slug: string; lastModified: string | null }[]
> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.slug, GREATEST(p.updated_at,
              COALESCE(MAX(i.updated_at), p.updated_at)) AS last_modified
       FROM players p
       JOIN injuries i ON i.player_id = p.id
      GROUP BY p.id, p.slug, p.updated_at
      ORDER BY p.slug`,
  );
  return rows.map((r) => ({
    slug: r.slug,
    lastModified: toIsoDate(r.last_modified),
  }));
}

export async function getInjuredPlayersList(): Promise<PlayerListItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.slug, p.first_name, p.last_name, p.position, p.headshot_path,
            t.name AS team_name, t.abbreviation AS team_abbr, t.logo_path AS team_logo,
            i.injury_type, i.injury_date,
            (SELECT pu.stage FROM progress_updates pu
              WHERE pu.injury_id = i.id
              ORDER BY pu.update_date DESC, pu.id DESC LIMIT 1) AS latest_stage
       FROM players p
       JOIN injuries i ON i.id = (
              SELECT i2.id FROM injuries i2 WHERE i2.player_id = p.id
               ORDER BY i2.injury_date DESC, i2.id DESC LIMIT 1)
       LEFT JOIN teams t ON t.id = p.team_id
      ORDER BY i.injury_date DESC, p.last_name ASC`,
  );
  return rows.map((r) => ({
    slug: r.slug,
    fullName: `${r.first_name} ${r.last_name}`,
    position: r.position ?? null,
    teamName: r.team_name ?? null,
    teamAbbreviation: r.team_abbr ?? null,
    teamLogo: gated(r.team_logo),
    headshotPath: gated(r.headshot_path),
    injuryType: r.injury_type,
    injuryDate: toIsoDate(r.injury_date),
    latestStage: r.latest_stage ?? null,
  }));
}
