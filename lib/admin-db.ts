import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export const POSITIONS = [
  "QB", "RB", "FB", "WR", "TE", "OT", "OG", "C", "OL",
  "DE", "DT", "NT", "DL", "EDGE", "OLB", "ILB", "LB", "CB", "S", "DB",
  "K", "P", "LS",
] as const;
export const INJURY_TYPES = ["ACL", "Achilles", "MCL", "other"] as const;
export const HOME_AWAY = ["home", "away", "neutral"] as const;
export const MECHANISMS = ["non_contact", "contact", "other"] as const;
export const BODY_SIDES = ["left", "right", "bilateral", "unknown"] as const;
export const PHASES = ["preseason", "regular", "playoffs"] as const;
export const SURFACE_TYPES = ["natural", "hybrid", "artificial"] as const;
export const STAGES = [
  "diagnosis", "surgery", "immobilization", "non_weight_bearing",
  "weight_bearing", "jogging", "cutting", "practice_limited",
  "practice_full", "game_ready", "returned", "reinjured",
] as const;

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

export async function uniqueSlug(
  table: "players" | "stadiums",
  base: string,
  excludeId?: number,
): Promise<string> {
  const root = base || "item";
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT slug FROM ${table} WHERE (slug = ? OR slug LIKE ?) AND id <> ?`,
    [root, `${root}-%`, excludeId ?? 0],
  );
  const taken = new Set(rows.map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let i = 2; ; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
}

const q = async <T = RowDataPacket>(sql: string, params: unknown[] = []) =>
  (await pool.query<RowDataPacket[]>(sql, params))[0] as unknown as T[];
export const exec = async (sql: string, params: unknown[] = []) =>
  (await pool.query<ResultSetHeader>(sql, params))[0];

export type Row = Record<string, unknown> & RowDataPacket;

export async function getCounts() {
  const [r] = await q<Row>(
    `SELECT (SELECT COUNT(*) FROM players) players,
            (SELECT COUNT(*) FROM injuries) injuries,
            (SELECT COUNT(*) FROM progress_updates) updates,
            (SELECT COUNT(*) FROM stadiums) stadiums,
            (SELECT COUNT(*) FROM teams) teams`,
  );
  return r;
}

export const recentInjuries = (limit = 10) =>
  q<Row>(
    `SELECT i.id, i.injury_type, i.injury_date, p.first_name, p.last_name, p.id player_id
       FROM injuries i JOIN players p ON p.id = i.player_id
      ORDER BY i.created_at DESC, i.id DESC LIMIT ?`,
    [limit],
  );

export const recentUpdates = (limit = 10) =>
  q<Row>(
    `SELECT u.id, u.stage, u.update_date, u.status_label, u.injury_id,
            p.first_name, p.last_name, i.injury_type
       FROM progress_updates u
       JOIN injuries i ON i.id = u.injury_id
       JOIN players p ON p.id = i.player_id
      ORDER BY u.created_at DESC, u.id DESC LIMIT ?`,
    [limit],
  );

export const listTeams = () =>
  q<Row>(`SELECT id, abbreviation, name FROM teams ORDER BY name`);

export const listStadiums = () =>
  q<Row>(`SELECT * FROM stadiums ORDER BY name`);

export const getStadium = async (id: number) =>
  (await q<Row>(`SELECT * FROM stadiums WHERE id = ?`, [id]))[0] ?? null;

export const searchPlayers = (term: string) =>
  q<Row>(
    `SELECT p.id, p.first_name, p.last_name, p.slug, p.position, p.headshot_path, t.abbreviation team,
            (SELECT COUNT(*) FROM injuries i WHERE i.player_id = p.id) injury_count
       FROM players p LEFT JOIN teams t ON t.id = p.team_id
      WHERE ? = '' OR CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR p.slug LIKE ?
      ORDER BY p.last_name, p.first_name LIMIT 200`,
    [term, `%${term}%`, `%${term}%`],
  );

export const getPlayer = async (id: number) =>
  (await q<Row>(`SELECT * FROM players WHERE id = ?`, [id]))[0] ?? null;

export const getPlayerInjuries = (playerId: number) =>
  q<Row>(
    `SELECT i.*, s.name stadium_name, o.name opponent_name
       FROM injuries i
       LEFT JOIN stadiums s ON s.id = i.stadium_id
       LEFT JOIN teams o ON o.id = i.opponent_id
      WHERE i.player_id = ? ORDER BY i.injury_date DESC`,
    [playerId],
  );

export const getInjury = async (id: number) =>
  (
    await q<Row>(
      `SELECT i.*, p.first_name, p.last_name, p.slug player_slug, p.headshot_path, t.abbreviation team_abbr
         FROM injuries i JOIN players p ON p.id = i.player_id
         LEFT JOIN teams t ON t.id = p.team_id WHERE i.id = ?`,
      [id],
    )
  )[0] ?? null;

export const getUpdates = (injuryId: number) =>
  q<Row>(
    `SELECT * FROM progress_updates WHERE injury_id = ?
      ORDER BY update_date DESC, id DESC`,
    [injuryId],
  );

/** Slug + current image path for a player or team (table/column come from a fixed whitelist). */
export async function getImageRow(
  table: "players" | "teams",
  column: "headshot_path" | "logo_path",
  id: number,
) {
  const sql =
    table === "players"
      ? `SELECT slug, headshot_path AS path FROM players WHERE id = ?`
      : `SELECT slug, logo_path AS path FROM teams WHERE id = ?`;
  void column;
  return (await q<Row>(sql, [id]))[0] ?? null;
}

export const listTeamsFull = () =>
  q<Row>(`SELECT id, abbreviation, name, slug, conference, division, logo_path FROM teams ORDER BY name`);

export const getTeam = async (id: number) =>
  (await q<Row>(`SELECT * FROM teams WHERE id = ?`, [id]))[0] ?? null;
