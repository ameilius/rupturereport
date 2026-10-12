import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listTeamsFull } from "@/lib/admin-db";
import { isCustomUpload } from "@/lib/images";
import { Flash, Loading, PageTitle, linkCls, type SP } from "@/components/admin/ui";

export default function TeamsAdmin({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle>Teams</PageTitle>
      <Suspense fallback={<Loading />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: { searchParams: SP }) {
  await connection();
  await requireAdmin();
  const [teams, sp] = await Promise.all([listTeamsFull(), searchParams]);
  return (
    <>
      <Flash searchParams={sp} />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="p-3">Team</th><th className="p-3">Division</th><th className="p-3">Logo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams.map((t) => {
              const path = (t.logo_path as string | null) ?? null;
              return (
                <tr key={String(t.id)}>
                  <td className="p-3">
                    <Link href={`/admin/teams/${t.id}`} className={linkCls}>{String(t.name)}</Link>{" "}
                    <span className="text-muted">({String(t.abbreviation)})</span>
                  </td>
                  <td className="p-3">{String(t.conference)} {String(t.division)}</td>
                  <td className="p-3 text-muted">{isCustomUpload(path) ? "Custom" : path ? "Official" : "Badge"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
