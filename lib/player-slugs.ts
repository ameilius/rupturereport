import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

// Small in-memory cache of public player slugs so the proxy can 404 unknown
// slugs before streaming starts (notFound() inside Suspense would yield 200).
let cache: { slugs: Set<string>; at: number } | null = null;
const TTL = 60_000;
const MIN_REFRESH = 5_000;

async function load(): Promise<Set<string>> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT slug FROM players",
  );
  cache = { slugs: new Set(rows.map((r) => String(r.slug))), at: Date.now() };
  return cache.slugs;
}

/** true/false when known; null when the DB is unavailable (caller should let the request through). */
export async function playerSlugExists(slug: string): Promise<boolean | null> {
  try {
    const age = cache ? Date.now() - cache.at : Infinity;
    let slugs = age < TTL && cache ? cache.slugs : await load();
    if (!slugs.has(slug) && cache && Date.now() - cache.at >= MIN_REFRESH) slugs = await load();
    return slugs.has(slug);
  } catch {
    return null;
  }
}
