import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTeam } from "@/lib/admin-db";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card, Flash, Loading, linkCls, type SP } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }>; searchParams: SP };

export default function EditTeam(props: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params, searchParams }: Props) {
  await connection();
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [team, sp] = await Promise.all([getTeam(id), searchParams]);
  if (!team) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {String(team.name)} <span className="text-muted">({String(team.abbreviation)})</span>
        </h1>
        <Link href="/admin/teams" className={linkCls}>← All teams</Link>
      </div>
      <Flash searchParams={sp} />
      <Card title="Team logo">
        <ImageUpload
          kind="teams"
          id={id}
          slug={String(team.slug)}
          path={(team.logo_path as string | null) ?? null}
          label={String(team.name)}
        />
      </Card>
    </div>
  );
}
