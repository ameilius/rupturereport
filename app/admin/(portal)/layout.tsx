import Link from "next/link";
import { logoutAction } from "../actions";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/stadiums", label: "Stadiums" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin" className="font-bold text-teal">
            RR Admin
          </Link>
          <nav aria-label="Admin" className="flex flex-wrap gap-4 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-muted hover:text-text">
                {n.label}
              </Link>
            ))}
            <Link href="/players" className="text-muted hover:text-text">
              View site ↗
            </Link>
          </nav>
          <form action={logoutAction} className="ml-auto">
            <button type="submit" className="text-sm text-muted hover:text-amber">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
