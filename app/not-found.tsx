import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { NOT_FOUND_HEADLINE, NotFoundView } from "@/components/errors/NotFoundView";

export const metadata: Metadata = {
  title: `404: ${NOT_FOUND_HEADLINE}`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<SiteHeader />}>
        <LeagueHeader />
      </Suspense>
      <NotFoundView />
      <SiteFooter />
    </>
  );
}

// The proxy tags NBA 404s with x-rr-league, so the switcher/nav highlight the right league.
async function LeagueHeader() {
  await connection();
  return <SiteHeader league={(await headers()).get("x-rr-league") === "NBA" ? "NBA" : "NFL"} />;
}
