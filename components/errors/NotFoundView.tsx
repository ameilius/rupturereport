import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { formatDate } from "@/lib/format";
import { getTrackerRows } from "@/lib/tracker";

export const NOT_FOUND_HEADLINE = "This page tore its ACL";
export const NOT_FOUND_SUBLINE = "It's out for the season. Let's get you back on the field.";

export function NotFoundView() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <p className="text-7xl font-black tracking-tight text-teal sm:text-9xl" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{NOT_FOUND_HEADLINE}</h1>
      <p className="mt-3 text-lg text-muted">{NOT_FOUND_SUBLINE}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-teal px-5 py-2.5 font-semibold text-bg transition hover:brightness-110"
        >
          Tear tracker
        </Link>
        <Link
          href="/players"
          className="rounded-lg border border-border bg-surface px-5 py-2.5 font-semibold transition hover:border-teal hover:text-teal"
        >
          All players
        </Link>
      </div>
      <Suspense fallback={null}>
        <RecentInjuries />
      </Suspense>
    </main>
  );
}

async function RecentInjuries() {
  await connection();
  let rows: Awaited<ReturnType<typeof getTrackerRows>> = [];
  try {
    rows = (await getTrackerRows()).slice(0, 3);
  } catch {
    return null;
  }
  if (!rows.length) return null;
  return (
    <section className="mx-auto mt-14 max-w-md text-left" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="text-xs font-semibold uppercase tracking-wider text-muted">
        Most recent tears
      </h2>
      <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/players/${r.slug}`} className="flex items-center justify-between gap-3 p-3 hover:text-teal">
              <span className="min-w-0">
                <span className="font-semibold">{r.name}</span>
                <span className="block text-xs text-muted">
                  {[r.position, r.teamName].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-right text-xs">
                <span className={r.injuryType === "ACL" ? "text-teal" : "text-amber"}>{r.injuryType}</span>
                {r.injuryDate && <span className="block text-muted">{formatDate(r.injuryDate)}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
