import Reveal from "@/components/Reveal";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteUrl = "https://rupturereport.com";
const siteName = "Rupture Report";
const siteDescription =
  "Tracking every NFL ACL and Achilles tear, season by season: recovery timelines, playing surface, stadium and return-to-play data for every player.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | NFL ACL & Achilles Tear Tracker`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} | NFL ACL & Achilles Tear Tracker`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | NFL ACL & Achilles Tear Tracker`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg text-text`}>
        {/* Before paint: enable scroll-in chart animations (skipped for reduced motion; undone if JS never hydrates). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('rr-js');setTimeout(function(){if(!d.dataset.rrReveal)d.classList.remove('rr-js')},4000)})()",
          }}
        />
        {children}
        <Reveal />
      </body>
    </html>
  );
}