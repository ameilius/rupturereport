import { formatDate } from "@/lib/format";
import { injurySentence, trackerFaq, trackerRowFacts } from "@/lib/summaries";
import { DATA_LICENSE_URL, SITE_NAME, SITE_URL, TERMS_URL } from "@/lib/structured-data";
import { computeStats, getCarryover, getTrackerRows } from "@/lib/tracker";
import { LEAGUE, getSeasonInfo } from "@/lib/seasons";

export async function buildLlmsTxt(full: boolean): Promise<string> {
  const info = await getSeasonInfo();
  const SEASON = String(info.current);
  const [all, carry] = await Promise.all([getTrackerRows(), getCarryover(info.current)]);
  const rows = all.filter((r) => r.season === info.current);
  const s = computeStats(rows);
  const updated = rows.reduce<string | null>((m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m), null);
  const L: string[] = [];
  L.push(`# ${SITE_NAME}`, "");
  L.push(
    `> ${SITE_NAME} is an independent tracker of every torn ACL and Achilles in the ${LEAGUE}, season by season (each season includes its offseason, preseason and regular season), with tear date, team, position, game context, stadium, playing surface (artificial turf vs natural grass), mechanism and recovery stage for each player. The current season is ${SEASON}.`,
    "",
  );
  L.push(
    `${SEASON} season totals (computed live${updated ? `, data last updated ${formatDate(updated)}` : ""}): ${s.total} tracked tears — ${s.acl} ACL and ${s.achilles} Achilles.` +
      (s.games ? ` ${s.games} happened in games; ${s.artificialPct}% of those on artificial turf.` : "") +
      (s.mechanismKnown ? ` ${s.nonContactPct}% of tears with a known mechanism were non-contact.` : "") +
      (carry.stillRecovering.length ? ` ${carry.stillRecovering.length} tear${carry.stillRecovering.length === 1 ? "" : "s"} from earlier seasons ${carry.stillRecovering.length === 1 ? "is" : "are"} still in recovery (not counted in ${SEASON} totals).` : "") +
      (carry.prevPlayers ? ` ${carry.prevReturnedPlayers} of ${carry.prevPlayers} players from the ${carry.prevSeason} season are back on the field.` : ""),
    "",
  );
  L.push("## Data and license", "");
  L.push(`- Data license: Creative Commons Attribution 4.0 (CC BY 4.0) — ${DATA_LICENSE_URL}`);
  L.push(`- Attribution: cite "${SITE_NAME}" and link to ${SITE_URL} (or the specific player page).`);
  L.push(`- Terms: ${TERMS_URL}`);
  L.push("- Facts only: fields are published only when reported by credible sources; unknown values are left blank, not estimated.", "");
  L.push("## Key pages", "");
  L.push(`- [Tear tracker, ${SEASON} season](${SITE_URL}/): current season table, summary stats, surface breakdown and FAQ`);
  for (const y of info.withData.filter((y) => y !== info.current)) {
    L.push(`- [${y} season archive](${SITE_URL}/${y}): every tracked ${y} tear with stats and FAQ`);
  }
  L.push(`- [All players](${SITE_URL}/players): index of every tracked player`);
  L.push(`- [Terms & data license](${TERMS_URL})`);
  L.push(`- [Contact](${SITE_URL}/contact): corrections and data requests (contact@rupturereport.com)`);
  L.push(`- [Sitemap](${SITE_URL}/sitemap.xml)`);
  if (!full) L.push(`- [Full text version](${SITE_URL}/llms-full.txt): every player summary and FAQ`);
  L.push("", "## Players", "");
  const seen = new Set<string>();
  for (const r of all) {
    if (seen.has(r.slug)) continue;
    seen.add(r.slug);
    const url = `${SITE_URL}/players/${r.slug}`;
    if (full) L.push(`- [${r.name}](${url}): ${injurySentence(trackerRowFacts(r))}`);
    else L.push(`- [${r.name}](${url}): ${[r.position, r.teamName, `${r.injuryType} tear`, formatDate(r.injuryDate), `${r.season} season`].filter(Boolean).join(", ")}`);
  }
  if (full) {
    L.push("", `## FAQ (${SEASON} season)`, "");
    for (const f of trackerFaq(rows, LEAGUE, SEASON)) L.push(`### ${f.q}`, "", f.a, "");
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
