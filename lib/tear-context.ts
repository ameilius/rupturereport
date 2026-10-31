import type { Injury } from "@/lib/players";
import type { League } from "@/lib/leagues";

/** Header context from confirmed data only: NFL "Week 7 · @BAL", NBA "Playoffs G4 · @DEN" / "Game · @DEN". Unknowns omitted. */
export function tearContext(i: Injury, league: League): string | null {
  const isGame = !!(i.stadium || i.opponent);
  if (!isGame) return null;
  const opp = i.opponent ? `${i.homeAway === "away" ? "@" : "vs "}${i.opponent.abbreviation}` : null;
  let when: string | null;
  if (league === "NBA") {
    const g = i.week ? ` G${i.week}` : "";
    when = i.phase === "summer_league" ? `Summer League${g}` : i.phase === "preseason" ? "Preseason" : i.phase === "playoffs" ? `Playoffs${g}` : "Game";
  } else {
    when = i.phase === "preseason" ? "Preseason" : i.phase === "playoffs" ? "Playoffs" : i.week ? `Week ${i.week}` : "Game";
  }
  return [when, opp].filter(Boolean).join(" · ");
}

/** "Right" / "Left" when confirmed. */
export function tearSide(i: Injury): string | null {
  return i.bodySide === "left" || i.bodySide === "right" ? i.bodySide[0].toUpperCase() + i.bodySide.slice(1) : null;
}
