/**
 * Client-side GA4 event helpers. Events are only sent if the GA tag was allowed to load
 * (production hostname, browser not flagged internal), so nothing here can throw or queue
 * events on localhost, previews, or the owner's own browsers. See components/Analytics.tsx.
 */
import { leagueFromPathname } from "@/lib/leagues";

type Value = string | number | boolean | null | undefined;
type Gtag = (cmd: "event", name: string, params: Record<string, string | number | boolean>) => void;

/** Only these hostnames send analytics. */
export const GA_HOSTS = ["rupturereport.com"];
/** localStorage key marking a browser as internal (owner/admin): GA never loads there. */
export const GA_INTERNAL_KEY = "rr_ga_internal";

export function track(name: string, params: Record<string, Value> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: Gtag; __rrq?: [string, Record<string, string | number | boolean>][] };
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") clean[k] = v;
  if (typeof w.gtag !== "function") {
    // The tag loads after hydration; queue early events (the loader flushes them). If the tag never
    // loads (internal browser, other host), the queue is simply never sent.
    (w.__rrq ||= []).push([name, clean]);
    return;
  }
  try {
    w.gtag("event", name, clean);
  } catch {
    /* analytics must never break the page */
  }
}

/** "nfl" | "nba" | undefined for neutral pages (contact, terms). */
export function leagueParam(pathname: string | null | undefined): string | undefined {
  return leagueFromPathname(pathname)?.toLowerCase();
}

/** Player slug from /players/{slug} or /nba/players/{slug}. */
export function playerSlugFromPath(pathname: string | null | undefined): string | undefined {
  return /^(?:\/nba)?\/players\/([^/?#]+)/.exec(pathname ?? "")?.[1];
}

/** Rough content type for share events. */
export function contentTypeFromPath(pathname: string): string {
  if (playerSlugFromPath(pathname)) return "player";
  if (/^(?:\/nba)?\/stats\/?$/.test(pathname)) return "stats";
  if (/^(?:\/nba)?\/players\/?$/.test(pathname)) return "players_index";
  if (leagueFromPathname(pathname)) return "tracker";
  return "page";
}
