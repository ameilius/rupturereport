import { breadcrumbJsonLd } from "@/lib/structured-data";
import { defaultOgImage } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import { PlayerAvatar, TeamLogo } from "@/components/TeamImages";
import { connection } from "next/server";
import { Suspense } from "react";
import { bioLine, formatDate } from "@/lib/format";
import InjuryBodyIcon from "@/components/InjuryBodyIcon";
import { MiniStageBar } from "@/components/RecoveryProgress";
import { contrast, teamColors } from "@/lib/images";
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
      <header className="hero relative isolate pb-2">
        <div aria-hidden="true" className="hero-bg pointer-events-none absolute -inset-x-6 -top-10 -z-10 h-[160%]" />
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
          <span aria-hidden="true" className="live-dot live-dot--static" />
          <Link href="/" className="text-teal hover:text-text">Home</Link>
          <span aria-hidden="true" className="text-muted">/</span>
          <span className="text-muted">Players</span>
        </nav>
        <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          Tracked <span className="bg-gradient-to-r from-teal to-rupture bg-clip-text text-transparent">players</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{description}</p>
      </header>
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
    <ul className="mt-8 grid gap-3">
      {players.map((p) => {
        const [primary, secondary] = teamColors(p.teamAbbreviation);
        const accent = contrast(primary, "#121821") >= contrast(secondary, "#121821") ? primary : secondary;
        const isAch = p.injuryType === "Achilles";
        const bio = bioLine(p);
        const stageLabel = p.latestStage ? STAGE_LABELS[p.latestStage] : "Awaiting update";
        return (
          <li key={p.slug}>
            <Link
              href={`/players/${p.slug}`}
              style={{ borderLeftColor: accent }}
              className="player-card group flex flex-col gap-4 rounded-xl border border-l-4 border-border bg-surface/90 p-4 shadow-sm shadow-black/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="shrink-0 rounded-full p-0.5" style={{ background: `linear-gradient(135deg, ${accent}, ${secondary === accent ? primary : secondary})` }}>
                  <span className="block rounded-full bg-bg p-0.5">
                    <PlayerAvatar name={p.fullName} team={p.teamAbbreviation} headshotPath={p.headshotPath} size={52} />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold group-hover:text-teal">{p.fullName}</span>
                  <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
                    <TeamLogo abbr={p.teamAbbreviation} name={p.teamName} logoPath={p.teamLogo} size={18} />
                    <span className="truncate">{[p.position, p.teamName].filter(Boolean).join(" · ")}</span>
                  </span>
                  {bio && <span className="mt-0.5 block text-xs text-muted/80">{bio}</span>}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:shrink-0 sm:justify-end">
                <span className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 font-semibold ${isAch ? "bg-amber/15 text-amber" : "bg-teal/15 text-teal"}`}>
                  <InjuryBodyIcon type={p.injuryType} side={p.bodySide} size={20} decorative />
                  {formatInjuryType(p.injuryType)}
                </span>
                {p.injuryDate && (
                  <time dateTime={p.injuryDate.slice(0, 10)} className="text-muted">{formatDate(p.injuryDate)}</time>
                )}
                <MiniStageBar stage={p.latestStage} label={stageLabel} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
