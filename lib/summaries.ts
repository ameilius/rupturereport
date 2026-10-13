/**
 * Plain-text, answer-friendly summaries built only from DB fields (league-agnostic).
 * Unknown parts are omitted rather than guessed.
 */
import { formatDate } from "@/lib/format";
import { STAGE_LABELS, type Stage } from "@/lib/players";
import type { TrackerRow } from "@/lib/tracker";

export interface InjuryFacts {
  name: string;
  position: string | null;
  teamName: string | null;
  injuryType: string;
  injuryDate: string | null;
  week: number | null;
  phase: string | null;
  isGame: boolean;
  opponent: string | null;
  homeAway: string | null;
  surface: string | null;
  stadium: string | null;
  stage: string | null;
  stageDate: string | null;
}

export function injuryNoun(type: string): string {
  if (type === "ACL") return "ACL";
  if (type === "Achilles") return "Achilles";
  if (type === "MCL") return "MCL";
  return "major injury";
}

function surfacePhrase(s: string | null): string | null {
  if (s === "artificial") return "artificial turf";
  if (s === "natural") return "natural grass";
  if (s === "hybrid") return "hybrid grass";
  return null;
}

export function stageLabel(stage: string | null): string | null {
  if (!stage) return null;
  return STAGE_LABELS[stage as Stage] ?? stage.replace(/_/g, " ");
}

export function injurySentence(f: InjuryFacts): string {
  const who = [f.name, [f.position, f.teamName ? `for the ${f.teamName}` : null].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const verb = f.injuryType === "other" ? "suffered a major injury" : `tore his ${injuryNoun(f.injuryType)}`;
  const parts: string[] = [`${who}, ${verb}`];
  const d = formatDate(f.injuryDate);
  if (d) parts.push(`on ${d}`);
  if (f.isGame) {
    if (f.week) parts.push(`in Week ${f.week}`);
    else if (f.phase === "preseason") parts.push("in a preseason game");
    else if (f.phase === "playoffs") parts.push("in a playoff game");
    if (f.opponent) parts.push(`${f.homeAway === "away" ? "at" : "vs"} the ${f.opponent}`);
    const surf = surfacePhrase(f.surface);
    if (surf) parts.push(`on ${surf}`);
    if (f.stadium) parts.push(`at ${f.stadium}`);
  } else if (f.phase === "preseason") {
    parts.push("during offseason/preseason practice");
  }
  let out = parts.join(" ") + ".";
  const st = stageLabel(f.stage);
  if (st) {
    const sd = formatDate(f.stageDate);
    out += ` Current stage: ${st}${sd ? ` (updated ${sd})` : ""}.`;
  }
  return out;
}

export function trackerRowFacts(r: TrackerRow): InjuryFacts {
  return {
    name: r.name,
    position: r.position,
    teamName: r.teamName,
    injuryType: r.injuryType,
    injuryDate: r.injuryDate,
    week: r.week,
    phase: r.phase,
    isGame: r.isGame,
    opponent: r.opponentName ?? r.opponent,
    homeAway: r.homeAway,
    surface: r.surface,
    stadium: r.stadium,
    stage: r.stage,
    stageDate: r.stageDate,
  };
}

/** Live FAQ (question + plain answer) computed from tracker rows. */
export function trackerFaq(rows: TrackerRow[], league: string, season: string) {
  const acl = rows.filter((r) => r.injuryType === "ACL");
  const ach = rows.filter((r) => r.injuryType === "Achilles");
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const faq: { q: string; a: string }[] = [];

  faq.push({
    q: `How many ACL tears have there been in the ${league} in ${season}?`,
    a: `Rupture Report has tracked ${plural(acl.length, "torn ACL")} in the ${season} ${league} season (offseason, preseason and regular season).`,
  });
  faq.push({
    q: `How many Achilles tears have there been in the ${league} in ${season}?`,
    a: `Rupture Report has tracked ${plural(ach.length, "torn Achilles tendon")} in the ${season} ${league} season.`,
  });

  const byTeam = new Map<string, number>();
  for (const r of rows) if (r.teamName) byTeam.set(r.teamName, (byTeam.get(r.teamName) ?? 0) + 1);
  const max = Math.max(0, ...byTeam.values());
  if (max > 0) {
    const top = [...byTeam].filter(([, n]) => n === max).map(([t]) => t).sort();
    faq.push({
      q: `Which ${league} team has the most ACL and Achilles injuries in ${season}?`,
      a:
        top.length === 1
          ? `The ${top[0]} have the most tracked ACL and Achilles tears in ${season}, with ${max}.`
          : `The ${top.join(", ")} are tied for the most tracked ACL and Achilles tears in ${season}, with ${max} each.`,
    });
  }

  const withSurface = rows.filter((r) => r.surface);
  if (withSurface.length) {
    const art = withSurface.filter((r) => r.surface === "artificial").length;
    const nat = withSurface.filter((r) => r.surface === "natural").length;
    const hyb = withSurface.filter((r) => r.surface === "hybrid").length;
    faq.push({
      q: `How many ${season} ${league} ACL and Achilles tears happened on artificial turf vs grass?`,
      a: `Of ${plural(withSurface.length, "tracked tear")} that happened in games with a known surface, ${art} occurred on artificial turf, ${nat} on natural grass and ${hyb} on hybrid grass. The other ${rows.length - withSurface.length} did not occur in a game with a recorded venue (e.g. practices and workouts).`,
    });
  }

  const known = rows.filter((r) => r.mechanism);
  if (known.length) {
    const nc = known.filter((r) => r.mechanism === "non_contact").length;
    faq.push({
      q: `How many ${season} ${league} ACL and Achilles tears were non-contact?`,
      a: `${nc} of the ${plural(known.length, "tear")} with a reported mechanism were non-contact injuries.`,
    });
  }

  const latest = rows[0];
  if (latest) {
    faq.push({
      q: `What is the most recent ${league} ACL or Achilles tear?`,
      a: injurySentence(trackerRowFacts(latest)),
    });
  }
  return faq;
}

/** Facts for one injury on a player detail page. */
export function playerInjuryFacts(
  player: { fullName: string; position: string | null; team: { name: string } | null },
  injury: {
    injuryType: string;
    injuryDate: string | null;
    week: number | null;
    phase: string | null;
    homeAway: string | null;
    stadium: { name: string; surfaceType: string | null } | null;
    opponent: { name: string } | null;
    updates: { stage: string; updateDate: string | null }[];
  },
): InjuryFacts {
  const latest = injury.updates.at(-1);
  return {
    name: player.fullName,
    position: player.position,
    teamName: player.team?.name ?? null,
    injuryType: injury.injuryType,
    injuryDate: injury.injuryDate,
    week: injury.week,
    phase: injury.phase,
    isGame: injury.stadium != null || injury.opponent != null,
    opponent: injury.opponent?.name ?? null,
    homeAway: injury.homeAway,
    surface: injury.stadium?.surfaceType ?? null,
    stadium: injury.stadium?.name ?? null,
    stage: latest?.stage ?? null,
    stageDate: latest?.updateDate ?? null,
  };
}

export function conditionName(type: string): string {
  if (type === "ACL") return "Torn anterior cruciate ligament (ACL)";
  if (type === "Achilles") return "Ruptured Achilles tendon";
  if (type === "MCL") return "Torn medial collateral ligament (MCL)";
  return "Major injury";
}

export function conditionAnatomy(type: string): string | null {
  if (type === "ACL") return "Anterior cruciate ligament";
  if (type === "Achilles") return "Achilles tendon";
  if (type === "MCL") return "Medial collateral ligament";
  return null;
}
