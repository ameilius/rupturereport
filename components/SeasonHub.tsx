import { Shim } from "@/components/Shim";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import InjuryTracker from "@/components/InjuryTracker";
import StatStrip, { type StatItem } from "@/components/StatStrip";
import SurfaceBreakdown from "@/components/SurfaceBreakdown";
import PositionBreakdown from "@/components/PositionBreakdown";
import SeasonSwitcher from "@/components/SeasonSwitcher";
import { datasetJsonLd, SITE_URL } from "@/lib/structured-data";
import { formatDate } from "@/lib/format";
import { trackerFaq } from "@/lib/summaries";
import { computeStats, getCarryover, getTrackerRows, weeklySeries, type TrackerRow } from "@/lib/tracker";
import { LEAGUE, type SeasonInfo } from "@/lib/seasons";
import { seasonCopy } from "@/lib/season-meta";
import { LEAGUE_CONFIG, homePath, playersPath, seasonLabel, type League } from "@/lib/leagues";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Rupture Report",
      url: SITE_URL,
      email: "contact@rupturereport.com",
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "contact@rupturereport.com", url: `${SITE_URL}/contact` },
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-square-1024.png`, width: 1024, height: 1024 },
    },
    {
      "@type": "WebSite",
      publisher: { "@id": `${SITE_URL}/#organization` },
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Rupture Report",
      description: `NFL and NBA ACL & Achilles tear tracker: recovery timelines, playing surface, venue and return-to-play data for every player, season by season.`,
      inLanguage: "en-US",
    },
  ],
};

const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

