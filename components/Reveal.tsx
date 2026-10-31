"use client";

import { useEffect } from "react";

const SEL = ".rr-grow, .rr-grow-x, .rr-rise, .rr-draw";

/** Starts chart grow-in animations as each element scrolls into view (adds .rr-go). */
export default function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.rrReveal = "1";
    if (!root.classList.contains("rr-js")) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("rr-go");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scan = () => document.querySelectorAll(`:is(${SEL}):not(.rr-go)`).forEach((el) => io.observe(el));
    scan();
    // Streamed (Suspense) content arrives after mount.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
