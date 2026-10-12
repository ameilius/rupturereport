import { Suspense } from "react";
import { StadiumForm } from "@/components/admin/forms";
import { Card, Flash, PageTitle, type SP } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export default function NewStadium({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle>New stadium</PageTitle>
      <Card>
        <Suspense>
          <Guarded searchParams={searchParams} />
        </Suspense>
      </Card>
    </>
  );
}

async function Guarded({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  return (
    <>
      <Flash searchParams={await searchParams} />
      <StadiumForm />
    </>
  );
}
