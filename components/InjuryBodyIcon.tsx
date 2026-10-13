import { useId } from "react";

/**
 * Minimal side-view leg diagram highlighting the injured structure.
 * Server-safe (no hooks). Add new injury types to HIGHLIGHTS (e.g. MCL, meniscus, hamstring).
 * Convention: the default drawing is a right leg (toes point right); left legs are mirrored.
 */
const LEG = "M7.5 1 C9 9 12.5 16 14 21.5 C12 25 9.5 30 9.8 36 C10.2 42 13 45.5 14.6 49.5 C12.6 51.5 11.8 54.5 12.4 57.5 C13 60 14.8 61.5 17.5 61.5 L40.5 61.5 C43.2 61.5 44 58.6 41.8 57.2 C37 54.6 30.5 53.2 27.6 50.4 C26.4 46 26.6 39 27.8 31.5 C28.6 28.6 31.4 26.2 31.6 22.4 C31.8 18.6 30.2 16 30.6 11 C31.4 7 33 3.5 34.5 1 Z";

type Highlight = { label: string; color: string; render: (small: boolean, color: string) => React.ReactNode };

const ACHILLES_PATH = "M14.2 43 C14.8 46 15.6 48 16.2 50.2 C14.8 52.4 14.4 55 14.9 58";

const HIGHLIGHTS: Record<string, Highlight> = {
  acl: {
    label: "ACL",
    color: "#14B8A6",
    render: (small, c) => (
      <>
        <circle cx="22" cy="23" r={small ? 10 : 9} fill={c} opacity={small ? 0.22 : 0.16} />
        <path d="M18.5 19 L25.5 27 M25.5 19 L18.5 27" stroke={c} strokeWidth={small ? 3.6 : 2.4} strokeLinecap="round" />
      </>
    ),
  },
  achilles: {
    label: "Achilles",
    color: "#F59E0B",
    render: (small, c) => (
      <>
        <path d={ACHILLES_PATH} fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" opacity={small ? 0.22 : 0.16} />
        <path d={ACHILLES_PATH} fill="none" stroke={c} strokeWidth={small ? 3.8 : 2.6} strokeLinecap="round" />
      </>
    ),
  },
};

export function injuryIconKey(type: string | null | undefined): string {
  return (type ?? "").toLowerCase();
}

const SIDE_LABEL: Record<string, string> = { left: "Left", right: "Right", bilateral: "Both" };

/** Caption such as "Left Achilles", or just "Achilles" when the side is unknown. */
export function injuryCaption(type: string, side?: string | null): string {
  const h = HIGHLIGHTS[injuryIconKey(type)];
  const name = h?.label ?? (type === "other" ? "Injury" : type);
  const s = side ? SIDE_LABEL[side] : undefined;
  return s ? `${s} ${name}` : name;
}

export default function InjuryBodyIcon({
  type,
  side,
  size = 24,
  className,
  decorative = false,
}: {
  type: string;
  side?: string | null;
  size?: number;
  className?: string;
  decorative?: boolean;
}) {
  const h = HIGHLIGHTS[injuryIconKey(type)];
  const small = size < 48;
  const fade = `leg-fade-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const mirror = side === "left";
  const label = `${injuryCaption(type, side)} injury diagram`;
  return (
    <svg
      viewBox="0 0 48 64"
      width={Math.round(size * 0.75)}
      height={size}
      className={`shrink-0 ${className ?? ""}`}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
    >
      {!decorative && <title>{label}</title>}
      <defs>
        {/* fade the cut-off top of the thigh so it reads as a leg, not a boot */}
        <linearGradient id={`${fade}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.28" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={fade} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="64">
          <rect width="48" height="64" fill={`url(#${fade}-g)`} />
        </mask>
      </defs>
      <g transform={mirror ? "translate(48 0) scale(-1 1)" : undefined}>
        <path
          mask={`url(#${fade})`}
          d={LEG}
          fill="#8B98A5"
          fillOpacity={0.1}
          stroke="#8B98A5"
          strokeOpacity={0.85}
          strokeWidth={small ? 2.6 : 1.6}
          strokeLinejoin="round"
        />
        {h?.render(small, h.color)}
      </g>
    </svg>
  );
}
