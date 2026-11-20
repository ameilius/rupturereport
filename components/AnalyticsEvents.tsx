"use client";

import { useEffect } from "react";
import { leagueParam, playerSlugFromPath, track } from "@/lib/analytics";

/**
 * Site-wide delegated click tracking (no markup changes needed):
 * - source_click: any link to another site (injury sources, X profile, etc.), except share-menu links
 *   (those are counted as `share` by ShareButton).
 * - league_switch: the NFL | NBA pill, when it changes league.
 */
export default function AnalyticsEvents() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const path = location.pathname;
      if (a.closest(".rr-sw")) {
        const to = leagueParam(new URL(a.href, location.href).pathname);
        if (to && to !== leagueParam(path)) track("league_switch", { league: to, from_league: leagueParam(path) });
        return;
      }
      if (a.closest("[data-ga-share]")) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (!/^https?:$/.test(url.protocol) || url.hostname === location.hostname) return;
      track("source_click", {
        link_domain: url.hostname.replace(/^www\./, ""),
        link_url: url.href.slice(0, 300),
        league: leagueParam(path),
        player_slug: playerSlugFromPath(path),
      });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
