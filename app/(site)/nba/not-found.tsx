import type { Metadata } from "next";
import { NOT_FOUND_HEADLINE, NotFoundView } from "@/components/errors/NotFoundView";

export const metadata: Metadata = {
  title: `404: ${NOT_FOUND_HEADLINE}`,
  robots: { index: false, follow: true },
};

export default function NbaNotFound() {
  return <NotFoundView league="NBA" />;
}
