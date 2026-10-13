import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveSettingsAction } from "@/app/admin/actions";
import { getSeasonInfo, invalidateSeasonCache } from "@/lib/seasons";
import { Card, Field, Flash, Input, Loading, PageTitle, btnCls, type SP } from "@/components/admin/ui";

export default function SettingsPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: SP }) {
  await connection();
  await requireAdmin();
  const sp = await searchParams;
  invalidateSeasonCache();
  const info = await getSeasonInfo();
  return (
    <>
      <PageTitle>Settings</PageTitle>
      <Card title="Season">
        <Flash searchParams={sp} />
        <form action={saveSettingsAction} className="space-y-4">
          <Field
            label="Current season"
            name="current_season"
            hint={`The home page (/) shows this season, /${info.current} redirects to /, and new injuries default to it. Seasons with data: ${info.withData.join(", ") || "none"}.`}
          >
            <Input name="current_season" type="number" min={1920} max={2200} required defaultValue={String(info.current)} />
          </Field>
          <button className={btnCls}>Save settings</button>
        </form>
      </Card>
    </>
  );
}
