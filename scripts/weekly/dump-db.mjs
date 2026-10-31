#!/usr/bin/env node
// Dump current tears/players per league to JSON.
//   node scripts/weekly/dump-db.mjs [--out file.json] [--site https://rupturereport.com]
//   node scripts/weekly/dump-db.mjs --local [--out file.json]   (local rrtest DB; NFL game data there is incomplete)
// Default source is the LIVE site (/llms-full.txt, computed live from the production DB): read-only, no credentials.
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SITE = opt("--site", "https://rupturereport.com").replace(/\/$/, "");
const OUT = opt("--out", null);
const UA = { "User-Agent": "Mozilla/5.0 (RuptureReport weekly tooling)" };

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const iso = (s) => { const m = /([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/.exec(s ?? ""); return m ? `${m[3]}-${String(MONTHS[m[1]]).padStart(2, "0")}-${m[2].padStart(2, "0")}` : null; };

async function fromLive() {
  const res = await fetch(`${SITE}/llms-full.txt`, { headers: UA });
  if (!res.ok) throw new Error(`llms-full.txt ${res.status}`);
  const txt = await res.text();
  const out = { source: `${SITE}/llms-full.txt`, fetchedAt: new Date().toISOString(), leagues: {} };
  for (const league of ["NFL", "NBA"]) {
    const tot = new RegExp(`## ${league}\\n\\n(\\S+) season totals \\(computed live, data last updated ([^)]+)\\): (\\d+) tracked tears — (\\d+) ACL and (\\d+) Achilles`).exec(txt);
    const sec = new RegExp(`## ${league} players \\((\\d+)\\)\\n\\n([\\s\\S]*?)(?=\\n## |$)`).exec(txt);
    const players = [];
    for (const line of (sec?.[2] ?? "").split("\n")) {
      const m = /^- \[(.+?)\]\((\S+)\): (.*)$/.exec(line);
      if (!m) continue;
      const [, name, url, body] = m;
      const pt = /^.+?, (\S+) for the (.+?), tore his (ACL|Achilles) on ([A-Z][a-z]{2} \d{1,2}, \d{4})/.exec(body);
      const stage = /Current stage: ([^(.]+?)\s*(?:\(updated ([^)]+)\))?\.?$/.exec(body);
      players.push({
        name,
        slug: url.split("/").pop(),
        url,
        position: pt?.[1] ?? null,
        team: pt?.[2] ?? null,
        injuryType: pt?.[3] ?? null,
        tearDate: iso(pt?.[4]),
        surface: /on (artificial turf|natural grass|hybrid grass)/.exec(body)?.[1] ?? null,
        inGame: /during .*(practice|workout)/.test(body) ? false : / in (Week|a |Game|the )| (vs|at) the /.test(body) ? true : null,
        stage: stage?.[1]?.trim() ?? null,
        stageUpdated: iso(stage?.[2]),
        summary: body,
      });
    }
    out.leagues[league] = {
      season: tot?.[1] ?? null,
      updated: iso(tot?.[2]),
      totals: tot ? { tears: +tot[3], acl: +tot[4], achilles: +tot[5] } : null,
      playersTracked: sec ? +sec[1] : players.length,
      players,
    };
  }
  return out;
}

async function fromLocal() {
  const mysql = (await import("mysql2/promise")).default;
  const c = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1", user: process.env.DB_USER ?? "rrlocal",
    password: process.env.DB_PASSWORD ?? "rrlocal", database: process.env.DB_NAME ?? "rrtest",
  });
  const [rows] = await c.query(`
    SELECT p.league, p.slug, CONCAT(p.first_name,' ',p.last_name) name, p.position, t.abbreviation team,
           i.injury_type injuryType, DATE_FORMAT(i.injury_date,'%Y-%m-%d') tearDate, i.season, i.week, i.phase, i.body_side side,
           (SELECT u.stage FROM progress_updates u WHERE u.injury_id=i.id ORDER BY u.update_date DESC, u.id DESC LIMIT 1) stage
    FROM injuries i JOIN players p ON p.id=i.player_id LEFT JOIN teams t ON t.id=p.team_id ORDER BY p.league, i.injury_date DESC`);
  await c.end();
  const out = { source: "local rrtest", fetchedAt: new Date().toISOString(), leagues: {} };
  for (const r of rows) (out.leagues[r.league] ??= { players: [] }).players.push(r);
  return out;
}

const data = args.includes("--local") ? await fromLocal() : await fromLive();
const json = JSON.stringify(data, null, 2);
if (OUT) { writeFileSync(OUT, json + "\n"); console.error(`wrote ${OUT}`); } else console.log(json);
for (const [l, v] of Object.entries(data.leagues)) console.error(`${l}: ${v.players.length} rows${v.totals ? ` · ${v.totals.tears} tears (${v.totals.acl} ACL / ${v.totals.achilles} Achilles)` : ""}`);
