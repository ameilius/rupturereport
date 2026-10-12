import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteUrl = "https://rupturereport.com";
const siteName = "Rupture Report";
const siteDescription =
  "Tracking NFL ACL and Achilles injuries: recovery timelines, turf type, stadium, and return-to-play data for every player.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | NFL ACL & Achilles Injury Tracker`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} | NFL ACL & Achilles Injury Tracker`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | NFL ACL & Achilles Injury Tracker`,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-text`}>{children}</body>
    </html>
  );
}