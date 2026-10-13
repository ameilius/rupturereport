import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
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
          <Link href="/contact" className="text-muted hover:text-text">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1.5fr] md:gap-12">
          <div className="max-w-xs">
            <Link href="/" aria-label="Rupture Report home" className="inline-flex items-center gap-3">
              <Image src="/brand/icon-white-64.png" alt="" width={64} height={64} className="h-8 w-auto" />
              <span className="font-semibold tracking-wide text-text">Rupture Report</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Tracking every NFL ACL and Achilles tear of the 2026 season, from injury to return.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Site</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/" className="text-text hover:text-teal">Tracker</Link></li>
              <li><Link href="/players" className="text-text hover:text-teal">Players</Link></li>
              <li><Link href="/contact" className="text-text hover:text-teal">Contact</Link></li>
              <li><Link href="/terms" className="text-text hover:text-teal">Terms &amp; data license</Link></li>
            </ul>
          </nav>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Get in touch</p>
            <p className="mt-4 text-sm">
              <Link href="/contact" className="text-teal hover:underline">contact<span>@</span>rupturereport.com</Link>
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Team logos and player images © their respective owners.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rupture Report</p>
          <p>Data from public team and league reports.</p>
        </div>
      </div>
    </footer>
  );
}
