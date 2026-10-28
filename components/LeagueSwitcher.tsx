"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { leagueFromPathname } from "@/lib/leagues";

/** NFL | NBA pill next to the logo. Neutral pages (contact, terms) highlight neither league. */
export default function LeagueSwitcher() {
  const league = leagueFromPathname(usePathname());
  return (
    <nav aria-label="League" className="rr-sw">
      <Link href="/" aria-current={league === "NFL" ? "page" : undefined}>NFL</Link>
      <Link href="/nba" aria-current={league === "NBA" ? "page" : undefined}>NBA</Link>
    </nav>
  );
}

/** Tracker / Players links follow the league being viewed (NFL by default). */
export function MainNavLinks() {
  const league = leagueFromPathname(usePathname());
  const base = league === "NBA" ? "/nba" : "";
  return (
    <>
      <Link href={base || "/"} className="text-muted hover:text-text">Tracker</Link>
      <Link href={`${base}/players`} className="text-muted hover:text-text">Players</Link>
    </>
  );
}
