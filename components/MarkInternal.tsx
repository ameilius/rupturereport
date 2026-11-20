"use client";

import { useEffect } from "react";
import { GA_INTERNAL_KEY } from "@/lib/analytics";

/** Rendered in the logged-in admin portal: flags this browser so the public site never loads GA here. */
export default function MarkInternal() {
  useEffect(() => {
    try {
      localStorage.setItem(GA_INTERNAL_KEY, "1");
    } catch {
      /* storage blocked: nothing to do */
    }
  }, []);
  return null;
}
