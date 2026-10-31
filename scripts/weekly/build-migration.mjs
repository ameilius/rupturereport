#!/usr/bin/env node
// Changes JSON -> next-numbered, idempotent, league-qualified migration in db/migrations/.
//   node scripts/weekly/build-migration.mjs changes.json [--name weekly_acl_achilles] [--dry-run]
// See scripts/weekly/README.md for the changes.json format and scripts/weekly/example-changes.json.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const MIG = join(ROOT, "db/migrations");
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--name");
if (!file) { console.error("usage: build-migration.mjs changes.json [--name slug] [--dry-run]"); process.exit(2); }
const nameArg = args.includes("--name") ? args[args.indexOf("--name") + 1] : null;
const ch = JSON.parse(readFileSync(file, "utf8"));

const LEAGUES = new Set(["NFL", "NBA"]);
const TYPES = new Set(["ACL", "Achilles"]);
const STAGES = new Set(["diagnosis", "surgery", "immobilization", "non_weight_bearing", "weight_bearing", "jogging", "cutting", "practice_limited", "practice_full", "game_ready", "returned", "reinjured"]);
const errs = [];
const need = (cond, msg) => { if (!cond) errs.push(msg); };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const q = (v) => (v == null || v === "" ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`);
const team = (l, abbr) => (abbr ? `(SELECT id FROM teams WHERE league = ${q(l)} AND abbreviation = ${q(abbr)})` : "NULL");
const stadium = (l, slug) => (slug ? `(SELECT id FROM stadiums WHERE league = ${q(l)} AND slug = ${q(slug)})` : "NULL");
const seasonExpr = (l, s) => (s != null ? q(s) : `COALESCE((SELECT CAST(s.v AS UNSIGNED) FROM settings s WHERE s.k = '${l === "NBA" ? "current_season_nba" : "current_season"}'), ${new Date().getUTCFullYear()})`);

const out = [];
const header = ch.summary ? ch.summary.split("\n").map((s) => `--   ${s}`) : [];
for (const p of ch.players ?? []) {
  need(LEAGUES.has(p.league), `player ${p.slug}: league must be NFL|NBA`);
  need(/^[a-z0-9-]+$/.test(p.slug ?? ""), `player ${p.slug}: bad slug`);
  need(p.firstName && p.lastName, `player ${p.slug}: firstName/lastName required`);
  if (p.dob) need(DATE.test(p.dob), `player ${p.slug}: dob YYYY-MM-DD`);
  out.push(`-- ${p.firstName} ${p.lastName} (${p.league}${p.team ? ` ${p.team}` : ""})`);
  out.push(`INSERT INTO players (league, first_name, last_name, slug, position, team_id)
SELECT ${q(p.league)}, ${q(p.firstName)}, ${q(p.lastName)}, ${q(p.slug)}, ${q(p.position)}, ${team(p.league, p.team)}
WHERE NOT EXISTS (SELECT 1 FROM players WHERE slug = ${q(p.slug)});`);
  const sets = [["dob", p.dob], ["height_in", p.heightIn], ["weight_lb", p.weightLb], ["headshot_path", p.headshot ?? (p.headshot === null ? null : `/players/${p.slug}.png`)]]
    .filter(([, v]) => v != null).map(([k, v]) => `${k} = COALESCE(${k}, ${q(v)})`);
  if (p.team) sets.push(`team_id = COALESCE(${team(p.league, p.team)}, team_id)`);
  if (sets.length) out.push(`UPDATE players SET ${sets.join(", ")} WHERE slug = ${q(p.slug)} AND league = ${q(p.league)};`);
  out.push("");
}
const injKey = (l, slug, type, date) => `p.slug = ${q(slug)} AND p.league = ${q(l)} AND i.injury_type = ${q(type)} AND i.injury_date = ${q(date)}`;
for (const t of ch.tears ?? []) {
  need(LEAGUES.has(t.league), `tear ${t.slug}: league`);
  need(TYPES.has(t.type), `tear ${t.slug}: type must be ACL|Achilles`);
  need(DATE.test(t.date ?? ""), `tear ${t.slug}: date YYYY-MM-DD`);
  need(t.source, `tear ${t.slug}: source URL required (confirmed data only)`);
  out.push(`-- Tear: ${t.slug} ${t.type} ${t.date}`);
  out.push(`INSERT INTO injuries (player_id, injury_type, injury_date, season, week, stadium_id, home_away, opponent_id, mechanism, body_side, phase, severity_notes, source)
SELECT p.id, ${q(t.type)}, ${q(t.date)}, ${seasonExpr(t.league, t.season)},
       ${q(t.week)}, ${stadium(t.league, t.stadium)}, ${q(t.homeAway)}, ${team(t.league, t.opponent)}, ${q(t.mechanism)}, ${q(t.side)}, ${q(t.phase)},
       ${q(t.notes)},
       ${q(t.source)}
FROM players p WHERE p.slug = ${q(t.slug)} AND p.league = ${q(t.league)}
  AND NOT EXISTS (SELECT 1 FROM injuries i WHERE i.player_id = p.id AND i.injury_type = ${q(t.type)} AND i.injury_date = ${q(t.date)});`);
  out.push("");
}
for (const u of ch.updates ?? []) {
  need(LEAGUES.has(u.league), `update ${u.slug}: league`);
  need(STAGES.has(u.stage), `update ${u.slug}: unknown stage ${u.stage}`);
  need(DATE.test(u.date ?? "") && DATE.test(u.tearDate ?? ""), `update ${u.slug}: date/tearDate YYYY-MM-DD`);
  need(u.source, `update ${u.slug}: source URL required`);
  out.push(`-- Update: ${u.slug} ${u.stage} ${u.date}`);
  out.push(`INSERT INTO progress_updates (injury_id, update_date, stage, status_label, notes, source)
SELECT i.id, ${q(u.date)}, ${q(u.stage)}, ${q(u.label)}, ${q(u.notes)}, ${q(u.source)}
FROM injuries i JOIN players p ON p.id = i.player_id
WHERE ${injKey(u.league, u.slug, u.type, u.tearDate)}
  AND NOT EXISTS (SELECT 1 FROM progress_updates x WHERE x.injury_id = i.id AND x.stage = ${q(u.stage)} AND x.update_date = ${q(u.date)});`);
  out.push("");
}
for (const u of ch.playerUpdates ?? []) {
  // Field fixes, e.g. a team change: { league, slug, team?, position?, statusNote? }
  need(LEAGUES.has(u.league), `playerUpdate ${u.slug}: league`);
  const sets = [];
  if (u.team) sets.push(`team_id = ${team(u.league, u.team)}`);
  if (u.position) sets.push(`position = ${q(u.position)}`);
  if ("statusNote" in u) sets.push(`status_note = ${q(u.statusNote)}`);
  if (sets.length) out.push(`UPDATE players SET ${sets.join(", ")} WHERE slug = ${q(u.slug)} AND league = ${q(u.league)}${u.team ? ` AND ${team(u.league, u.team)} IS NOT NULL` : ""};`, "");
}
if (!out.length) errs.push("no players/tears/updates in changes file");
if (errs.length) { console.error("Invalid changes:\n - " + errs.join("\n - ")); process.exit(1); }

const nums = readdirSync(MIG).map((f) => /^(\d{4})_/.exec(f)?.[1]).filter(Boolean).map(Number);
const next = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0");
const date = ch.date ?? new Date().toISOString().slice(0, 10);
const base = (nameArg ?? ch.name ?? "weekly_acl_achilles").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
const fname = `${next}_${base}_${date}.sql`;
const sql = [`-- ${next}: ${ch.title ?? base.replace(/_/g, " ")} (${date}). Generated by scripts/weekly/build-migration.mjs.`, ...header,
  "-- League-qualified lookups; every statement is guarded, so re-running is a no-op.", "SET NAMES utf8mb4;", "", ...out].join("\n");
if (args.includes("--dry-run")) { process.stdout.write(sql); process.exit(0); }
writeFileSync(join(MIG, fname), sql);
console.log(join("db/migrations", fname));
