"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Lightly obfuscated mailto: the href is only assembled in the browser, so server HTML has no mailto link. */
export function EmailLink({ user, domain, className }: { user: string; domain: string; className?: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return (
    <a href={hydrated ? `mailto:${user}@${domain}` : "#contact-email"} id="contact-email" className={className}>
      {user}
      <span>@</span>
      {domain}
    </a>
  );
}
