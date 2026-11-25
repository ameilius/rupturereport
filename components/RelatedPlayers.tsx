import Link from "next/link";
import { STAGE_LABELS, formatInjuryType, type PlayerListItem } from "@/lib/players";
import { contrast, teamColors } from "@/lib/images";
import { playerPath, playersPath, seasonHubPath, seasonLabel, statsPath, type League } from "@/lib/leagues";

const CAP = 6;

/** Same-league related players (same team, then same season), linked with name + injury anchors. Never mixes leagues. */
export default function RelatedPlayers({
  league,
  slug,
  teamAbbr,
  teamName,
  injuryType,
  season,
  currentSeason,
  players,
}: {
  league: League;
  slug: string;
  teamAbbr: string | null;
  teamName: string | null;
  injuryType: string | null;
  season: number | null;
  currentSeason: number | null;
  players: PlayerListItem[];
}) {
  const others = players.filter((p) => p.slug !== slug);
  const sameTeam = teamAbbr ? others.filter((p) => p.teamAbbreviation === teamAbbr).slice(0, CAP) : [];
  const shown = new Set(sameTeam.map((p) => p.slug));
  const sameSeason =
    season != null
      ? others
          .filter((p) => p.season === season && !shown.has(p.slug))
          .sort((a, b) => Number(b.injuryType === injuryType) - Number(a.injuryType === injuryType))
          .slice(0, CAP)
      : [];
  const label = season != null ? seasonLabel(league, season) : null;
  const types = [...new Set(sameSeason.map((p) => formatInjuryType(p.injuryType)))];
  const typeWord = types.length === 1 ? `${types[0]} tears` : "ACL & Achilles tears";

  if (!sameTeam.length && !sameSeason.length) return null;

  return (
    <section aria-labelledby="related-players" className="mt-14">
      <h2 id="related-players" className="border-l-4 pl-3 text-lg font-semibold" style={{ borderLeftColor: "var(--accent)" }}>
        Related {league} tears
      </h2>
      {sameTeam.length > 0 && (
        <Group title={`More ${teamName ?? teamAbbr} players tracked`} items={sameTeam} league={league} />
      )}
      {sameSeason.length > 0 && label && (
        <Group title={`More ${label} ${league} ${typeWord}`} items={sameSeason} league={league} />
      )}
      <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {season != null && currentSeason != null && (
          <Link href={seasonHubPath(league, season, currentSeason)} className="text-teal underline underline-offset-2 hover:no-underline">
            {label} {league} ACL &amp; Achilles tracker
          </Link>
        )}
        <Link href={playersPath(league)} className="text-teal underline underline-offset-2 hover:no-underline">
          All tracked {league} players
        </Link>
        <Link href={statsPath(league)} className="text-teal underline underline-offset-2 hover:no-underline">
          {league} tear stats
        </Link>
      </p>
    </section>
  );
}

function Group({ title, items, league }: { title: string; items: PlayerListItem[]; league: League }) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((p) => {
          const [primary, secondary] = teamColors(p.teamAbbreviation, league);
          const accent = contrast(primary, "#121821") >= contrast(secondary, "#121821") ? primary : secondary;
          const type = formatInjuryType(p.injuryType);
          const isAch = p.injuryType === "Achilles";
          return (
            <li key={p.slug} className="min-w-0">
              <Link
                href={playerPath(league, p.slug)}
                style={{ borderLeftColor: accent }}
                className="group flex min-w-0 flex-col rounded-xl border border-l-4 border-border bg-surface/90 px-4 py-3 transition hover:border-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <span className="truncate font-semibold group-hover:text-teal">
                  {p.fullName} <span className={isAch ? "text-amber" : "text-teal"}>{type} tear</span>
                </span>
                <span className="truncate text-sm text-muted">
                  {[p.position, p.teamName, p.latestStage ? STAGE_LABELS[p.latestStage] : null].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
