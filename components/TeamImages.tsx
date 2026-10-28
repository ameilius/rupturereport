import Image from "next/image";
import type { League } from "@/lib/leagues";
import { initials, localImage, teamColors, textOn } from "@/lib/images";

export function TeamBadge({ abbr, size = 24, league = "NFL" }: { abbr: string | null; size?: number; league?: League }) {
  const [p, s] = teamColors(abbr, league);
  const text = abbr ?? "?";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <path d="M32 3 L56 11 V31 C56 46 46 55.5 32 61 C18 55.5 8 46 8 31 V11 Z" fill={p} stroke={s} strokeWidth="4" strokeLinejoin="round" />
      <text x="32" y="38.5" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800"
        fontSize={text.length > 2 ? 17 : 21} fill={textOn(p, s)}>{text}</text>
    </svg>
  );
}

/**
 * Team logo on a light circular backing so dark marks (JAX, NO, LV, BAL, NYG, CHI, NE…) stay legible
 * on the dark UI and team-color accents. Outer box is exactly `size`; the mark is inset ~14%.
 * The custom badge fallback sits on the same backing for consistency.
 */
export function TeamLogo({ abbr, name, logoPath, size = 24, league = "NFL" }: {
  abbr: string | null; name?: string | null; logoPath?: string | null; size?: number; league?: League;
}) {
  const src = localImage(logoPath);
  const label = `${name ?? abbr ?? "Team"} logo`;
  const inner = Math.max(12, Math.round(size * 0.72));
  const chip = "inline-flex shrink-0 items-center justify-center rounded-full";
  const backing = { width: size, height: size, background: "rgb(241 245 249 / 0.92)", boxShadow: "0 0 0 1px rgb(255 255 255 / 0.18), 0 1px 3px rgb(0 0 0 / 0.45)" };
  if (src) {
    return (
      <span className={chip} style={backing}>
        <Image src={src} alt={label} width={inner} height={inner} sizes={`${inner}px`} className="object-contain" style={{ width: inner, height: inner }} />
      </span>
    );
  }
  return (
    <span role="img" aria-label={label} className={chip} style={backing}>
      <TeamBadge abbr={abbr} size={inner} league={league} />
    </span>
  );
}

export function PlayerAvatar({ name, team, headshotPath, size = 32, priority = false, league = "NFL" }: {
  name: string; team: string | null; headshotPath?: string | null; size?: number; priority?: boolean; league?: League;
}) {
  const src = localImage(headshotPath);
  const [p, s] = teamColors(team, league);
  if (src) {
    return (
      <Image src={src} alt={`${name} headshot`} width={size} height={size} sizes={`${size}px`} priority={priority}
        className="shrink-0 rounded-full bg-surface object-cover ring-1 ring-border" style={{ width: size, height: size, borderColor: s }} />
    );
  }
  return (
    <span role="img" aria-label={name}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-border"
      style={{ width: size, height: size, background: p, color: textOn(p), boxShadow: `inset 0 0 0 2px ${s}`, fontSize: Math.round(size * 0.38) }}>
      {initials(name)}
    </span>
  );
}
