export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function humanize(v: string | null | undefined): string | null {
  if (!v) return null;
  const s = v.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Compact bio line, e.g. 6′5″ · 250 lb · Age 28. Missing parts are skipped. */
export function bioLine(p: { heightIn: number | null; weightLb: number | null; dob: string | null }): string | null {
  const parts: string[] = [];
  if (p.heightIn) parts.push(`${Math.floor(p.heightIn / 12)}\u2032${p.heightIn % 12}\u2033`);
  if (p.weightLb) parts.push(`${p.weightLb} lb`);
  if (p.dob) {
    const [y, m, d] = p.dob.slice(0, 10).split("-").map(Number);
    const now = new Date();
    let age = now.getUTCFullYear() - y;
    if (now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d)) age--;
    if (age > 0 && age < 60) parts.push(`Age ${age}`);
  }
  return parts.length ? parts.join(" · ") : null;
}
