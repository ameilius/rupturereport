"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { leagueFromPathname, type League } from "@/lib/leagues";

/** NFL | NBA pill next to the logo. Neutral pages (contact, terms) highlight neither league. */
/** `league` overrides the URL (404s are rewritten, so the pathname alone can't tell). */
export default function LeagueSwitcher({ league: forced }: { league?: League } = {}) {
  const pathname = usePathname();
  const league = forced ?? leagueFromPathname(pathname);
  // Stats pages switch to the same page of the other league.
  const stats = /^(\/nba)?\/stats\/?$/.test(pathname ?? "");
  return (
    <nav aria-label="League" className="rr-sw" data-active={league ?? undefined}>
      <Link href={stats ? "/stats" : "/"} aria-current={league === "NFL" ? "page" : undefined}>NFL</Link>
      <Link href={stats ? "/nba/stats" : "/nba"} aria-current={league === "NBA" ? "page" : undefined}>NBA</Link>
    </nav>
  );
}

/** Tracker / Players links follow the league being viewed (NFL by default). */
export function MainNavLinks({ league: forced }: { league?: League } = {}) {
  const pathname = usePathname();
  const league = forced ?? leagueFromPathname(pathname);
  const base = league === "NBA" ? "/nba" : "";
  const onStats = pathname === `${base}/stats`;
  return (
    <>
      <Link href={base || "/"} className="text-muted hover:text-text">Tracker</Link>
      <Link href={`${base}/players`} className="text-muted hover:text-text">Players</Link>
      <Link
        href={`${base}/stats`}
        aria-current={onStats ? "page" : undefined}
        className={onStats ? "font-semibold text-teal" : "text-muted hover:text-text"}
      >
        Stats
      </Link>
    </>
  );
}
