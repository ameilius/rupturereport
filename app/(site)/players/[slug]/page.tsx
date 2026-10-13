import type { Metadata } from "next";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PlayerAvatar, TeamLogo } from "@/components/TeamImages";
import { formatDate, humanize } from "@/lib/format";
import {
  STAGE_LABELS,
  STAGE_ORDER,
  formatInjuryType,
  getPlayerBySlug,
  type Injury,
  type PlayerDetail,
} from "@/lib/players";
import { localImage } from "@/lib/images";
import { organizationRef } from "@/lib/structured-data";
import { conditionAnatomy, conditionName, injurySentence, playerInjuryFacts } from "@/lib/summaries";

const siteUrl = "https://rupturereport.com";

type Props = { params: Promise<{ slug: string }> };

async function loadPlayer(slug: string): Promise<PlayerDetail | null> {
  await connection();
  return getPlayerBySlug(slug);
}

function describe(d: PlayerDetail): { title: string; description: string } {
  const { player, injuries } = d;
  const injury = injuries[0];
  const type = injury ? formatInjuryType(injury.injuryType) : "Injury";
  const title = `${player.fullName} ${type} Injury & Recovery Tracker`;
  const teamBit = player.team ? ` (${player.team.name})` : "";
  const latest = injury?.updates.at(-1);
  const stageBit = latest
    ? ` Current stage: ${STAGE_LABELS[latest.stage]}.`
    : "";
  const dateBit = injury?.injuryDate
    ? ` suffered on ${formatDate(injury.injuryDate)}`
    : "";
  const description = `${player.fullName}${teamBit} ${type} injury${dateBit}: recovery timeline, surgery, return-to-play updates, stadium and turf details.${stageBit}`;
  return { title, description };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/players/${slug}`;
  let data: PlayerDetail | null = null;
  try {
    data = await loadPlayer(slug);
  } catch {
    data = null;
  }
  if (!data) {
    return { title: "Player not found", robots: { index: false } };
  }
  const { title, description } = describe(data);
  return {
    title: { absolute: `${title} | Rupture Report` },
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      siteName: "Rupture Report",
      firstName: data.player.firstName,
      lastName: data.player.lastName,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PlayerPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-teal">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/players" className="hover:text-teal">
              Players
            </Link>
          </li>
        </ol>
      </nav>
      <Suspense fallback={<PlayerSkeleton />}>
        <PlayerContent params={params} />
      </Suspense>
    </main>
  );
}

function PlayerSkeleton() {
  return (
    <div className="mt-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-2/3 rounded bg-surface" />
      <div className="mt-4 h-5 w-1/3 rounded bg-surface" />
      <div className="mt-10 h-64 rounded-xl bg-surface" />
    </div>
  );
}

async function PlayerContent({ params }: Props) {
  const { slug } = await params;
  const data = await loadPlayer(slug);
  if (!data) notFound();
  const { player, injuries, lastModified } = data;
  const { title, description } = describe(data);
  const url = `${siteUrl}/players/${player.slug}`;
  const shareType = injuries[0] ? formatInjuryType(injuries[0].injuryType) : "Injury";
  const summaries = injuries.map((i) => injurySentence(playerInjuryFacts(player, i)));
  const headshot = localImage(player.headshotPath);
  const personImage = headshot ? `${siteUrl}${headshot}` : null;
  const ogImage = `${url}/opengraph-image`;
  const published = player.createdAt ?? null;
  const conditions = injuries.map((i) => {
    const anatomy = conditionAnatomy(i.injuryType);
    return {
      "@type": "MedicalCondition",
      "@id": `${url}#injury-${i.id}`,
      name: conditionName(i.injuryType),
      ...(anatomy ? { associatedAnatomy: { "@type": "AnatomicalStructure", name: anatomy } } : {}),
      description: injurySentence(playerInjuryFacts(player, i)),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { "@type": "WebSite", name: "Rupture Report", url: siteUrl },
        about: [{ "@id": `${url}#person` }, ...conditions.map((c) => ({ "@id": c["@id"] }))],
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: { "@type": "ImageObject", url: ogImage },
        ...(published ? { datePublished: published } : {}),
        ...(lastModified ? { dateModified: lastModified } : {}),
      },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title.slice(0, 110),
        description,
        url,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        image: [ogImage, ...(personImage ? [personImage] : [])],
        ...(published ? { datePublished: published } : {}),
        ...(lastModified ? { dateModified: lastModified } : {}),
        author: organizationRef,
        publisher: organizationRef,
        about: [{ "@id": `${url}#person` }, ...conditions.map((c) => ({ "@id": c["@id"] }))],
        ...(summaries[0] ? { abstract: summaries[0] } : {}),
        inLanguage: "en-US",
      },
      ...conditions,
      {
        "@type": "Person",
        "@id": `${url}#person`,
        name: player.fullName,
        givenName: player.firstName,
        familyName: player.lastName,
        url,
        ...(personImage ? { image: personImage } : {}),
        ...(player.position ? { jobTitle: `NFL ${player.position}` } : {}),
        ...(player.dob ? { birthDate: player.dob.slice(0, 10) } : {}),
        ...(player.team
          ? {
              memberOf: {
                "@type": "SportsTeam",
                name: player.team.name,
                sport: "American football",
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Players",
            item: `${siteUrl}/players`,
          },
          { "@type": "ListItem", position: 3, name: player.fullName, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mt-6 flex items-center gap-5 sm:gap-7">
        <PlayerAvatar
          name={player.fullName}
          team={player.team?.abbreviation ?? null}
          headshotPath={player.headshotPath}
          size={112}
          priority
        />
        <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          {player.fullName}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-lg text-muted">
          {player.team && (
            <TeamLogo
              abbr={player.team.abbreviation}
              name={player.team.name}
              logoPath={player.team.logoPath}
              size={28}
            />
          )}
          {[player.position, player.team?.name].filter(Boolean).join(" · ") ||
            "NFL"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {lastModified && (
            <p className="text-sm text-muted">
              Last updated{" "}
              <time dateTime={lastModified}>{formatDate(lastModified)}</time>
            </p>
          )}
          <ShareButton
            url={url}
            title={`${player.fullName} ${shareType} Recovery Tracker | Rupture Report`}
            text={`${player.fullName}${player.team ? ` (${player.team.name})` : ""} — ${shareType} recovery tracker | Rupture Report`}
          />
        </div>
        </div>
      </header>
      {summaries.length > 0 && (
        <div className="mt-6 space-y-2 text-base leading-relaxed text-text" data-summary>
          {summaries.map((t, idx) => (
            <p key={idx}>{t}</p>
          ))}
        </div>
      )}

      {injuries.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border bg-surface p-6 text-muted">
          No injuries recorded for this player yet.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {injuries.map((injury) => (
            <InjuryCard key={injury.id} injury={injury} />
          ))}
        </div>
      )}
    </>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function InjuryCard({ injury }: { injury: Injury }) {
  const type = formatInjuryType(injury.injuryType);
  const stadium = injury.stadium;
  const surface = stadium
    ? [humanize(stadium.surfaceType), stadium.surfaceBrand]
        .filter(Boolean)
        .join(" · ")
    : null;
  const location = stadium
    ? [stadium.name, [stadium.city, stadium.state].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" — ")
    : null;

  return (
    <article
      aria-labelledby={`injury-${injury.id}`}
      className="rounded-2xl border border-border bg-surface p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-amber/15 px-3 py-1 text-sm font-semibold text-amber">
          {type}
        </span>
        <h2 id={`injury-${injury.id}`} className="text-xl font-semibold">
          {type} injury
          {injury.injuryDate && (
            <>
              {" "}
              ·{" "}
              <time dateTime={injury.injuryDate.slice(0, 10)}>
                {formatDate(injury.injuryDate)}
              </time>
            </>
          )}
        </h2>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Fact
          label="Season / week"
          value={
            injury.season || injury.week
              ? [injury.season, injury.week ? `Week ${injury.week}` : null]
                  .filter(Boolean)
                  .join(" · ")
              : null
          }
        />
        <Fact label="Phase" value={humanize(injury.phase)} />
        <Fact
          label="Opponent"
          value={
            injury.opponent
              ? `${injury.homeAway === "away" ? "@ " : injury.homeAway === "home" ? "vs " : ""}${injury.opponent.name}`
              : null
          }
        />
        <Fact label="Stadium" value={location} />
        <Fact label="Surface" value={surface} />
        <Fact label="Mechanism" value={humanize(injury.mechanism)} />
        <Fact label="Side" value={humanize(injury.bodySide)} />
        <Fact
          label="Source"
          value={
            injury.source ? (
              /^https?:\/\//.test(injury.source) ? (
                <a
                  href={injury.source}
                  rel="noopener nofollow"
                  target="_blank"
                  className="break-all text-teal underline underline-offset-2 hover:no-underline"
                >
                  {new URL(injury.source).hostname.replace(/^www\./, "")}
                </a>
              ) : (
                injury.source
              )
            ) : null
          }
        />
      </dl>

      {injury.severityNotes && (
        <p className="mt-6 text-muted">{injury.severityNotes}</p>
      )}

      <RecoveryTimeline injury={injury} />
    </article>
  );
}

function RecoveryTimeline({ injury }: { injury: Injury }) {
  const updates = injury.updates;
  const latest = updates.at(-1);
  const reached = new Set(updates.map((u) => u.stage));
  const latestIdx = latest
    ? STAGE_ORDER.indexOf(latest.stage as (typeof STAGE_ORDER)[number])
    : -1;
  const maxIdx = Math.max(
    latestIdx,
    ...STAGE_ORDER.map((s, i) => (reached.has(s) ? i : -1)),
  );
  const pct =
    maxIdx < 0 ? 0 : Math.round(((maxIdx + 1) / STAGE_ORDER.length) * 100);
  const reinjured = latest?.stage === "reinjured";

  return (
    <section className="mt-8" aria-labelledby={`timeline-${injury.id}`}>
      <h3 id={`timeline-${injury.id}`} className="text-lg font-semibold">
        Recovery timeline
      </h3>
      <p className="mt-1 text-sm text-muted">
        Current stage:{" "}
        <strong className={reinjured ? "text-amber" : "text-teal"}>
          {latest ? STAGE_LABELS[latest.stage] : "Awaiting update"}
        </strong>
      </p>

      <div
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Recovery progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={latest ? STAGE_LABELS[latest.stage] : "Not started"}
      >
        <div
          className={`h-full rounded-full ${reinjured ? "bg-amber" : "bg-teal"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-4 lg:grid-cols-6">
        {STAGE_ORDER.map((s, i) => (
          <li
            key={s}
            className={i <= maxIdx ? "text-text" : "text-muted/60"}
            aria-current={latest?.stage === s ? "step" : undefined}
          >
            <span aria-hidden="true">{i <= maxIdx ? "● " : "○ "}</span>
            {STAGE_LABELS[s]}
          </li>
        ))}
      </ol>

      {updates.length > 0 ? (
        <ol className="mt-8 space-y-6 border-l border-border pl-6">
          {[...updates].reverse().map((u) => (
            <li key={u.id} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full ${u.stage === "reinjured" ? "bg-amber" : "bg-teal"}`}
              />
              <p className="text-sm text-muted">
                {u.updateDate && (
                  <time dateTime={u.updateDate.slice(0, 10)}>
                    {formatDate(u.updateDate)}
                  </time>
                )}{" "}
                · {STAGE_LABELS[u.stage]}
              </p>
              {u.statusLabel && (
                <p className="mt-1 font-medium">{u.statusLabel}</p>
              )}
              {u.notes && <p className="mt-1 text-muted">{u.notes}</p>}
              {u.source && /^https?:\/\//.test(u.source) && (
                <a
                  href={u.source}
                  rel="noopener nofollow"
                  target="_blank"
                  className="mt-1 inline-block text-sm text-teal underline underline-offset-2 hover:no-underline"
                >
                  Source
                </a>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 text-sm text-muted">No progress updates yet.</p>
      )}
    </section>
  );
}
