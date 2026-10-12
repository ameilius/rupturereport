import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listTeams } from "@/lib/admin-db";
import { PlayerForm } from "@/components/admin/forms";
import { Card, Flash, Loading, PageTitle, type SP } from "@/components/admin/ui";

export default function NewPlayer({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle>New player</PageTitle>
      <Suspense fallback={<Loading />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Content({ searchParams }: { searchParams: SP }) {
  await connection();
  await requireAdmin();
  const [teams, sp] = await Promise.all([listTeams(), searchParams]);
  return (
    <Card>
      <Flash searchParams={sp} />
      <PlayerForm teams={teams} />
    </Card>
  );
}
