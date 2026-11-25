/**
 * Player page SEO copy built only from DB fields (title, meta description, FAQ).
 * Unknown parts are omitted, never guessed. League-agnostic; wording comes from the league config.
 */
import { formatDate } from "@/lib/format";
import { STAGE_LABELS, formatInjuryType, type Injury, type PlayerDetail, type ProgressUpdate } from "@/lib/players";
import { cfg, seasonLabel, type League } from "@/lib/leagues";
import { injurySentence, playerInjuryFacts } from "@/lib/summaries";

const BRAND = " | Rupture Report";
/** Titles longer than this drop the brand suffix (Google truncates around 60). */
const TITLE_MAX = 60;
const DESC_MAX = 160;

/** Appends the brand only when the whole title still fits. */
export function brandedTitle(title: string): string {
  return title.length + BRAND.length <= TITLE_MAX ? `${title}${BRAND}` : title;
}

function sentence(s: string): string {
  const t = s.trim().replace(/[.;:,\s]+$/, "");
  return t ? `${t}.` : "";
}

function tearVerb(i: Injury): string {
  return i.injuryType === "other" ? "suffered a major injury" : `tore his ${formatInjuryType(i.injuryType)}`;
}

/** Updates for the current injury after its latest re-injury (if any). */
function currentUpdates(i: Injury): ProgressUpdate[] {
  const lastRe = i.updates.map((u) => u.stage).lastIndexOf("reinjured");
  return lastRe >= 0 ? i.updates.slice(lastRe) : i.updates;
}

function surgeries(i: Injury): ProgressUpdate[] {
  return currentUpdates(i).filter((u) => u.stage === "surgery" && u.updateDate);
}

/** Status label without a redundant leading "Surgery:" (the stage already says it). */
function cleanLabel(label: string | null, stage: string): string | null {
  if (!label) return null;
  const t = stage === "surgery" ? label.replace(/^surgery\s*[:\-–—]\s*/i, "") : label;
  return t.trim() || null;
}

/** "{Name} Return Date & ACL Recovery Timeline" (+ brand when it fits). */
export function playerSeoTitle(d: PlayerDetail): { title: string; documentTitle: string } {
  const i = d.injuries[0];
  const type = i ? (i.injuryType === "other" ? "Injury" : formatInjuryType(i.injuryType)) : "Injury";
  const title = `${d.player.fullName} Return Date & ${type} Recovery Timeline`;
  return { title, documentTitle: brandedTitle(title) };
}

/** ~150-160 char description: tear + date, surgery date, latest stage (or return), status label. */
export function playerSeoDescription(d: PlayerDetail, league: League): string {
  const { player } = d;
  const i = d.injuries[0];
  if (!i) return `${player.fullName}: ${league} ACL and Achilles recovery tracker on Rupture Report.`;
  const abbr = player.team?.abbreviation ? ` (${player.team.abbreviation})` : "";
  const injDate = formatDate(i.injuryDate);
  const base = sentence(`${player.fullName}${abbr} ${tearVerb(i)}${injDate ? ` on ${injDate}` : ""}`);

  const ups = currentUpdates(i);
  const latest = ups.at(-1) ?? null;
  const latestDate = latest ? formatDate(latest.updateDate) : null;
  const firstSurgery = surgeries(i)[0] ?? null;
  const surgery =
    firstSurgery && firstSurgery !== latest ? sentence(`Surgery: ${formatDate(firstSurgery.updateDate)}`) : "";

  let status = "";
  let label = "";
  if (latest) {
    if (latest.stage === "returned") {
      status = sentence(`Returned to the ${cfg(league).returnPlace}${latestDate ? ` on ${latestDate}` : ""}`);
    } else {
      const l = cleanLabel(latest.statusLabel, latest.stage);
      status = `Latest: ${STAGE_LABELS[latest.stage]}${latestDate ? ` (${latestDate})` : ""}`;
      label = l ? `: ${sentence(l)}` : "";
      if (!label) status = sentence(status);
    }
  }
  const tail = "Full recovery timeline, updates and sources.";
  const join = (parts: string[]) => parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const withStatus = (lbl: boolean) => (status && !lbl && label ? sentence(status) : status + (lbl ? label : ""));
  const options = [
    join([base, surgery, withStatus(true), tail]),
    join([base, surgery, withStatus(true)]),
    join([base, surgery, withStatus(false), tail]),
    join([base, surgery, withStatus(false)]),
    join([base, withStatus(false), tail]),
    join([base, withStatus(false)]),
  ];
  return options.find((o) => o.length <= DESC_MAX) ?? options[options.length - 1];
}

export interface Faq {
  q: string;
  a: string;
}

/** Player FAQ: a question appears only when its answer comes from recorded data. */
export function playerFaq(d: PlayerDetail, league: League): Faq[] {
  const { player, injuries } = d;
  const i = injuries[0];
  if (!i) return [];
  const name = player.fullName;
  const faq: Faq[] = [];
  const ups = currentUpdates(i);
  const latest = ups.at(-1) ?? null;

  if (latest) {
    const date = formatDate(latest.updateDate);
    const label = cleanLabel(latest.statusLabel, latest.stage);
    if (latest.stage === "returned") {
      faq.push({
        q: `When did ${name} return from his ${i.injuryType === "other" ? "injury" : `${formatInjuryType(i.injuryType)} tear`}?`,
        a: [sentence(`${name} returned to the ${cfg(league).returnPlace}${date ? ` on ${date}` : ""}`), label ? sentence(label) : ""].filter(Boolean).join(" "),
      });
    } else {
      faq.push({
        q: `When will ${name} return?`,
        a: [
          sentence(`As of the latest update${date ? ` (${date})` : ""}, ${latest.stage === "reinjured" ? `${name} is listed as re-injured` : `${name} is at the ${STAGE_LABELS[latest.stage]} stage of recovery`}`),
          label ? sentence(label) : "",
          `Rupture Report has not recorded his return to game action yet.`,
        ]
          .filter(Boolean)
          .join(" "),
      });
    }
  }

  const facts = { ...playerInjuryFacts(player, i), league, stage: null, stageDate: null };
  const earlier = injuries.slice(1).map((e) => {
    const ed = formatDate(e.injuryDate);
    return `${formatInjuryType(e.injuryType)} tear in the ${seasonLabel(league, e.season ?? 0)} season${ed ? ` (${ed})` : ""}`;
  });
  faq.push({
    q: `What injury did ${name} suffer?`,
    a: [injurySentence(facts), earlier.length ? sentence(`Earlier: ${earlier.join("; ")}`) : ""].filter(Boolean).join(" "),
  });

  const ops = surgeries(i);
  if (ops.length) {
    const lbl = (u: ProgressUpdate) => {
      const l = cleanLabel(u.statusLabel, "surgery");
      return l ? ` (${l.replace(/[.\s]+$/, "")})` : "";
    };
    const later = ops.slice(1).map((u) => `${formatDate(u.updateDate)}${lbl(u)}`);
    faq.push({
      q: `When did ${name} have surgery?`,
      a: [
        sentence(`${name} had surgery on ${formatDate(ops[0].updateDate)}${lbl(ops[0])}`),
        later.length ? sentence(`Later updates at the surgery stage: ${later.join("; ")}`) : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }
  return faq;
}
