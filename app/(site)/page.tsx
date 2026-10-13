import { defaultOgImage } from "@/lib/og";
import type { Metadata } from "next";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { Suspense } from "react";
import { connection } from "next/server";
import InjuryTracker from "@/components/InjuryTracker";
import { datasetJsonLd } from "@/lib/structured-data";
import { formatDate } from "@/lib/format";
import { trackerFaq } from "@/lib/summaries";
import { computeStats, getTrackerRows, weeklySeries, type TrackerRow } from "@/lib/tracker";
import StatStrip, { type StatItem } from "@/components/StatStrip";

const siteUrl = "https://rupturereport.com";
const title = "NFL ACL & Achilles Injuries 2026 | Injury Tracker";
const description =
  "Every NFL ACL and Achilles injury of 2026: torn ACL and Achilles list with dates, teams, turf vs grass, mechanism, and recovery status for each player.";

export const metadata: Metadata = {
  title: { absolute: `${title} | Rupture Report` },
  description,
  alternates: { canonical: "/" },
  keywords: [
    "NFL ACL injuries 2026",
    "NFL Achilles injuries 2026",
    "torn ACL NFL",
    "torn Achilles NFL",
    "NFL injury tracker",
    "turf vs grass injuries",
  ],
  openGraph: { type: "website", url: "/", title, description, images: [defaultOgImage], siteName: "Rupture Report" },
  twitter: { card: "summary_large_image", title, description, images: [defaultOgImage.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Rupture Report",
      url: siteUrl,
      email: "contact@rupturereport.com",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@rupturereport.com",
        url: `${siteUrl}/contact`,
      },
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/brand/logo-square-1024.png`,
        width: 1024,
        height: 1024,
      },
    },
    {
      "@type": "WebSite",
      publisher: { "@id": `${siteUrl}/#organization` },
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Rupture Report",
      description,
      inLanguage: "en-US",
    },
  ],
};

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal">2026 NFL Season</p>
          <ShareButton
            url={siteUrl}
            title="NFL ACL & Achilles Injury Tracker 2026 | Rupture Report"
            text="Every torn ACL and Achilles of the 2026 NFL season, with surface, game context and recovery status."
          />
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
          NFL ACL &amp; Achilles Injury Tracker
        </h1>
        <p className="mt-2 text-muted">
          Every torn ACL and Achilles of 2026, with surface, game context and recovery status.{" "}
          <Link href="/players" className="text-teal hover:underline">All players →</Link>
        </p>
      </header>
      <Suspense fallback={<TrackerSkeleton />}>
        <TrackerData />
      </Suspense>
    </main>
  );
}

async function TrackerData() {
  await connection();
  let rows: TrackerRow[] = [];
  let failed = false;
  try {
    rows = await getTrackerRows();
  } catch {
    failed = true;
  }
  if (failed) {
    return (
      <p className="mt-8 rounded-xl border border-border bg-surface p-6 text-muted">
        Injury data is temporarily unavailable. Please check back shortly.
      </p>
    );
  }
  const s = computeStats(rows);
  const lastModified = rows.reduce<string | null>((m, r) => (r.lastModified && (!m || r.lastModified > m) ? r.lastModified : m), null);
  const dataset = datasetJsonLd({
      id: `${siteUrl}/#dataset`,
      name: "NFL ACL & Achilles Injuries 2026",
      description:
        "Tracked torn ACL and Achilles injuries across the 2026 NFL offseason, preseason and regular season, including injury date, team, position, game context, playing surface, mechanism and recovery stage.",
      url: siteUrl,
      league: "NFL",
      season: "2026",
      dateModified: lastModified ?? undefined,
      keywords: [
        "NFL ACL injuries 2026",
        "NFL Achilles injuries 2026",
        "torn ACL",
        "torn Achilles",
        "artificial turf",
        "natural grass",
        "injury recovery",
      ],
    });
  const faq = trackerFaq(rows, "NFL", "2026");
  const teams = new Set(rows.map((r) => r.team).filter(Boolean)).size;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const wk = weeklySeries(rows);
  const span = wk ? `per week since ${formatDate(wk.start)}` : "";
  const stats: StatItem[] = [
    { label: "Tracked tears", value: String(s.total), num: s.total, spark: wk ? { data: wk.total, color: "#E6EDF3", title: `All tears ${span}` } : undefined },
    { label: "ACL", value: String(s.acl), num: s.acl, tone: "text-teal", spark: wk ? { data: wk.acl, color: "#14B8A6", title: `ACL tears ${span}` } : undefined },
    { label: "Achilles", value: String(s.achilles), num: s.achilles, tone: "text-amber", spark: wk ? { data: wk.achilles, color: "#F59E0B", title: `Achilles tears ${span}` } : undefined },
    {
      label: "Artificial turf",
      value: s.artificialPct == null ? "—" : `${s.artificialPct}%`,
      num: s.artificialPct ?? undefined,
      suffix: "%",
      sub: s.games ? `of ${s.games} game injur${s.games === 1 ? "y" : "ies"} · ${s.naturalPct}% grass/hybrid` : "no game injuries yet",
    },
    {
      label: "Non-contact",
      value: s.nonContactPct == null ? "—" : `${s.nonContactPct}%`,
      num: s.nonContactPct ?? undefined,
      suffix: "%",
      sub: s.mechanismKnown ? `where known (n=${s.mechanismKnown})` : "mechanism unknown",
    },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", ...dataset }).replace(/</g, "\\u003c"),
        }}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }}
        />
      )}
      <p className="mt-4 max-w-3xl text-sm text-muted" data-summary>
        Rupture Report tracks {s.total} torn ACL and Achilles injuries in
        the 2026 NFL season: {s.acl} ACL and {s.achilles} Achilles tears across {teams} teams.
        {lastModified && (
          <>
            {" "}Last updated <time dateTime={lastModified}>{formatDate(lastModified)}</time>.
          </>
        )}
      </p>
      <StatStrip stats={stats} />
      <InjuryTracker rows={rows} />
      {faq.length > 0 && (
        <section aria-labelledby="faq-heading" className="mt-14">
          <h2 id="faq-heading" className="text-xl font-bold sm:text-2xl">Frequently asked questions</h2>
          <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {faq.map((f) => (
              <div key={f.q} className="p-4 sm:p-5">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1.5 text-sm text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}

function TrackerSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading injury data" className="animate-pulse">
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="mt-8 h-10 rounded-lg bg-surface" />
      <div className="mt-4 h-96 rounded-xl bg-surface" />
    </div>
  );
}
