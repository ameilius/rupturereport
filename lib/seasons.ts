/**
 * Season helpers (league-agnostic; one league today).
 * A "season" is the league year stored on injuries.season (it includes that year's offseason).
 * The current season comes from settings.current_season, falling back to the latest season
 * with data, then the calendar year.
 */
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { cfg, homePath, parseSeasonSegment, seasonHubPath, type League } from "@/lib/leagues";

export const LEAGUE = "NFL";

export interface SeasonInfo {
  current: number;
  /** Seasons that have at least one tracked tear, newest first. */
  withData: number[];
  /** Seasons shown in the switcher: withData plus the current season, newest first. */
  listed: number[];
}

const TTL = 30_000;
const cache: Partial<Record<League, { info: SeasonInfo; at: number }>> = {};

export function invalidateSeasonCache() {
  delete cache.NFL;
  delete cache.NBA;
}

export function parseSeason(v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (!/^\d{4}$/.test(s)) return null;
  const n = Number(s);
  return n >= 1920 && n <= 2200 ? n : null;
}

async function load(league: League): Promise<SeasonInfo> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT DISTINCT i.season FROM injuries i JOIN players p ON p.id = i.player_id WHERE p.league = ? ORDER BY i.season DESC",
    [league],
  );
  const withData = rows.map((r) => Number(r.season)).filter((n) => Number.isInteger(n));
  let setting: number | null = null;
  try {
    const [s] = await pool.query<RowDataPacket[]>("SELECT v FROM settings WHERE k = ? LIMIT 1", [cfg(league).settingKey]);
    setting = parseSeason(s[0]?.v);
  } catch {
    setting = null; // settings table not migrated yet
  }
  const current = setting ?? withData[0] ?? new Date().getUTCFullYear();
  const listed = [...new Set([current, ...withData])].sort((a, b) => b - a);
  return { current, withData, listed };
}

export async function getSeasonInfo(league: League = "NFL"): Promise<SeasonInfo> {
  const hit = cache[league];
  if (hit && Date.now() - hit.at < TTL) return hit.info;
  const info = await load(league);
  cache[league] = { info, at: Date.now() };
  return info;
}

export async function getCurrentSeason(league: League = "NFL"): Promise<number> {
  return (await getSeasonInfo(league)).current;
}

/** Path of a season hub: the current season lives at the league home ("/" or "/nba"); archives at /{season} or /nba/{2025-26}. */
export function seasonPath(season: number, current: number, league: League = "NFL"): string {
  return seasonHubPath(league, season, current);
}

export { homePath, parseSeasonSegment };