/** Full season hub: header, stat strip, surface card, table, carryover section, FAQ. */
export default async function SeasonHub({ season, info, league = "NFL" }: { season: number; info: SeasonInfo; league?: League }) {
  const isCurrent = season === info.current;
  const nba = league === "NBA";
  const label = seasonLabel(league, season);
  const { title: pageTitle, description, path } = seasonCopy(season, isCurrent, league);
  const pageUrl = `${SITE_URL}${path === "/" ? "" : path}`;
  let rows: TrackerRow[] = [];
  let carry: Awaited<ReturnType<typeof getCarryover>> | null = null;
  let failed = false;
  try {
    [rows, carry] = await Promise.all([getTrackerRows({ season, league }), getCarryover(season, league)]);
  } catch {
    failed = true;
  }

  const shareProps = { url: pageUrl || SITE_URL, title: `${pageTitle} | Rupture Report`, text: description };
  const grad = "bg-gradient-to-r from-teal to-rupture bg-clip-text text-transparent";
  const renderHeader = (extra?: { updated: string | null }) => (
    <header className="hero relative isolate pb-2">
      <div aria-hidden="true" className="hero-bg pointer-events-none absolute -inset-x-6 -top-10 -z-10 h-[150%]" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className={`live-dot ${isCurrent ? "" : "live-dot--off"}`} />
            <SeasonSwitcher season={season} current={info.current} seasons={info.listed} league={league} />
          </span>
          {extra?.updated && (
            <span className="rounded-full border border-border bg-surface/80 px-2.5 py-0.5 text-[11px] text-muted">
              Updated <time dateTime={extra.updated}>{formatDate(extra.updated)}</time>
            </span>
          )}
        </div>
        <ShareButton {...shareProps} compact />
      </div>
      <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
        {isCurrent ? <>{league} </> : <>{label} {league} </>}
        <span className={grad}>ACL</span> &amp; <span className={grad}>Achilles</span>{" "}
        {isCurrent ? "Tear Tracker" : "Tears"}
      </h1>
      <p className="mt-3 text-muted">
        Every torn ACL and Achilles of the {label} season, with {nba ? "" : "surface, "}game context and recovery status.{" "}
        <Link href={playersPath(league)} className="text-teal hover:underline">All players →</Link>
      </p>
      {!isCurrent && (
        <p className="mt-3 text-sm text-muted">
          Archive season.{" "}
          <Link href={homePath(league)} className="text-teal hover:underline">Go to the current {seasonLabel(league, info.current)} season →</Link>
        </p>
      )}
    </header>
  );

  if (failed || !carry) {
    return (
      <>
        {renderHeader()}
        <p className="mt-8 rounded-xl border border-border bg-surface p-6 text-muted">
          Tear data is temporarily unavailable. Please check back shortly.
        </p>
      </>
    );
  }

  const s = computeStats(rows);
  const lastModified = [...rows, ...carry.stillRecovering].reduce<string | null>(
    (m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m),
    null,
  );
  const dataset = datasetJsonLd({
    id: `${pageUrl || SITE_URL}/#dataset-${season}`,
    name: `${league} ACL & Achilles Tears, ${label} Season`,
    description: nba
      ? `Tracked torn ACL and Achilles tears in the ${label} NBA season (Summer League, offseason, preseason, regular season and playoffs), including tear date, team, position, game context, mechanism and recovery stage.`
      : `Tracked torn ACL and Achilles tears in the ${season} ${LEAGUE} season (offseason, preseason and regular season), including tear date, team, position, game context, playing surface, mechanism and recovery stage.`,
    url: pageUrl || SITE_URL,
    league,
    season: label,
    dateModified: lastModified ?? undefined,
    keywords: nba
      ? [`NBA ACL tears ${label}`, `NBA Achilles tears ${label}`, "torn ACL", "torn Achilles", "recovery"]
      : [`${LEAGUE} ACL tears ${season}`, `${LEAGUE} Achilles tears ${season}`, "torn ACL", "torn Achilles", "artificial turf", "natural grass", "recovery"],
    ...(nba ? { playingSurface: false, spatialCoverage: "United States and Canada" } : {}),
  });
  const faq = trackerFaq(rows, league, label);
  const teams = new Set(rows.map((r) => r.team).filter(Boolean)).size;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl || SITE_URL}/#faq`,
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  // Past seasons: sparklines stop at the season's last tear instead of running to today.
  const wk = weeklySeries(rows, isCurrent ? new Date() : new Date(0));
  const span = wk ? `per week since ${formatDate(wk.start)}` : "";
  const stats: StatItem[] = [
    { label: "Tracked tears", value: String(s.total), num: s.total, spark: wk ? { data: wk.total, color: "#E6EDF3", title: `All tears ${span}` } : undefined },
    { label: "ACL", value: String(s.acl), num: s.acl, tone: "text-teal", icon: "ACL", spark: wk ? { data: wk.acl, color: "#14B8A6", title: `ACL tears ${span}` } : undefined },
    { label: "Achilles", value: String(s.achilles), num: s.achilles, tone: "text-amber", icon: "Achilles", spark: wk ? { data: wk.achilles, color: "#F59E0B", title: `Achilles tears ${span}` } : undefined },
    nba
      ? {
          label: "In-game",
          value: s.inGamePct == null ? "—" : `${s.inGamePct}%`,
          num: s.inGamePct ?? undefined,
          suffix: "%",
          sub: s.total ? `${s.inGame} of ${s.total} tear${s.total === 1 ? "" : "s"} came in games · ${s.total - s.inGame} practice/offseason` : "no tears yet",
        }
      : {
          label: "Artificial turf",
          value: s.artificialPct == null ? "—" : `${s.artificialPct}%`,
          num: s.artificialPct ?? undefined,
          suffix: "%",
          sub: s.games ? `of ${s.games} game-day tear${s.games === 1 ? "" : "s"} · ${s.naturalPct}% grass/hybrid` : "no game-day tears yet",
        },
    {
      label: "Non-contact",
      value: s.nonContactPct == null ? "—" : `${s.nonContactPct}%`,
      num: s.nonContactPct ?? undefined,
      suffix: "%",
      sub: s.mechanismKnown ? `where known (n=${s.mechanismKnown})` : "mechanism unknown",
    },
  ];
  const showCarry = carry.stillRecovering.length > 0 || carry.prevPlayers > 0;

  return (
    <>
      {isCurrent && !nba && <script type="application/ld+json" dangerouslySetInnerHTML={ld(organizationJsonLd)} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={ld({ "@context": "https://schema.org", ...dataset })} />
      {faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqLd)} />}
      {renderHeader({
        updated: lastModified,
      })}
      <p className="sr-only" data-summary>
        Rupture Report tracks {s.total} torn ACL and Achilles tear{s.total === 1 ? "" : "s"} in the {label} {league} season:{" "}
        {s.acl} ACL and {s.achilles} Achilles across {teams} team{teams === 1 ? "" : "s"}.
        {carry.prevPlayers > 0 && (
          <> {carry.prevReturnedPlayers} of {carry.prevPlayers} players from the {seasonLabel(league, carry.prevSeason)} season are back on the {LEAGUE_CONFIG[league].returnPlace}.</>
        )}
        {lastModified && (
          <> Last updated <time dateTime={lastModified}>{formatDate(lastModified)}</time>.</>
        )}
      </p>
      <StatStrip stats={stats} />
      {nba ? <PositionBreakdown rows={rows} /> : <SurfaceBreakdown rows={rows} />}
      <InjuryTracker rows={rows} heading={`${label} season tears`} empty={`No tears tracked for the ${label} season yet.`} league={league} />
      {showCarry && (
        <section aria-labelledby="carryover-heading" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="carryover-heading" className="text-xl font-bold sm:text-2xl">Still recovering from previous seasons</h2>
              <p className="mt-1 text-sm text-muted">
                Tears from earlier seasons whose latest stage isn&apos;t &ldquo;Returned&rdquo;. Not counted in {label} totals.
              </p>
            </div>
            {carry.prevPlayers > 0 && (
              <p className="glass rounded-xl border px-4 py-2 text-sm" data-carryover-stat>
                <span className="text-xl font-bold tabular-nums text-teal">{carry.prevReturnedPlayers}</span>{" "}
                <span className="text-muted">of {carry.prevPlayers} {seasonLabel(league, carry.prevSeason)} players back on the {LEAGUE_CONFIG[league].returnPlace}</span>
              </p>
            )}
          </div>
          {carry.stillRecovering.length > 0 ? (
            <InjuryTracker
              rows={carry.stillRecovering}
              filters={false}
              idPrefix="carry"
              heading="Still recovering from previous seasons"
              showYear
              league={league}
            />
          ) : (
            <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-muted">
              Every tracked player from earlier seasons has returned.
            </p>
          )}
        </section>
      )}
      {faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="mt-14">
          <h2 id="faq-heading" className="text-xl font-bold sm:text-2xl">Frequently asked questions</h2>
          <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {faq.map((f) => (
              <div key={f.q} className="p-4 sm:p-5">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}

export function HubSkeleton() {
  // Mirrors the hub layout (eyebrow, title, 5 stat cards, breakdown card, filters, table/cards) so nothing jumps on load.
  return (
    <div aria-busy="true" aria-label="Loading tear data">
      <Shim className="h-3.5 w-44" />
      <Shim className="mt-3 h-9 w-4/5 sm:h-12 sm:w-2/3" />
      <Shim className="mt-3 h-4 w-full max-w-xl" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/60 p-4">
            <Shim className="h-2.5 w-20" />
            <Shim className="mt-3 h-7 w-14" />
            <Shim className="mt-3 h-5 w-full max-w-[120px]" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <Shim className="h-3 w-40" />
        {[82, 64, 30, 96].map((w, i) => (
          <div key={i} className="mt-4 flex items-center gap-3">
            <Shim className="h-3.5 w-24 shrink-0" />
            <Shim className="h-4" />
            <div className="h-4 rounded-md bg-border/40" style={{ width: `${w * 0.6}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {[180, 130, 110, 120].map((w, i) => (
          <div key={i} style={{ width: w }}><Shim className="h-9" /></div>
        ))}
      </div>
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-border md:block">
        <div className="h-10 bg-surface" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-border px-4 py-3">
            <Shim className="h-8 w-8 shrink-0 !rounded-full" />
            <Shim className="h-3.5 w-36" />
            <Shim className="ml-6 h-3.5 w-12" />
            <Shim className="h-5 w-14 !rounded-full" />
            <Shim className="h-3.5 w-16" />
            <Shim className="h-2 w-24" />
            <Shim className="h-3.5 w-20" />
          </div>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="px-3.5 py-3">
            <div className="flex items-center gap-3">
              <Shim className="h-9 w-9 shrink-0 !rounded-full" />
              <div className="flex-1"><Shim className="h-4 w-36" /><Shim className="mt-1.5 h-3 w-28" /></div>
              <Shim className="h-5 w-14 !rounded-full" />
            </div>
            <div className="mt-2 flex justify-between pl-12"><Shim className="h-3 w-28" /><Shim className="h-2 w-20" /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
