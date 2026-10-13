/** Five-step recovery track mapped from the progress_updates.stage enum (client-safe, no DB imports). */
export const TRACK = [
  { key: "diagnosis", label: "Diagnosis", stages: ["diagnosis"] },
  { key: "surgery", label: "Surgery", stages: ["surgery"] },
  { key: "rehab", label: "Rehab", stages: ["immobilization", "non_weight_bearing", "weight_bearing", "jogging", "cutting"] },
  { key: "practice", label: "Practice", stages: ["practice_limited", "practice_full"] },
  { key: "return", label: "Return", stages: ["game_ready", "returned"] },
] as const;

/** Index of the track step for a stage; -1 for unknown/none. "reinjured" restarts at Diagnosis. */
export function trackIndex(stage: string | null | undefined): number {
  if (!stage) return -1;
  if (stage === "reinjured") return 0;
  return TRACK.findIndex((t) => (t.stages as readonly string[]).includes(stage));
}

/** Earliest known date per track step from progress updates (after the most recent re-injury). */
export function trackDates(updates: { stage: string; updateDate: string | null }[]): (string | null)[] {
  const lastRe = updates.map((u) => u.stage).lastIndexOf("reinjured");
  const relevant = lastRe >= 0 ? updates.slice(lastRe) : updates;
  const out: (string | null)[] = TRACK.map(() => null);
  for (const u of relevant) {
    const i = trackIndex(u.stage);
    if (i >= 0 && u.updateDate && (!out[i] || u.updateDate < out[i]!)) out[i] = u.updateDate;
  }
  return out;
}
