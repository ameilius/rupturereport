"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { TrackerRow } from "@/lib/tracker";
import { PlayerAvatar, TeamLogo } from "@/components/TeamImages";
import { MiniStageBar } from "@/components/RecoveryProgress";
import InjuryBodyIcon from "@/components/InjuryBodyIcon";
import { POSITION_BUCKETS, playerPath, positionBucket, type League } from "@/lib/leagues";

const STAGE: Record<string, string> = {
  diagnosis: "Diagnosis", surgery: "Surgery", immobilization: "Immobilization",
  non_weight_bearing: "Non-weight-bearing", weight_bearing: "Weight-bearing",
  jogging: "Jogging", cutting: "Cutting", practice_limited: "Limited practice",
  practice_full: "Full practice", game_ready: "Game ready", returned: "Returned",
  reinjured: "Re-injured",
};

const sel =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal";

function fmt(d: string | null, year = false) {
  if (!d) return "—";
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}), timeZone: "UTC",
  });
}

function Badge({ type, side }: { type: string; side?: string | null }) {
  const cls =
    type === "Achilles" ? "bg-amber/15 text-amber" : "bg-teal/15 text-teal";
  return (
    <span className="inline-flex items-center gap-1.5">
      <InjuryBodyIcon type={type} side={side} size={22} decorative />
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
        {type === "other" ? "Other" : type}
      </span>
    </span>
  );
}

function context(r: TrackerRow, league: League = "NFL") {
  if (!r.isGame) return "Practice";
  if (league === "NBA") {
    const pre = r.phase === "summer_league" ? "Summer" : r.phase === "preseason" ? "Pre" : r.phase === "playoffs" ? "Playoffs" : "";
    const g = r.week ? `G${r.week}` : "";
    const opp = r.opponent ? `${r.homeAway === "away" ? "@" : "vs"} ${r.opponent}` : "";
    return [pre, g, opp].filter(Boolean).join(" ") || "Game";
  }
  const pre = r.phase === "preseason" ? "Pre" : r.phase === "playoffs" ? "Playoffs" : r.week ? `Wk ${r.week}` : "Game";
  const opp = r.opponent ? `${r.homeAway === "away" ? "@" : "vs"} ${r.opponent}` : "";
  return `${pre} ${opp}`.trim();
}

function surfaceLabel(r: TrackerRow) {
  if (!r.surface && r.practiceSurface) return `${r.practiceSurface.charAt(0).toUpperCase() + r.practiceSurface.slice(1)} (practice)`;
  if (!r.surface) return "—";
  return r.surface.charAt(0).toUpperCase() + r.surface.slice(1);
}

