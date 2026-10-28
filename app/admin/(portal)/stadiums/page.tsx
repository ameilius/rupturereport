import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listStadiums } from "@/lib/admin-db";
import { Flash, LeagueBadge, LeagueTabs, Loading, PageTitle, btnCls, linkCls, pickLeague, type SP } from "@/components/admin/ui";

export default function StadiumsAdmin({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle actions={<Link href="/admin/stadiums/new" className={btnCls}>+ New stadium / arena</Link>}>
        Stadiums &amp; arenas
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
  const league = pickLeague(sp);
  const stadiums = await listStadiums(league);
  return (
    <>
      <Flash searchParams={sp} />
      <LeagueTabs basePath="/admin/stadiums" current={league} />
      {stadiums.length === 0 ? (
        <p className="text-muted">No stadiums yet. Import db/seed_stadiums.sql or add one.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="p-3">Name</th><th className="p-3">League</th><th className="p-3">Location</th>
                <th className="p-3">Surface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stadiums.map((s) => (
                <tr key={String(s.id)}>
                  <td className="p-3">
                    <Link href={`/admin/stadiums/${s.id}`} className={linkCls}>{String(s.name)}</Link>
                  </td>
                  <td className="p-3"><LeagueBadge league={s.league} /></td>
                  <td className="p-3">{[s.city, s.state].filter(Boolean).join(", ")}</td>
                  <td className="p-3">{[s.surface_type, s.surface_brand].filter(Boolean).join(" · ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
