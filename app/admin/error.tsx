"use client";

import { ErrorView } from "@/components/errors/ErrorView";

export default function AdminError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorView
      {...props}
      headline="Admin hit an injury timeout"
      subline="That admin action or page failed. Nothing was changed unless you saw a success message. Try again, or head back to the dashboard."
      homeHref="/admin"
      homeLabel="Back to admin"
    />
  );
}
