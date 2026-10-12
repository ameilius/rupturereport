import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Rupture Report home" className="flex items-center">
          <Image
            src="/brand/logo-horizontal-white-64.png"
            alt="Rupture Report"
            width={427}
            height={64}
            priority
            className="hidden h-6 w-auto sm:block"
          />
          <Image
            src="/brand/icon-white-64.png"
            alt="Rupture Report"
            width={64}
            height={64}
            priority
            className="h-7 w-auto sm:hidden"
          />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm">
          <Link href="/" className="text-muted hover:text-text">Tracker</Link>
          <Link href="/players" className="text-muted hover:text-text">Players</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Rupture Report home">
          <Image src="/brand/icon-white-64.png" alt="" width={64} height={64} className="h-6 w-auto" />
          <span>Rupture Report · NFL ACL &amp; Achilles Injury Tracker</span>
        </Link>
        <p>© {2026} Rupture Report. Data from public team and league reports.</p>
      </div>
    </footer>
  );
}
