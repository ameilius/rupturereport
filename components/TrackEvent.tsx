"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires one GA4 event when mounted (e.g. view_player, view_stats). Renders nothing. */
export default function TrackEvent({ name, params }: { name: string; params: Record<string, string | undefined> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    // Defer one tick so the tag's own config/page_view is queued first.
    const t = setTimeout(() => track(name, JSON.parse(key)), 0);
    return () => clearTimeout(t);
  }, [name, key]);
  return null;
}
