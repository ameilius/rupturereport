/**
 * Season helpers (league-agnostic; one league today).
 * A "season" is the league year stored on injuries.season (it includes that year's offseason).
 * The current season comes from settings.current_season, falling back to the latest season
 * with data, then the calendar year.
 */
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export const LEAGUE = "NFL";

export interface SeasonInfo {
  current: number;
  /** Seasons that have at least one tracked tear, newest first. */
  withData: number[];
  /** Seasons shown in the switcher: withData plus the current season, newest first. */
  listed: number[];
}

const TTL = 30_000;
let cache: { info: SeasonInfo; at: number } | null = null;

export function invalidateSeasonCache() {
  cache = null;
}

export function parseSeason(v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (!/^\d{4}$/.test(s)) return null;
  const n = Number(s);
  return n >= 1920 && n <= 2200 ? n : null;
}

async function load(): Promise<SeasonInfo> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT DISTINCT season FROM injuries ORDER BY season DESC");
  const withData = rows.map((r) => Number(r.season)).filter((n) => Number.isInteger(n));
  let setting: number | null = null;
  try {
    const [s] = await pool.query<RowDataPacket[]>("SELECT v FROM settings WHERE k = 'current_season' LIMIT 1");
    setting = parseSeason(s[0]?.v);
  } catch {
    setting = null; // settings table not migrated yet
  }
  const current = setting ?? withData[0] ?? new Date().getUTCFullYear();
  const listed = [...new Set([current, ...withData])].sort((a, b) => b - a);
  return { current, withData, listed };
}

export async function getSeasonInfo(): Promise<SeasonInfo> {
  if (cache && Date.now() - cache.at < TTL) return cache.info;
  const info = await load();
  cache = { info, at: Date.now() };
  return info;
}

export async function getCurrentSeason(): Promise<number> {
  return (await getSeasonInfo()).current;
}

/** Path of a season hub: the current season lives at "/" (/{season} redirects there). */
export function seasonPath(season: number, current: number): string {
  return season === current ? "/" : `/${season}`;
}
