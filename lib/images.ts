/**
 * Official image kill switch. Set NEXT_PUBLIC_USE_OFFICIAL_IMAGES="false" in the server env
 * (then restart/redeploy) to hide official team logos and player headshots and use original
 * fallbacks (team-colour shield badges, initials avatars). Unset or any other value → shown.
 * Checked server-side when data is loaded, so client components simply receive null paths.
 */
export function officialImagesEnabled(): boolean {
  return process.env["NEXT_PUBLIC_USE_OFFICIAL_IMAGES"] !== "false";
}

/** Server-side: returns the stored path only when official images are enabled. */
export function gated(path: string | null | undefined): string | null {
  return officialImagesEnabled() ? path ?? null : null;
}

/** Team colours for fallback badges/avatars: [primary, secondary]. */
export const TEAM_COLORS: Record<string, [string, string]> = {
  ARI: ["#97233F", "#FFB612"], ATL: ["#A71930", "#000000"], BAL: ["#241773", "#9E7C0C"],
  BUF: ["#00338D", "#C60C30"], CAR: ["#0085CA", "#101820"], CHI: ["#0B162A", "#C83803"],
  CIN: ["#FB4F14", "#000000"], CLE: ["#311D00", "#FF3C00"], DAL: ["#003594", "#869397"],
  DEN: ["#FB4F14", "#002244"], DET: ["#0076B6", "#B0B7BC"], GB: ["#203731", "#FFB612"],
  HOU: ["#03202F", "#A71930"], IND: ["#002C5F", "#A2AAAD"], JAX: ["#006778", "#D7A22A"],
  KC: ["#E31837", "#FFB81C"], LV: ["#000000", "#A5ACAF"], LAC: ["#0080C6", "#FFC20E"],
  LAR: ["#003594", "#FFA300"], MIA: ["#008E97", "#FC4C02"], MIN: ["#4F2683", "#FFC62F"],
  NE: ["#002244", "#C60C30"], NO: ["#101820", "#D3BC8D"], NYG: ["#0B2265", "#A71930"],
  NYJ: ["#125740", "#FFFFFF"], PHI: ["#004C54", "#A5ACAF"], PIT: ["#101820", "#FFB612"],
  SF: ["#AA0000", "#B3995D"], SEA: ["#002244", "#69BE28"], TB: ["#D50A0A", "#FF7900"],
  TEN: ["#0C2340", "#4B92DB"], WAS: ["#5A1414", "#FFB612"],
};

export function teamColors(abbr: string | null | undefined): [string, string] {
  return (abbr && TEAM_COLORS[abbr]) || ["#1F2933", "#14B8A6"];
}

export function initials(name: string): string {
  const parts = name.replace(/\b(Jr\.?|Sr\.?|II|III|IV)\b/g, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Only allow local, site-relative image paths (never hotlinks). */
export function localImage(path: string | null | undefined): string | null {
  if (!path) return null;
  return /^\/[A-Za-z0-9/_.-]+\.(png|jpe?g|webp)$/.test(path) && !path.includes("..") ? path : null;
}
