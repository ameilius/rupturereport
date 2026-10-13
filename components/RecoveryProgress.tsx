import { TRACK, trackIndex } from "@/lib/recovery";

function shortDate(d: string) {
  return new Date(d.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Full 5-step stepper (server-rendered). Horizontal on sm+, vertical on mobile. */
export function RecoveryStepper({
  stage,
  stageLabel,
  dates,
  color = "var(--accent, #14B8A6)",
}: {
  stage: string | null;
  stageLabel: string | null;
  dates: (string | null)[];
  color?: string;
}) {
  const cur = trackIndex(stage);
  const reinjured = stage === "reinjured";
  return (
    <ol
      aria-label={`Recovery progress: ${stageLabel ?? "awaiting update"}`}
      className="relative grid grid-cols-1 gap-0 sm:grid-cols-5"
    >
      {TRACK.map((t, i) => {
        const done = i < cur;
        const current = i === cur;
        const fill = reinjured && current ? "#F59E0B" : color;
        return (
          <li
            key={t.key}
            aria-current={current ? "step" : undefined}
            className="relative flex items-start gap-3 pb-5 last:pb-0 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center"
          >
            {i < TRACK.length - 1 && (
              <>
                {/* connector: vertical on mobile, horizontal on sm+ */}
                <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-0.5 sm:hidden"
                  style={{ background: done ? color : "#1F2933" }} />
                <span aria-hidden="true" className="absolute left-[calc(50%+14px)] right-[calc(-50%+14px)] top-[11px] hidden h-0.5 sm:block"
                  style={{ background: done ? color : "#1F2933" }} />
              </>
            )}
            <span aria-hidden="true" className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
              {current && (
                <span className="absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping" style={{ background: fill }} />
              )}
              <span
                className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                style={
                  done
                    ? { background: color, borderColor: color, color: "#0B0F14" }
                    : current
                      ? { background: "#0B0F14", borderColor: fill, boxShadow: `0 0 0 4px color-mix(in srgb, ${fill} 25%, transparent)` }
                      : { background: "#121821", borderColor: "#1F2933" }
                }
              >
                {done ? "✓" : current ? <span className="h-2 w-2 rounded-full" style={{ background: fill }} /> : null}
              </span>
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold ${done || current ? "text-text" : "text-muted/60"}`}>
                {t.label}
                <span className="sr-only">{done ? " (completed)" : current ? " (current)" : " (upcoming)"}</span>
              </span>
              {current && stageLabel && stageLabel !== t.label && (
                <span className="block text-xs" style={{ color: fill }}>{stageLabel}</span>
              )}
              <span className={`block text-xs ${done || current ? "text-muted" : "text-muted/50"}`}>
                {dates[i] ? <time dateTime={dates[i]!.slice(0, 10)}>{shortDate(dates[i]!)}</time> : done || current ? "—" : ""}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Compact 5-segment bar for tables; visible text label kept alongside. */
export function MiniStageBar({ stage, label }: { stage: string | null; label: string }) {
  const cur = trackIndex(stage);
  const reinjured = stage === "reinjured";
  const step = cur >= 0 ? `step ${cur + 1} of ${TRACK.length}` : "no update yet";
  return (
    <span className="inline-flex flex-col gap-1">
      <span className="flex gap-0.5" role="img" aria-label={`Recovery: ${label} (${step})`}>
        {TRACK.map((t, i) => (
          <span
            key={t.key}
            className={`h-1.5 w-4 rounded-sm ${
              i < cur ? "bg-teal" : i === cur ? (reinjured ? "bg-amber" : "bg-teal motion-safe:animate-pulse") : "bg-border"
            }`}
          />
        ))}
      </span>
      <span className="text-xs text-muted" aria-hidden="true">{label}</span>
    </span>
  );
}
