import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import StatsPage, { StatsSkeleton } from "@/components/StatsPage";
import { statsMetadata } from "@/lib/stats-meta";

// NFL stats for the CURRENT NFL season only, computed live (see lib/stats.ts).
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  return statsMetadata("NFL");
}

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPage league="NFL" />
      </Suspense>
    </main>
  );
}
