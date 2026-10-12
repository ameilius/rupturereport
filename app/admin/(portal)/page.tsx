import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCounts, recentInjuries, recentUpdates } from "@/lib/admin-db";
import { Card, Loading, PageTitle, btnCls, fmtDate, linkCls } from "@/components/admin/ui";

export default function Dashboard() {
  return (
    <>
      <PageTitle actions={<Link href="/admin/players/new" className={btnCls}>+ New player</Link>}>
        Dashboard
      </PageTitle>
      <Suspense fallback={<Loading />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  await connection();
  await requireAdmin();
  const [counts, injuries, updates] = await Promise.all([
    getCounts(),
    recentInjuries(),
    recentUpdates(),
  ]);
  const stats = [
    ["Players", counts.players],
    ["Injuries", counts.injuries],
    ["Updates", counts.updates],
    ["Stadiums", counts.stadiums],
    ["Teams", counts.teams],
  ] as const;
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-bold">{String(n)}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent injuries">
          {injuries.length === 0 ? (
            <p className="text-muted">None yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {injuries.map((i) => (
                <li key={String(i.id)} className="flex justify-between gap-3 py-2">
                  <Link href={`/admin/injuries/${i.id}`} className={linkCls}>
                    {String(i.first_name)} {String(i.last_name)} — {String(i.injury_type)}
                  </Link>
                  <span className="text-sm text-muted">{fmtDate(i.injury_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent progress updates">
          {updates.length === 0 ? (
            <p className="text-muted">None yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {updates.map((u) => (
                <li key={String(u.id)} className="flex justify-between gap-3 py-2">
                  <Link href={`/admin/injuries/${u.injury_id}`} className={linkCls}>
                    {String(u.first_name)} {String(u.last_name)} —{" "}
                    {String(u.stage).replace(/_/g, " ")}
                  </Link>
                  <span className="text-sm text-muted">{fmtDate(u.update_date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
