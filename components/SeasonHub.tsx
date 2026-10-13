import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import InjuryTracker from "@/components/InjuryTracker";
import StatStrip, { type StatItem } from "@/components/StatStrip";
import SurfaceBreakdown from "@/components/SurfaceBreakdown";
import SeasonSwitcher from "@/components/SeasonSwitcher";
import { datasetJsonLd, SITE_URL } from "@/lib/structured-data";
import { formatDate } from "@/lib/format";
import { trackerFaq } from "@/lib/summaries";
import { computeStats, getCarryover, getTrackerRows, weeklySeries, type TrackerRow } from "@/lib/tracker";
import { LEAGUE, type SeasonInfo } from "@/lib/seasons";
import { seasonCopy } from "@/lib/season-meta";

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
      description: `${LEAGUE} ACL & Achilles tear tracker: recovery timelines, playing surface, stadium and return-to-play data for every player, season by season.`,
      inLanguage: "en-US",
    },
  ],
};

const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

/** Full season hub: header, stat strip, surface card, table, carryover section, FAQ. */
export default async function SeasonHub({ season, info }: { season: number; info: SeasonInfo }) {
  const isCurrent = season === info.current;
  const { title: pageTitle, description, path } = seasonCopy(season, isCurrent);
  const pageUrl = `${SITE_URL}${path === "/" ? "" : path}`;
  let rows: TrackerRow[] = [];
  let carry: Awaited<ReturnType<typeof getCarryover>> | null = null;
  let failed = false;
  try {
    [rows, carry] = await Promise.all([getTrackerRows({ season }), getCarryover(season)]);
  } catch {
    failed = true;
  }

  const header = (
    <header>
      <div className="flex items-center justify-between gap-3">
        <SeasonSwitcher season={season} current={info.current} seasons={info.listed} />
        <ShareButton url={pageUrl || SITE_URL} title={`${pageTitle} | Rupture Report`} text={description} />
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
        {isCurrent ? <>{LEAGUE} ACL &amp; Achilles Tear Tracker</> : <>{season} {LEAGUE} ACL &amp; Achilles Tears</>}
      </h1>
      <p className="mt-2 text-muted">
        Every torn ACL and Achilles of the {season} season, with surface, game context and recovery status.{" "}
        <Link href="/players" className="text-teal hover:underline">All players →</Link>
      </p>
      {!isCurrent && (
        <p className="mt-2 text-sm text-muted">
          Archive season.{" "}
          <Link href="/" className="text-teal hover:underline">Go to the current {info.current} season →</Link>
        </p>
      )}
    </header>
  );

  if (failed || !carry) {
    return (
      <>
        {header}
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
    name: `${LEAGUE} ACL & Achilles Tears, ${season} Season`,
    description: `Tracked torn ACL and Achilles tears in the ${season} ${LEAGUE} season (offseason, preseason and regular season), including tear date, team, position, game context, playing surface, mechanism and recovery stage.`,
    url: pageUrl || SITE_URL,
    league: LEAGUE,
    season: String(season),
    dateModified: lastModified ?? undefined,
    keywords: [`${LEAGUE} ACL tears ${season}`, `${LEAGUE} Achilles tears ${season}`, "torn ACL", "torn Achilles", "artificial turf", "natural grass", "recovery"],
  });
  const faq = trackerFaq(rows, LEAGUE, String(season));
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
    {
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
      {isCurrent && <script type="application/ld+json" dangerouslySetInnerHTML={ld(organizationJsonLd)} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={ld({ "@context": "https://schema.org", ...dataset })} />
      {faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqLd)} />}
      {header}
      <p className="mt-4 max-w-3xl text-sm text-muted" data-summary>
        Rupture Report tracks {s.total} torn ACL and Achilles tear{s.total === 1 ? "" : "s"} in the {season} {LEAGUE} season:{" "}
        {s.acl} ACL and {s.achilles} Achilles across {teams} team{teams === 1 ? "" : "s"}.
        {carry.prevPlayers > 0 && (
          <> {carry.prevReturnedPlayers} of {carry.prevPlayers} players from the {carry.prevSeason} season are back on the field.</>
        )}
        {lastModified && (
          <> Last updated <time dateTime={lastModified}>{formatDate(lastModified)}</time>.</>
        )}
      </p>
      <StatStrip stats={stats} />
      <SurfaceBreakdown rows={rows} />
      <InjuryTracker rows={rows} heading={`${season} season tears`} empty={`No tears tracked for the ${season} season yet.`} />
      {showCarry && (
        <section aria-labelledby="carryover-heading" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="carryover-heading" className="text-xl font-bold sm:text-2xl">Still recovering from previous seasons</h2>
              <p className="mt-1 text-sm text-muted">
                Tears from earlier seasons whose latest stage isn&apos;t &ldquo;Returned&rdquo;. Not counted in {season} totals.
              </p>
            </div>
            {carry.prevPlayers > 0 && (
              <p className="glass rounded-xl border px-4 py-2 text-sm" data-carryover-stat>
                <span className="text-xl font-bold tabular-nums text-teal">{carry.prevReturnedPlayers}</span>{" "}
                <span className="text-muted">of {carry.prevPlayers} {carry.prevSeason} players back on the field</span>
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
  return (
    <div aria-busy="true" aria-label="Loading tear data" className="animate-pulse">
      <div className="h-4 w-40 rounded bg-surface" />
      <div className="mt-3 h-10 w-2/3 rounded bg-surface" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="mt-8 h-10 rounded-lg bg-surface" />
      <div className="mt-4 h-96 rounded-xl bg-surface" />
    </div>
  );
}
