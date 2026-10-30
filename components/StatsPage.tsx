import Link from "next/link";
import { connection } from "next/server";
import { getLeagueStats, type LeagueStats, type SeriesBucket, type Split } from "@/lib/stats";
import { cfg, homePath, playerPath, statsPath, type League } from "@/lib/leagues";
import { breadcrumbJsonLd, datasetJsonLd, SITE_URL } from "@/lib/structured-data";
import { formatDate } from "@/lib/format";

const TEAL = "#14B8A6";
const AMB = "#F59E0B";
const MUT = "#8B98A5";

const ld = (o: unknown) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
const short = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const mon = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function statsCopy(league: League, label: string) {
  const c = cfg(league);
  const title = `${league} ACL & Achilles Tear Stats: ${label} Season`;
  const description = c.hasSurface
    ? `Charts and breakdowns of every torn ACL and Achilles in the ${label} ${league} season: tears per week, games vs practice, turf vs grass, contact vs non-contact, positions, teams, recovery stage and days to surgery.`
    : `Charts and breakdowns of every torn ACL and Achilles in the ${label} ${league} season: tears per month, games vs practice, contact vs non-contact, positions, teams, recovery stage and days to surgery.`;
  return { title, description, path: statsPath(league) };
}

function Bars({ rows, max }: { rows: Split[]; max?: number }) {
  const m = max || Math.max(1, ...rows.map((r) => r.total));
  return (
    <div className="mt-3">
      {rows.map((r) => (
        <div key={r.label} className="st-row" aria-label={`${r.label}: ${r.total} (${r.acl} ACL, ${r.achilles} Achilles)`}>
          <span>{r.label}</span>
          <div className="st-bar" style={{ width: r.total ? `${Math.max((r.total / m) * 100, 4).toFixed(1)}%` : "0%" }}>
            <i style={{ width: `${r.total ? (r.acl / r.total) * 100 : 0}%`, background: TEAL }} />
            <i style={{ width: `${r.total ? (r.achilles / r.total) * 100 : 0}%`, background: AMB }} />
          </div>
          <span className="st-num">
            <b>{r.total}</b> <span className="st-sub">{r.acl}·{r.achilles}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Legend({ cumulative }: { cumulative?: boolean }) {
  return (
    <div className="st-leg">
      <span><b style={{ background: TEAL }} />ACL</span>
      <span><b style={{ background: AMB }} />Achilles</span>
      {cumulative && <span><b style={{ background: "#E6EDF3", height: 2, verticalAlign: 3 }} />Cumulative</span>}
    </div>
  );
}

function SeriesChart({ series, gran }: { series: SeriesBucket[]; gran: "week" | "month" }) {
  const W = 760, H = 240, pl = 30, pb = 26, pt = 28;
  const n = Math.max(series.length, 1);
  const bw = (W - pl - 10) / n;
  const tot = series.map((b) => b.acl + b.achilles);
  const mx = Math.max(1, ...tot);
  const cmx = Math.max(1, ...series.map((b) => b.cumulative));
  const step = Math.max(1, Math.floor(mx / 4));
  const ticks: number[] = [];
  for (let k = 0; k <= mx; k += step) ticks.push(k);
  const ch = H - pb - pt;
  const pts = series.map((b, i) => [pl + i * bw + bw / 2, H - pb - (b.cumulative / cmx) * ch] as const);
  const last = pts[pts.length - 1];
  const every = gran === "week" ? Math.max(1, Math.ceil(n / 8)) : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Tears per ${gran} with cumulative total: ${series.at(-1)?.cumulative ?? 0} total`}>
      {ticks.map((k) => {
        const y = H - pb - (k / mx) * ch;
        return (
          <g key={k}>
            <line x1={pl} x2={W - 10} y1={y} y2={y} stroke="#1F2933" />
            <text x={pl - 6} y={y + 4} fill={MUT} fontSize="10" textAnchor="end">{k}</text>
          </g>
        );
      })}
      {series.map((b, i) => {
        const x = pl + i * bw + bw * 0.18, w = bw * 0.64;
        const ya = (b.acl / mx) * ch, yc = (b.achilles / mx) * ch;
        return (
          <g key={b.start}>
            {b.acl > 0 && <rect x={x} y={H - pb - ya} width={w} height={ya} fill={TEAL} rx="2"><title>{`${short(b.start)}: ${b.acl} ACL`}</title></rect>}
            {b.achilles > 0 && <rect x={x} y={H - pb - ya - yc} width={w} height={yc} fill={AMB} rx="2"><title>{`${short(b.start)}: ${b.achilles} Achilles`}</title></rect>}
            {i % every === 0 && (
              <text x={x + w / 2} y={H - 8} fill={MUT} fontSize="10" textAnchor="middle">{gran === "week" ? short(b.start) : mon(b.start)}</text>
            )}
          </g>
        );
      })}
      {pts.length > 0 && (
        <>
          <polyline points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} fill="none" stroke="#E6EDF3" strokeWidth="2" />
          <circle cx={last[0]} cy={last[1]} r="4" fill="#E6EDF3" />
          <text x={last[0] - 8} y={last[1] - 8} fill="#E6EDF3" fontSize="11" textAnchor="end" fontWeight="700">
            {series.at(-1)!.cumulative} total (line: own scale)
          </text>
        </>
      )}
    </svg>
  );
}

function P({ league, slug, name, team }: { league: League; slug: string; name: string; team: string | null }) {
  return (
    <>
      <Link className="st-pl font-semibold" href={playerPath(league, slug)}>{name}</Link>
      {team && <span className="st-sub"> ({team})</span>}
    </>
  );
}

export default async function StatsPage({ league }: { league: League }) {
  await connection();
  let s: LeagueStats;
  try {
    s = await getLeagueStats(league);
  } catch {
    return (
      <p className="text-muted" role="alert">Stats are temporarily unavailable. Please check back shortly.</p>
    );
  }
  const c = cfg(league);
  const nba = league === "NBA";
  const { title, description, path } = statsCopy(league, s.label);
  const url = `${SITE_URL}${path}`;
  const n = s.total;
  const firstDate = s.series[0]?.start;

  const dataset = datasetJsonLd({
    id: `${url}#dataset-stats-${s.season}`,
    name: `${league} ACL & Achilles Tear Statistics, ${s.label} Season`,
    description,
    url,
    league,
    season: s.label,
    dateModified: s.updated ?? undefined,
    keywords: [`${league} ACL tear stats ${s.label}`, `${league} Achilles tear stats ${s.label}`, "torn ACL", "torn Achilles", ...(c.hasSurface ? ["turf vs grass"] : [])],
    ...(c.hasSurface ? {} : { playingSurface: false, spatialCoverage: "United States and Canada" }),
  });
  const crumbs = breadcrumbJsonLd([
    [`${league} tracker`, homePath(league)],
    ["Stats", path],
  ]);

  const top = s.teams.slice(0, 8);
  const diag = s.stages.find((x) => x.stage === "diagnosis")?.count ?? 0;
  const longest = s.surgery.length > 1 ? s.surgery[s.surgery.length - 1] : null;
  const sm = s.medianDaysToSurgery;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld({ "@context": "https://schema.org", ...dataset })} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(crumbs)} />
      <header className="hero relative isolate pb-2">
        <div aria-hidden="true" className="hero-bg pointer-events-none absolute -inset-x-6 -top-10 -z-10 h-[150%]" />
        <p className="text-xs font-semibold uppercase tracking-wider text-teal">{s.label} {league} season · Stats</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{league} tear stats</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Charts and breakdowns for every tracked ACL and Achilles tear of the {s.label} {league} season. Computed live from the same data as
          the <Link className="text-teal" href={homePath(league)}>tracker</Link>; {league} only.
        </p>
        <div className="st-tabs" aria-label="Season">
          <span className="on" aria-current="page">{s.label} (current)</span>
          <span aria-disabled="true">All seasons — soon</span>
        </div>
      </header>
      <h2 className="sr-only">{title}</h2>

      <dl className="st-kpis">
        <div className="st-kpi"><dt>Tracked tears</dt><dd>{n}</dd></div>
        <div className="st-kpi"><dt>ACL</dt><dd style={{ color: TEAL }}>{s.acl}</dd></div>
        <div className="st-kpi"><dt>Achilles</dt><dd style={{ color: AMB }}>{s.achilles}</dd></div>
        <div className="st-kpi">
          <dt>In games</dt>
          <dd>{n ? `${pct(s.inGame, n)}%` : "—"}</dd>
          <div className="st-x">{s.inGame} of {n} · {s.nonGame} practice/offseason</div>
        </div>
        <div className="st-kpi">
          <dt>Median tear → surgery</dt>
          <dd>{sm !== null ? fmtNum(sm) : "—"}<span className="st-x"> days</span></dd>
          <div className="st-x">{s.surgery.length ? `n=${s.surgery.length} with a reported surgery date` : "Not reported yet"}</div>
        </div>
      </dl>

      <div className="st-grid mt-4">
        <section className="st-card st-c12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="st-h2">Tears per {s.granularity} · cumulative</h2>
            <Legend cumulative />
          </div>
          <div className="mt-2.5">
            {s.series.length ? <SeriesChart series={s.series} gran={s.granularity} /> : <p className="st-sub">No tears tracked yet this season.</p>}
          </div>
          <p className="st-sub mt-1.5">
            {s.granularity === "month"
              ? `Monthly buckets: ${league} tears are sparse, so weeks would be mostly empty.${firstDate ? ` Starts with the season's earliest tracked tear (${mon(firstDate)}).` : ""}`
              : `Weeks run Mon–Sun from the first tracked tear${firstDate ? ` (week of ${short(firstDate)})` : ""}. Offseason and camp weeks included.`}
          </p>
        </section>

        <section className="st-card st-c6">
          <h2 className="st-h2">Where tears happened</h2>
          <Bars rows={s.where} max={n} />
          <p className="st-sub mt-2">{c.gameScope}</p>
          <h2 className="st-h2 mt-[18px]">Contact vs non-contact</h2>
          <Bars rows={s.mechanism} max={n} />
          <p className="st-sub mt-2">Only {s.mechanismKnown} of {n} tears have a reported mechanism; unknowns stay unknown.</p>
        </section>

        {s.surface && (
          <section className="st-card st-c6">
            <h2 className="st-h2">Playing surface · game tears</h2>
            <Bars rows={s.surface.rows} max={s.inGame} />
            <p className="st-sub mt-2">
              {s.inGame} game-day tears
              {s.surface.gamesWithoutSurface ? `, ${s.surface.gamesWithSurface} with a known surface` : ", all with a known surface"}. Practice tears are excluded
              (practice-field surfaces are rarely reported).
            </p>
            <div className="st-na">
              <b style={{ color: "#E6EDF3" }}>Per-game rate · not shown yet.</b> A rate needs games played on each surface (the {s.label} schedule by
              venue), which the database doesn&apos;t store. Raw counts aren&apos;t rates: they don&apos;t account for how many games each surface hosted.
            </div>
          </section>
        )}

        <section className="st-card st-c6">
          <h2 className="st-h2">By position</h2>
          <Bars rows={nba ? s.positions : s.positions.filter((p) => p.total)} />
          <p className="st-sub mt-2">
            {nba
              ? `Buckets from the listed position (first listed): ${c.positionGroups.map((g) => `${g.positions.join(" / ")} → ${g.label}`).join(", ")}.`
              : `Groups: ${s.positionCounts.map(([p, k]) => `${p} ${k}`).join(" · ")}`}
          </p>
        </section>

        <section className="st-card st-c6">
          <h2 className="st-h2">Team leaderboard</h2>
          <Bars rows={top.map((t) => ({ ...t, label: t.abbr }))} />
          <p className="st-sub mt-2">
            {s.teamsWithTears} of {c.teamCount} teams have at least one tracked tear{s.teams.length > top.length ? `; showing top ${top.length}` : ""}. Team = current team on the tracker.
          </p>
        </section>

        <section className="st-card st-c6">
          <h2 className="st-h2">Recovery stage now</h2>
          <div className="mt-3">
            {s.stages.map((x) => (
              <div key={x.stage} className="st-row">
                <span>{x.label}</span>
                <div className="st-bar" style={{ width: `${Math.max((x.count / Math.max(n, 1)) * 100, 4).toFixed(1)}%` }}>
                  <i style={{ width: "100%", background: x.stage === "diagnosis" ? "#3b4a58" : TEAL }} />
                </div>
                <span className="st-num"><b>{x.count}</b></span>
              </div>
            ))}
          </div>
          <p className="st-sub mt-2">
            Latest reported stage per player. {diag} of {n} have no update past diagnosis — mostly no public news, not necessarily no progress.
          </p>
        </section>

        <section className="st-card st-c6">
          <h2 className="st-h2">Days from tear to surgery</h2>
          {s.surgery.length ? (
            <div className="overflow-x-auto">
              <table className="st-tbl mt-2">
                <thead>
                  <tr><th>Player</th><th>Tear</th><th className="st-num">Tear date</th><th className="st-num">Days</th></tr>
                </thead>
                <tbody>
                  {s.surgery.map((x) => (
                    <tr key={x.slug + x.tearDate}>
                      <td><Link className="st-pl" href={playerPath(league, x.slug)}>{x.name}</Link> <span className="st-sub">{x.team}</span></td>
                      <td>{x.type}</td>
                      <td className="st-num">{short(x.tearDate)}</td>
                      <td className="st-num"><b>{x.days}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="st-sub mt-3">Not reported: no surgery dates published yet this season.</p>
          )}
          <p className="st-sub mt-2">
            Only players with a reported surgery date (n={s.surgery.length}).{sm !== null ? ` Median ${fmtNum(sm)} days.` : ""}
            {longest ? ` Longest: ${longest.name}, ${longest.days} days.` : ""}
          </p>
        </section>

        <section className="st-card st-c12">
          <h2 className="st-h2">Notable</h2>
          <div className="mt-1.5">
            <div className="st-fact">
              <span className="k">Repeat tears</span>
              <div>
                {s.repeats.length ? (
                  s.repeats.map((r) => (
                    <div key={r.slug}><P league={league} {...r} /> — {r.note}</div>
                  ))
                ) : (
                  <span className="st-sub">None recorded among tracked {s.label} players.</span>
                )}
              </div>
            </div>
            <div className="st-fact">
              <span className="k">Youngest</span>
              <div>{s.ages.youngest ? <><P league={league} {...s.ages.youngest} /> · {s.ages.youngest.position} · {s.ages.youngest.age} at tear</> : <span className="st-sub">Not reported</span>}</div>
            </div>
            <div className="st-fact">
              <span className="k">Oldest</span>
              <div>{s.ages.oldest ? <><P league={league} {...s.ages.oldest} /> · {s.ages.oldest.position} · {s.ages.oldest.age} at tear</> : <span className="st-sub">Not reported</span>}</div>
            </div>
            <div className="st-fact">
              <span className="k">Average age</span>
              <div>
                {s.ages.average !== null
                  ? `${s.ages.average.toFixed(1)} at tear (${s.ages.known === n ? `all ${n}` : `${s.ages.known} of ${n}`} have a verified birth date)`
                  : <span className="st-sub">Not reported</span>}
              </div>
            </div>
            <div className="st-fact">
              <span className="k">Busiest team</span>
              <div>
                {!s.busiest ? (
                  <span className="st-sub">Not reported</span>
                ) : s.busiest.total === 1 ? (
                  `No team has more than one — ${s.teamsWithTears} different teams`
                ) : s.busiest.teams.length > 1 ? (
                  <><b>{s.busiest.teams.join(", ")}</b> · {s.busiest.total} tears each</>
                ) : (
                  <><b>{s.busiest.teams[0]}</b> · {s.busiest.total} tears ({s.busiest.achilles} Achilles, {s.busiest.acl} ACL)</>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="st-c12 st-ghost">
          <div className="text-xs font-bold uppercase tracking-[.12em]">Year-over-year — coming when past seasons are added</div>
          <div className="mt-1 text-xs">Season-to-season comparisons will appear here once earlier seasons are in the database. No numbers are shown until then.</div>
        </section>
      </div>

      <p className="st-sub mt-[18px]">
        {s.updated ? `Data as of ${formatDate(s.updated.slice(0, 10))}` : "Live data"} · {league} {s.label} only. Carryovers from earlier seasons are excluded
        {s.carryover.count ? ` (${s.carryover.count} player${s.carryover.count === 1 ? "" : "s"} from ${s.carryover.label} still in recovery)` : ""}.
      </p>
    </>
  );
}

export function StatsSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="h-4 w-48 rounded bg-white/5" />
      <div className="mt-3 h-10 w-72 rounded bg-white/5" />
      <div className="st-kpis mt-8">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="st-kpi h-24" />)}</div>
      <div className="st-card mt-4 h-72" />
    </div>
  );
}
