import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { searchPlayers } from "@/lib/admin-db";
import { Flash, Loading, PageTitle, btnCls, inputCls, linkCls, type SP } from "@/components/admin/ui";

export default function PlayersAdmin({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle actions={<Link href="/admin/players/new" className={btnCls}>+ New player</Link>}>
        Players
      </PageTitle>
      <Suspense fallback={<Loading />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: { searchParams: SP }) {
  await connection();
  await requireAdmin();
  const sp = await searchParams;
  const term = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const players = await searchPlayers(term);
  return (
    <>
      <Flash searchParams={sp} />
      <form role="search" className="mb-6 flex gap-2">
        <label htmlFor="q" className="sr-only">Search players</label>
        <input id="q" name="q" defaultValue={term} placeholder="Search by name…" className={`${inputCls} mt-0`} />
        <button className={btnCls}>Search</button>
      </form>
      {players.length === 0 ? (
        <p className="text-muted">No players found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="p-3">Name</th><th className="p-3">Pos</th>
                <th className="p-3">Team</th><th className="p-3">Injuries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {players.map((p) => (
                <tr key={String(p.id)}>
                  <td className="p-3">
                    <Link href={`/admin/players/${p.id}`} className={linkCls}>
                      {String(p.first_name)} {String(p.last_name)}
                    </Link>
                  </td>
                  <td className="p-3">{String(p.position ?? "")}</td>
                  <td className="p-3">{String(p.team ?? "")}</td>
                  <td className="p-3">{String(p.injury_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
