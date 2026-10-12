import Image from "next/image";
import { initials, localImage, teamColors } from "@/lib/images";

export function TeamBadge({ abbr, size = 24 }: { abbr: string | null; size?: number }) {
  const [p, s] = teamColors(abbr);
  const text = abbr ?? "?";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <path d="M32 3 L56 11 V31 C56 46 46 55.5 32 61 C18 55.5 8 46 8 31 V11 Z" fill={p} stroke={s} strokeWidth="4" strokeLinejoin="round" />
      <text x="32" y="38.5" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800"
        fontSize={text.length > 2 ? 17 : 21} fill={s === "#000000" ? "#FFFFFF" : s}>{text}</text>
    </svg>
  );
}

export function TeamLogo({ abbr, name, logoPath, size = 24 }: {
  abbr: string | null; name?: string | null; logoPath?: string | null; size?: number;
}) {
  const src = localImage(logoPath);
  const label = `${name ?? abbr ?? "Team"} logo`;
  if (src) {
    return <Image src={src} alt={label} width={size} height={size} sizes={`${size}px`} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
  }
  return <span role="img" aria-label={label} className="inline-flex"><TeamBadge abbr={abbr} size={size} /></span>;
}

export function PlayerAvatar({ name, team, headshotPath, size = 32, priority = false }: {
  name: string; team: string | null; headshotPath?: string | null; size?: number; priority?: boolean;
}) {
  const src = localImage(headshotPath);
  const [p, s] = teamColors(team);
  if (src) {
    return (
      <Image src={src} alt={`${name} headshot`} width={size} height={size} sizes={`${size}px`} priority={priority}
        className="shrink-0 rounded-full bg-surface object-cover ring-1 ring-border" style={{ width: size, height: size, borderColor: s }} />
    );
  }
  return (
    <span role="img" aria-label={name}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-border"
      style={{ width: size, height: size, background: p, color: "#FFFFFF", boxShadow: `inset 0 0 0 2px ${s}`, fontSize: Math.round(size * 0.38) }}>
      {initials(name)}
    </span>
  );
}
