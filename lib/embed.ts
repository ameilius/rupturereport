import { getSeasonInfo } from "@/lib/seasons";
import { getTrackerRows } from "@/lib/tracker";
import { homePath, seasonLabel, type League } from "@/lib/leagues";

export const SITE = "https://rupturereport.com";
export const EMBED_W = 360;
export const EMBED_H = 168;

export const embedPath = (l: League) => `/embed/${l.toLowerCase()}`;

/** The copy-paste snippet: the iframe plus a plain text link (the followable credit on the host page). */
export function embedSnippet(l: League): string {
  const home = `${SITE}${homePath(l) === "/" ? "/" : homePath(l)}`;
  return [
    `<iframe src="${SITE}${embedPath(l)}" width="${EMBED_W}" height="${EMBED_H}" style="border:0;border-radius:14px;max-width:100%" loading="lazy" title="${l} ACL &amp; Achilles tear count by Rupture Report"></iframe>`,
    `<p style="font-size:12px">Data: <a href="${home}">${l} ACL &amp; Achilles tear tracker</a> by Rupture Report</p>`,
  ].join("\n");
}

export interface EmbedData {
  league: League;
  label: string;
  total: number;
  acl: number;
  achilles: number;
  returned: number;
  updated: string | null;
}

/** Current-season counts (same rows and rules as the tracker and /stats). */
export async function embedData(league: League): Promise<EmbedData> {
  const info = await getSeasonInfo(league);
  const rows = await getTrackerRows({ league, season: info.current });
  return {
    league,
    label: seasonLabel(league, info.current),
    total: rows.length,
    acl: rows.filter((r) => r.injuryType === "ACL").length,
    achilles: rows.filter((r) => r.injuryType === "Achilles").length,
    returned: rows.filter((r) => r.stage === "returned").length,
    updated: rows.reduce<string | null>((m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m), null),
  };
}

