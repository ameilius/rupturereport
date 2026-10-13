import type { Metadata } from "next";
import Link from "next/link";
import { defaultOgImage } from "@/lib/og";
import { DATA_LICENSE_URL, SITE_NAME, SITE_URL, organizationRef, breadcrumbJsonLd } from "@/lib/structured-data";

const title = "Terms & Data License";
const description =
  "Rupture Report injury data is licensed under CC BY 4.0: reuse it freely with attribution to Rupture Report.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: { type: "website", url: "/terms", title: `${title} | ${SITE_NAME}`, description, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: [defaultOgImage.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms#page`,
  url: `${SITE_URL}/terms`,
  name: `${title} | ${SITE_NAME}`,
  description,
  publisher: organizationRef,
  license: DATA_LICENSE_URL,
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([["Home", "/"], ["Terms & data license", "/terms"]])).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-teal">Home</Link>
      </nav>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">Terms &amp; data license</h1>

      <section className="mt-8 space-y-4 text-muted">
        <h2 className="text-xl font-semibold text-text">Data license: CC BY 4.0</h2>
        <p>
          The injury data published on {SITE_NAME} (injury lists, dates, teams, game context, playing surface, mechanism
          and recovery stages) is licensed under the{" "}
          <a href={DATA_LICENSE_URL} className="text-teal hover:underline" rel="license noopener" target="_blank">
            Creative Commons Attribution 4.0 International License (CC BY 4.0)
          </a>
          .
        </p>
        <p>You may copy, share, adapt and build on the data, including commercially, as long as you give attribution:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Credit &ldquo;{SITE_NAME}&rdquo; and link to <a href={SITE_URL} className="text-teal hover:underline">rupturereport.com</a> (or the specific page you used).</li>
          <li>Indicate if you changed the data.</li>
          <li>Don&apos;t imply that {SITE_NAME} endorses you or your use.</li>
        </ul>
        <p className="rounded-lg border border-border bg-surface p-4 text-sm">
          Example attribution: <span className="text-text">&ldquo;Source: Rupture Report (rupturereport.com), CC BY 4.0&rdquo;</span>
        </p>
      </section>

      <section className="mt-10 space-y-4 text-muted">
        <h2 className="text-xl font-semibold text-text">What the license does not cover</h2>
        <p>
          Team logos, player photos, league marks and the {SITE_NAME} name and logo are not covered by CC BY 4.0. Team
          logos and player images are © their respective owners. Linked news articles belong to their publishers.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-muted">
        <h2 className="text-xl font-semibold text-text">Accuracy</h2>
        <p>
          Data is compiled from public team, league and media reports and is provided as-is, without warranty. It is not
          medical advice. Spotted an error? Please <Link href="/contact" className="text-teal hover:underline">send a correction</Link> with a source link.
        </p>
      </section>
    </main>
  );
}
