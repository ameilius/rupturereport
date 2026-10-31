import type { TrackerRow } from "@/lib/tracker";

type Bucket = { key: string; label: string; sub: string; acl: number; ach: number };

const ROW = 40; // px per row (label column and SVG share this)
const BAR = 18;

export function surfaceBuckets(rows: TrackerRow[]): Bucket[] {
  const defs: Bucket[] = [
    { key: "artificial", label: "Artificial turf", sub: "game", acl: 0, ach: 0 },
    { key: "natural", label: "Natural grass", sub: "game", acl: 0, ach: 0 },
    { key: "hybrid", label: "Hybrid grass", sub: "game", acl: 0, ach: 0 },
    { key: "unknown", label: "Game, surface unknown", sub: "game", acl: 0, ach: 0 },
    { key: "nongame", label: "Practice / offseason", sub: "no game venue", acl: 0, ach: 0 },
  ];
  const by = Object.fromEntries(defs.map((d) => [d.key, d]));
  for (const r of rows) {
    const k = r.surface && by[r.surface] ? r.surface : r.isGame ? "unknown" : "nongame";
    if (r.injuryType === "Achilles") by[k].ach++;
    else if (r.injuryType === "ACL") by[k].acl++;
  }
  // Always show the three real surfaces and non-game; hide "unknown" when empty.
  return defs.filter((d) => d.key !== "unknown" || d.acl + d.ach > 0);
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export default function SurfaceBreakdown({ rows }: { rows: TrackerRow[] }) {
  const b = surfaceBuckets(rows);
  const total = b.reduce((s, x) => s + x.acl + x.ach, 0);
  if (!total) return null;
  const game = b.filter((x) => x.sub === "game").reduce((s, x) => s + x.acl + x.ach, 0);
  const art = b.find((x) => x.key === "artificial")!;
  const artN = art.acl + art.ach;
  const nonGame = total - game;
  const max = Math.max(...b.map((x) => x.acl + x.ach));
  const aria =
    `Tears by playing surface, ${total} total: ` +
    b.map((x) => `${x.label} ${x.acl + x.ach} (${x.acl} ACL, ${x.ach} Achilles)`).join("; ") + ".";
  const takeaway = game
    ? `${artN} of ${game} game-day tears (${pct(artN, game)}%) happened on artificial turf; ${nonGame} of ${total} tears occurred outside games.`
    : "No game-day tears recorded yet.";

  return (
    <section aria-labelledby="surface-heading" className="glass mt-4 rounded-xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="surface-heading" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Surface breakdown
        </h2>
        <p className="text-xs text-muted">
          <span className="tabular-nums text-text">{game}</span> game-day ·{" "}
          <span className="tabular-nums text-text">{nonGame}</span> practice/offseason
        </p>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,auto)_1fr] gap-x-3 sm:gap-x-4">
        <ul className="text-sm" aria-hidden="true">
          {b.map((x) => (
            <li key={x.key} style={{ height: ROW }} className="flex flex-col justify-center leading-tight">
              <span className={x.sub === "game" ? "font-medium" : "text-muted"}>{x.label}</span>
            </li>
          ))}
        </ul>
        <svg role="img" aria-label={aria} width="100%" height={ROW * b.length} className="block overflow-visible">
          <title>{aria}</title>
          {b.map((x, i) => {
            const n = x.acl + x.ach;
            const y = i * ROW + (ROW - BAR) / 2;
            const w = (n / max) * 82; // leave room for the count label
            const wa = n ? (x.acl / n) * w : 0;
            const dim = x.sub !== "game";
            return (
              <g key={x.key} opacity={dim ? 0.55 : 1}>
                <rect x="0" y={y} width="82%" height={BAR} rx="4" fill="#1F2933" opacity="0.5" />
                {x.acl > 0 && <rect className="rr-grow-x" x="0" y={y} width={`${wa}%`} height={BAR} rx="4" fill="#14B8A6" />}
                {x.ach > 0 && <rect className="rr-grow-x" x={`${wa}%`} y={y} width={`${w - wa}%`} height={BAR} rx="4" fill="#F59E0B" />}
                {x.acl > 0 && x.ach > 0 && <rect x={`${wa}%`} y={y} width="2" height={BAR} fill="#121821" />}
                <text x={`${w + 2}%`} y={y + BAR / 2} dominantBaseline="central" fontSize="13" fill="#E6EDF3" fontWeight="700">
                  {n}
                  <tspan fill="#8B98A5" fontWeight="400" fontSize="11">{`  ${x.acl}·${x.ach}`}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-teal" />ACL</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber" />Achilles</span>
        <span>Counts shown as total, then ACL·Achilles</span>
      </div>
      <p className="mt-2 text-sm text-text" data-surface-takeaway>{takeaway}</p>
    </section>
  );
}
