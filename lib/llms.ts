import { formatDate } from "@/lib/format";
import { injurySentence, trackerFaq, trackerRowFacts } from "@/lib/summaries";
import { DATA_LICENSE_URL, SITE_NAME, SITE_URL, TERMS_URL } from "@/lib/structured-data";
import { computeStats, getCarryover, getTrackerRows } from "@/lib/tracker";
import { getSeasonInfo } from "@/lib/seasons";
import { playerPath, seasonLabel, type League } from "@/lib/leagues";

interface LeagueData {
  league: League;
  info: Awaited<ReturnType<typeof getSeasonInfo>>;
  label: string; // current season label ("2026", "2026-27")
  all: Awaited<ReturnType<typeof getTrackerRows>>;
  rows: Awaited<ReturnType<typeof getTrackerRows>>;
  carry: Awaited<ReturnType<typeof getCarryover>>;
  stats: ReturnType<typeof computeStats>;
  updated: string | null;
}

async function loadLeague(league: League): Promise<LeagueData> {
  const info = await getSeasonInfo(league);
  const [all, carry] = await Promise.all([getTrackerRows({ league }), getCarryover(info.current, league)]);
  const rows = all.filter((r) => r.season === info.current);
  const updated = rows.reduce<string | null>((m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m), null);
  return { league, info, label: seasonLabel(league, info.current), all, rows, carry, stats: computeStats(rows), updated };
}

/** Per-league totals paragraph (NFL wording is unchanged from the single-league file). */
function totalsLine(d: LeagueData): string {
  const { stats: s, carry, label, league, updated } = d;
  const nba = league === "NBA";
  return (
    `${label} season totals (computed live${updated ? `, data last updated ${formatDate(updated)}` : ""}): ${s.total} tracked tears — ${s.acl} ACL and ${s.achilles} Achilles.` +
    (nba
      ? s.total
        ? ` ${s.inGame} happened in games; ${s.total - s.inGame} in practices, workouts or other non-game settings.`
        : ""
      : s.games
        ? ` ${s.games} happened in games; ${s.artificialPct}% of those on artificial turf.`
        : "") +
    (s.mechanismKnown ? ` ${s.nonContactPct}% of tears with a known mechanism were non-contact.` : "") +
    (carry.stillRecovering.length ? ` ${carry.stillRecovering.length} tear${carry.stillRecovering.length === 1 ? "" : "s"} from earlier seasons ${carry.stillRecovering.length === 1 ? "is" : "are"} still in recovery (not counted in ${label} totals).` : "") +
    (carry.prevPlayers ? ` ${carry.prevReturnedPlayers} of ${carry.prevPlayers} players from the ${seasonLabel(league, carry.prevSeason)} season are back on the field.` : "")
  );
}

export async function buildLlmsTxt(full: boolean): Promise<string> {
  const [nfl, nba] = await Promise.all([loadLeague("NFL"), loadLeague("NBA")]);
  const both = [nfl, nba];
  const total = nfl.stats.total + nba.stats.total;
  const acl = nfl.stats.acl + nba.stats.acl;
  const ach = nfl.stats.achilles + nba.stats.achilles;
  const players = new Set([...nfl.all, ...nba.all].map((r) => r.slug)).size;
  const L: string[] = [];
  L.push(`# ${SITE_NAME}`, "");
  L.push(
    `> ${SITE_NAME} is an independent tracker of every torn ACL and Achilles in the NFL and the NBA, league by league and season by season (each season includes its offseason, preseason and regular season; NBA also covers Summer League and the playoffs), with tear date, team, position, game context, venue, playing surface (NFL: artificial turf vs natural grass), mechanism and recovery stage for each player. Current seasons: NFL ${nfl.label}, NBA ${nba.label}.`,
    "",
  );
  L.push(
    `Combined totals across both leagues' current seasons (computed live): ${total} tracked tears — ${acl} ACL and ${ach} Achilles (NFL ${nfl.stats.total}, NBA ${nba.stats.total}). ${players} players are tracked across all seasons (NFL ${new Set(nfl.all.map((r) => r.slug)).size}, NBA ${new Set(nba.all.map((r) => r.slug)).size}).`,
    "",
  );
  for (const d of both) {
    L.push(`## ${d.league}`, "", totalsLine(d), "");
  }
  L.push("## Data and license", "");
  L.push(`- Data license: Creative Commons Attribution 4.0 (CC BY 4.0) — ${DATA_LICENSE_URL}`);
  L.push(`- Attribution: cite "${SITE_NAME}" and link to ${SITE_URL} (or the specific player page).`);
  L.push(`- Terms: ${TERMS_URL}`);
  L.push("- Facts only: fields are published only when reported by credible sources; unknown values are left blank, not estimated.", "");
  L.push("## Key pages", "");
  L.push(`- [NFL tear tracker, ${nfl.label} season](${SITE_URL}/): current season table, summary stats, surface breakdown and FAQ`);
  for (const y of nfl.info.withData.filter((y) => y !== nfl.info.current)) {
    L.push(`- [NFL ${y} season archive](${SITE_URL}/${y}): every tracked ${y} tear with stats and FAQ`);
  }
  L.push(`- [All NFL players](${SITE_URL}/players): index of every tracked NFL player`);
  L.push(`- [NBA tear tracker, ${nba.label} season](${SITE_URL}/nba): current season table, summary stats, tears by position and FAQ`);
  for (const y of nba.info.withData.filter((y) => y !== nba.info.current)) {
    const l = seasonLabel("NBA", y);
    L.push(`- [NBA ${l} season archive](${SITE_URL}/nba/${l}): every tracked ${l} tear with stats and FAQ`);
  }
  L.push(`- [All NBA players](${SITE_URL}/nba/players): index of every tracked NBA player`);
  L.push(`- [Terms & data license](${TERMS_URL})`);
  L.push(`- [Contact](${SITE_URL}/contact): corrections and data requests (contact@rupturereport.com)`);
  L.push(`- [Sitemap](${SITE_URL}/sitemap.xml)`);
  if (!full) L.push(`- [Full text version](${SITE_URL}/llms-full.txt): every player summary and FAQ`);
  for (const d of both) {
    const n = new Set(d.all.map((r) => r.slug)).size;
    L.push("", `## ${d.league} players (${n})`, "");
    const seen = new Set<string>();
    for (const r of d.all) {
      if (seen.has(r.slug)) continue;
      seen.add(r.slug);
      const url = `${SITE_URL}${playerPath(d.league, r.slug)}`;
      if (full) L.push(`- [${r.name}](${url}): ${injurySentence(trackerRowFacts(r, d.league))}`);
      else L.push(`- [${r.name}](${url}): ${[r.position, r.teamName, `${r.injuryType} tear`, formatDate(r.injuryDate), `${seasonLabel(d.league, r.season ?? 0)} season`].filter(Boolean).join(", ")}`);
    }
  }
  if (full) {
    for (const d of both) {
      L.push("", `## ${d.league} FAQ (${d.label} season)`, "");
      for (const f of trackerFaq(d.rows, d.league, d.label)) L.push(`### ${f.q}`, "", f.a, "");
    }
  }
  return L.join("\n").trimEnd() + "\n";
}

export async function llmsResponse(full: boolean): Promise<Response> {
  try {
    return new Response(await buildLlmsTxt(full), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
    });
  } catch {
    return new Response(`# ${SITE_NAME}\n\nData temporarily unavailable. See ${SITE_URL}\n`, {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "300" },
    });
  }
}
