import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveSettingsAction } from "@/app/admin/actions";
import { seasonLabel } from "@/lib/leagues";
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
  const nba = await getSeasonInfo("NBA");
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
          <Field
            label="Current NBA season (start year)"
            name="current_season_nba"
            hint={`/nba shows this season (2026 = 2026-27), /nba/${seasonLabel("NBA", nba.current)} redirects to /nba, and new NBA injuries default to it. Seasons with data: ${nba.withData.map((y) => seasonLabel("NBA", y)).join(", ") || "none"}.`}
          >
            <Input name="current_season_nba" type="number" min={1946} max={2200} required defaultValue={String(nba.current)} />
          </Field>
          <button className={btnCls}>Save settings</button>
        </form>
      </Card>
    </>
  );
}
