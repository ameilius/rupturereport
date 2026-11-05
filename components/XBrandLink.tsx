import { X_PROFILE_URL } from "@/lib/structured-data";

/** Current X mark. Square viewBox; the path is the 2023 logo, not the legacy bird. */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Link to the Rupture Report account on X. Handle stays visible; the footer column has room at phone width. */
export default function XBrandLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={X_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Rupture Report on X"
      className={`inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${className}`}
    >
      <XMark className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">@rupturereports</span>
    </a>
  );
}
