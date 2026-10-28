import Link from "next/link";
import { seasonPath } from "@/lib/seasons";
import { seasonLabel, type League } from "@/lib/leagues";

/** Season label with a no-JS dropdown of seasons that have data (plus the current one). */
export default function SeasonSwitcher({ season, current, seasons, league = "NFL" }: { season: number; current: number; seasons: number[]; league?: League }) {
  const label = `${seasonLabel(league, season)} ${league} season`;
  if (seasons.length <= 1) {
    return <p className="text-xs font-semibold uppercase tracking-widest text-teal">{label}</p>;
  }
  return (
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-teal hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal [&::-webkit-details-marker]:hidden">
        {label}
        <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 transition-transform group-open:rotate-180"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="sr-only">: choose a season</span>
      </summary>
      <ul className="absolute left-0 z-30 mt-2 min-w-44 rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/40">
        {seasons.map((s) => (
          <li key={s}>
            <Link
              href={seasonPath(s, current, league)}
              aria-current={s === season ? "page" : undefined}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-border/50 ${s === season ? "text-teal" : "text-text"}`}
            >
              {seasonLabel(league, s)} season
              {s === current && <span className="text-[10px] uppercase tracking-wider text-muted">Current</span>}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
