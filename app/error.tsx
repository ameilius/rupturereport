"use client";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { ErrorView } from "@/components/errors/ErrorView";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <SiteHeader />
      <ErrorView {...props} />
      <SiteFooter />
    </>
  );
}
