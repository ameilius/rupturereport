import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStadium } from "@/lib/admin-db";
import { StadiumForm } from "@/components/admin/forms";
import { Card, Flash, Loading, PageTitle, type SP } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }>; searchParams: SP };

export default function EditStadium(props: Props) {
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
  const [stadium, sp] = await Promise.all([getStadium(id), searchParams]);
  if (!stadium) notFound();
  return (
    <>
      <PageTitle>{String(stadium.name)}</PageTitle>
      <Card>
        <Flash searchParams={sp} />
        <StadiumForm stadium={stadium} />
      </Card>
    </>
  );
}
