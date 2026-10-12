import { Suspense } from "react";
import { connection } from "next/server";
import { pool } from "@/lib/db";

async function TeamCount() {
  await connection();
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM teams");
  const count = (rows as { count: number }[])[0].count;
  return <>{count} teams loaded</>;
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        2026 NFL Season
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
        ACL &amp; Achilles Recovery Tracker
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">
        Every major NFL ACL and Achilles injury, tracked from the day it
        happens to the day the player returns, with turf type, stadium, and
        mechanism for each one.
      </p>
      <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
        <span className="h-2 w-2 rounded-full bg-amber" />
        Launching soon ·{" "}
        <Suspense fallback="checking database…">
          <TeamCount />
        </Suspense>
      </div>
    </main>
  );
}