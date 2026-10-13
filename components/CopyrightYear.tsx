"use client";

import { useSyncExternalStore } from "react";

// Server HTML uses the build year (the site redeploys often); the browser shows the live year.
const BUILD_YEAR = new Date().getFullYear();
const subscribe = () => () => {};

export default function CopyrightYear() {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => BUILD_YEAR);
  return <>{year}</>;
}
