import { positionBreakdown, type TrackerRow } from "@/lib/tracker";

const ROW = 40; // px per row (label column and SVG share this)
const BAR = 18;

/** NBA twin of SurfaceBreakdown: tears by position group (Guards / Wings-forwards / Bigs). */
export default function PositionBreakdown({ rows }: { rows: TrackerRow[] }) {
  const b = positionBreakdown(rows);
  const total = rows.length;
  if (!total) return null;
  const inGame = rows.filter((r) => r.isGame).length;
  const max = Math.max(1, ...b.map((x) => x.total));
  const aria =
    `Tears by position, ${total} total: ` + b.map((x) => `${x.bucket} ${x.total} (${x.acl} ACL, ${x.achilles} Achilles)`).join("; ") + ".";
  const top = [...b].sort((x, y) => y.total - x.total)[0];
  const takeaway = `${top.total} of ${total} tracked tears (${Math.round((top.total / total) * 100)}%) were ${top.bucket === "Guards" ? "guards" : top.bucket === "Bigs" ? "bigs" : "wings/forwards"}; ${total - inGame} of ${total} happened outside games.`;

  return (
    <section aria-labelledby="position-heading" className="glass mt-4 rounded-xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="position-heading" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Tears by position
        </h2>
        <p className="text-xs text-muted">
          <span className="tabular-nums text-text">{inGame}</span> in games ·{" "}
          <span className="tabular-nums text-text">{total - inGame}</span> practice/offseason
        </p>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,auto)_1fr] gap-x-3 sm:gap-x-4">
        <ul className="text-sm" aria-hidden="true">
          {b.map((x) => (
            <li key={x.bucket} style={{ height: ROW }} className="flex flex-col justify-center leading-tight">
              <span className="font-medium">{x.bucket}</span>
            </li>
          ))}
        </ul>
        <svg role="img" aria-label={aria} width="100%" height={ROW * b.length} className="block overflow-visible">
          <title>{aria}</title>
          {b.map((x, i) => {
            const n = x.total;
            const y = i * ROW + (ROW - BAR) / 2;
            const w = (n / max) * 82;
            const wa = n ? (x.acl / n) * w : 0;
            return (
              <g key={x.bucket}>
                <rect x="0" y={y} width="82%" height={BAR} rx="4" fill="#1F2933" opacity="0.5" />
                {x.acl > 0 && <rect className="rr-grow-x" x="0" y={y} width={`${wa}%`} height={BAR} rx="4" fill="#14B8A6" />}
                {x.achilles > 0 && <rect className="rr-grow-x" x={`${wa}%`} y={y} width={`${w - wa}%`} height={BAR} rx="4" fill="#F59E0B" />}
                {x.acl > 0 && x.achilles > 0 && <rect x={`${wa}%`} y={y} width="2" height={BAR} fill="#121821" />}
                <text x={`${w + 2}%`} y={y + BAR / 2} dominantBaseline="central" fontSize="13" fill="#E6EDF3" fontWeight="700">
                  {n}
                  <tspan fill="#8B98A5" fontWeight="400" fontSize="11">{`  ${x.acl}·${x.achilles}`}</tspan>
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
      <p className="mt-2 text-sm text-text" data-position-takeaway>{takeaway}</p>
    </section>
  );
}
