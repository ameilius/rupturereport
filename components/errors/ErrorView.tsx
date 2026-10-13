"use client";

import Link from "next/link";
import { useEffect } from "react";

export const ERROR_HEADLINE = "Injury timeout";
export const ERROR_SUBLINE = "Something went wrong on our end. The trainers are taking a look.";

export function ErrorView({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Home",
  headline = ERROR_HEADLINE,
  subline = ERROR_SUBLINE,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
  headline?: string;
  subline?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <p className="text-6xl font-black tracking-tight text-amber sm:text-8xl" aria-hidden="true">
        ⏱
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{headline}</h1>
      <p className="mt-3 text-lg text-muted">{subline}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-teal px-5 py-2.5 font-semibold text-bg transition hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href={homeHref}
          className="rounded-lg border border-border bg-surface px-5 py-2.5 font-semibold transition hover:border-teal hover:text-teal"
        >
          {homeLabel}
        </Link>
      </div>
      {error.digest && <p className="mt-10 font-mono text-xs text-muted">Reference: {error.digest}</p>}
    </main>
  );
}
