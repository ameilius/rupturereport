import type { Metadata } from "next";
import Link from "next/link";
import { EmailLink } from "@/components/EmailLink";
import { defaultOgImage } from "@/lib/og";

const siteUrl = "https://rupturereport.com";
const title = "Contact";
const description =
  "Contact Rupture Report: send corrections, tips on NFL ACL and Achilles injuries, or data and media inquiries to contact@rupturereport.com.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: { type: "website", url: "/contact", title: "Contact Rupture Report", description, images: [defaultOgImage] },
  twitter: { card: "summary_large_image", title: "Contact Rupture Report", description, images: [defaultOgImage.url] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${siteUrl}/contact#page`,
  url: `${siteUrl}/contact`,
  name: "Contact Rupture Report",
  description,
  about: {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Rupture Report",
    url: siteUrl,
    email: "contact@rupturereport.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contact@rupturereport.com",
      availableLanguage: "English",
    },
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-teal">Home</Link>
      </nav>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">Contact</h1>
      <p className="mt-4 text-lg text-muted">
        Rupture Report tracks every NFL ACL and Achilles tear of the 2026 season. We&apos;d like to hear from you if you have:
      </p>
      <ul className="mt-6 space-y-3">
        <li className="rounded-xl border border-border bg-surface p-4">
          <p className="font-semibold">Corrections</p>
          <p className="text-sm text-muted">A wrong date, team, surface, mechanism or recovery stage. Please include a source link (team release, beat reporter, injury report).</p>
        </li>
        <li className="rounded-xl border border-border bg-surface p-4">
          <p className="font-semibold">Injury tips</p>
          <p className="text-sm text-muted">An ACL or Achilles injury we haven&apos;t tracked yet, or a recovery update.</p>
        </li>
        <li className="rounded-xl border border-border bg-surface p-4">
          <p className="font-semibold">Data &amp; media inquiries</p>
          <p className="text-sm text-muted">Questions about the dataset, citations, or press.</p>
        </li>
      </ul>
      <div className="mt-8 rounded-xl border border-teal/40 bg-teal/10 p-5">
        <p className="text-sm uppercase tracking-wider text-muted">Email</p>
        <EmailLink user="contact" domain="rupturereport.com" className="mt-1 inline-block text-xl font-semibold text-teal hover:underline sm:text-2xl" />
        <p className="mt-2 text-sm text-muted">Corrections are reviewed against the source you link; we update the tracker when it checks out.</p>
      </div>
    </main>
  );
}