export default function InjuryTracker({
  rows,
  filters = true,
  heading = "Tear tracker",
  showHeading = false,
  idPrefix = "t",
  showYear = false,
  empty = "No tears tracked yet.",
  league = "NFL",
}: {
  rows: TrackerRow[];
  filters?: boolean;
  heading?: string;
  showHeading?: boolean;
  idPrefix?: string;
  showYear?: boolean;
  empty?: string;
  league?: League;
}) {
  const nba = league === "NBA";
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [team, setTeam] = useState("");
  const [surface, setSurface] = useState("");
  const [phase, setPhase] = useState("");
  const [pos, setPos] = useState("");
  const dq = useDeferredValue(q);

  const teams = useMemo(
    () => [...new Set(rows.map((r) => r.team).filter(Boolean) as string[])].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    return rows.filter((r) => {
      if (type && r.injuryType !== type) return false;
      if (team && r.team !== team) return false;
      if (phase && r.phase !== phase) return false;
      if (pos && positionBucket(r.position) !== pos) return false;
      if (surface === "practice" ? r.isGame : surface && r.surface !== surface) return false;
      if (needle && !`${r.name} ${r.teamName ?? ""} ${r.team ?? ""} ${r.position ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, dq, type, team, surface, phase, pos]);

  const active = q || type || team || surface || phase || pos;

  return (
    <section aria-labelledby={`${idPrefix}-heading`} className="mt-8">
      <h2 id={`${idPrefix}-heading`} className={showHeading ? "text-xl font-bold sm:text-2xl" : "sr-only"}>{heading}</h2>
      {filters && (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="sr-only" htmlFor={`${idPrefix}-tq`}>Search players or teams</label>
        <input
          id={`${idPrefix}-tq`}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search player or team…"
          className={`${sel} w-full sm:w-64`}
        />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <label className="sr-only" htmlFor={`${idPrefix}-ft`}>Tear type</label>
          <select id={`${idPrefix}-ft`} className={sel} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">ACL & Achilles</option>
            <option value="ACL">ACL</option>
            <option value="Achilles">Achilles</option>
          </select>
          <label className="sr-only" htmlFor={`${idPrefix}-fteam`}>Team</label>
          <select id={`${idPrefix}-fteam`} className={sel} value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">All teams</option>
            {teams.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {nba ? (
            <>
              <label className="sr-only" htmlFor={`${idPrefix}-fpos`}>Position</label>
              <select id={`${idPrefix}-fpos`} className={sel} value={pos} onChange={(e) => setPos(e.target.value)}>
                <option value="">All positions</option>
                {POSITION_BUCKETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          ) : (
            <>
              <label className="sr-only" htmlFor={`${idPrefix}-fs`}>Surface</label>
              <select id={`${idPrefix}-fs`} className={sel} value={surface} onChange={(e) => setSurface(e.target.value)}>
                <option value="">All surfaces</option>
                <option value="artificial">Artificial</option>
                <option value="natural">Natural</option>
                <option value="hybrid">Hybrid</option>
                <option value="practice">Practice (no game)</option>
              </select>
              <label className="sr-only" htmlFor={`${idPrefix}-fp`}>Phase</label>
              <select id={`${idPrefix}-fp`} className={sel} value={phase} onChange={(e) => setPhase(e.target.value)}>
                <option value="">All phases</option>
                <option value="preseason">Offseason / preseason</option>
                <option value="regular">Regular season</option>
                <option value="playoffs">Playoffs</option>
              </select>
            </>
          )}
        </div>
        <p className="text-sm text-muted sm:ml-auto" aria-live="polite">
          {filtered.length} of {rows.length}
          {active && (
            <button
              type="button"
              className="ml-3 text-teal hover:underline"
              onClick={() => { setQ(""); setType(""); setTeam(""); setSurface(""); setPhase(""); setPos(""); }}
            >
              Clear
            </button>
          )}
        </p>
      </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-surface p-6 text-muted">
          {rows.length === 0 ? empty : "No tears match these filters."}
        </p>
      ) : (
        <>
          <div className="glass mt-4 hidden overflow-x-auto rounded-xl border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Player</th>
                  <th scope="col" className="px-4 py-3">Team</th>
                  <th scope="col" className="px-4 py-3">Pos</th>
                  <th scope="col" className="px-4 py-3">Tear</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Stage</th>
                  <th scope="col" className="px-4 py-3">Game</th>
                  {!nba && <th scope="col" className="px-4 py-3">Surface</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="row-accent">
                    <td className="px-4 py-2.5 font-medium">
                      <Link href={playerPath(league, r.slug)} className="row-name flex items-center gap-3 hover:text-teal">
                        <PlayerAvatar name={r.name} team={r.team} headshotPath={r.headshot} size={32} league={league} />
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted" title={r.teamName ?? undefined}>
                      <span className="flex items-center gap-2">
                        <TeamLogo abbr={r.team} name={r.teamName} logoPath={r.teamLogo} size={22} league={league} />
                        {r.team ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{r.position ?? "—"}</td>
                    <td className="px-4 py-3"><Badge type={r.injuryType} side={r.bodySide} /></td>
                    <td className="px-4 py-3 whitespace-nowrap"><time dateTime={r.injuryDate ?? undefined}>{fmt(r.injuryDate, showYear)}</time></td>
                    <td className="px-4 py-3 whitespace-nowrap"><MiniStageBar stage={r.stage} label={r.stage ? STAGE[r.stage] ?? r.stage : "No update"} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted" title={nba ? r.stadium ?? undefined : undefined}>{context(r, league)}</td>
                    {!nba && (
                      <td className="px-4 py-3" title={r.stadium ? `${r.stadium}${r.surfaceBrand ? ` · ${r.surfaceBrand}` : ""}` : r.practiceVenue ?? undefined}>
                        {surfaceLabel(r)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="glass mt-4 divide-y divide-border overflow-hidden rounded-xl border md:hidden">
            {filtered.map((r) => {
              const surf = nba ? null : surfaceLabel(r);
              return (
                <li key={r.id}>
                  <Link href={playerPath(league, r.slug)} className="block px-3.5 py-3 active:bg-border/40">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={r.name} team={r.team} headshotPath={r.headshot} size={36} league={league} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold leading-tight">{r.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                          <TeamLogo abbr={r.team} name={r.teamName} logoPath={r.teamLogo} size={16} league={league} />
                          {[r.team, r.position].filter(Boolean).join(" · ")}
                          <span aria-hidden="true">·</span>
                          <time dateTime={r.injuryDate ?? undefined}>{fmt(r.injuryDate, showYear)}</time>
                        </p>
                      </div>
                      <Badge type={r.injuryType} side={r.bodySide} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 pl-12 text-[13px] text-muted">
                      <span className="min-w-0 truncate">
                        {context(r, league)}
                        {surf && surf !== "—" ? <> · <span className="text-text/80">{surf}</span></> : null}
                      </span>
                      <span className="shrink-0"><MiniStageBar stage={r.stage} label={r.stage ? STAGE[r.stage] ?? r.stage : "No update"} /></span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
