import { breadcrumbJsonLd } from "@/lib/structured-data";
import { defaultOgImage } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { PlayerAvatar, TeamLogo } from "@/components/TeamImages";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatDate } from "@/lib/format";
import {
  STAGE_LABELS,
  formatInjuryType,
  getInjuredPlayersList,
  type PlayerListItem,
} from "@/lib/players";

const title = "Tracked NFL Players: ACL & Achilles Tears, All Seasons";
const description =
  "Every NFL player with a tracked ACL or Achilles tear, across all seasons, with recovery stage, tear date and team.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/players" },
  openGraph: { type: "website", url: "/players", title, description, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title, description, images: [defaultOgImage.url] },
};

export default function PlayersPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([["Home", "/"], ["Players", "/players"]])).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-teal">
          Home
        </Link>
      </nav>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
        Tracked players
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>
      <Suspense
        fallback={<p className="mt-10 text-muted">Loading players…</p>}
      >
        <PlayerList />
      </Suspense>
    </main>
  );
}

async function PlayerList() {
  await connection();
  let players: PlayerListItem[] = [];
  let failed = false;
  try {
    players = await getInjuredPlayersList();
  } catch {
    failed = true;
  }

  if (players.length === 0) {
    return (
      <p className="mt-10 rounded-xl border border-border bg-surface p-6 text-muted">
        {failed
          ? "Player data is temporarily unavailable. Please check back shortly."
          : "No players are being tracked yet. Check back soon as the season unfolds."}
      </p>
    );
  }

  return (
    <ul className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {players.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/players/${p.slug}`}
            className="flex flex-col gap-1 p-5 transition-colors hover:bg-border/40 focus-visible:bg-border/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-center gap-4">
              <PlayerAvatar name={p.fullName} team={p.teamAbbreviation} headshotPath={p.headshotPath} size={48} />
              <span>
                <span className="block text-lg font-semibold">{p.fullName}</span>
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <TeamLogo abbr={p.teamAbbreviation} name={p.teamName} logoPath={p.teamLogo} size={18} />
                  {[p.position, p.teamName].filter(Boolean).join(" · ")}
                </span>
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-amber/15 px-2.5 py-0.5 font-semibold text-amber">
                {formatInjuryType(p.injuryType)}
              </span>
              {p.injuryDate && (
                <span className="text-muted">{formatDate(p.injuryDate)}</span>
              )}
              {p.latestStage && (
                <span className="text-teal">
                  {STAGE_LABELS[p.latestStage]}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
