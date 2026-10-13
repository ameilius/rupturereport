import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getCurrentSeason } from "@/lib/seasons";
import { getPlayer, listStadiums, listTeams } from "@/lib/admin-db";
import { InjuryForm } from "@/components/admin/forms";
import { Card, Flash, Loading, PageTitle, linkCls, type SP } from "@/components/admin/ui";

export default function NewInjury({ searchParams }: { searchParams: SP }) {
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
  const playerId = Number(sp.player);
  if (!Number.isInteger(playerId)) notFound();
  const [player, teams, stadiums, season] = await Promise.all([getPlayer(playerId), listTeams(), listStadiums(), getCurrentSeason()]);
  if (!player) notFound();
  const allTypes = sp.all === "1";
  return (
    <>
      <PageTitle>
        New injury: {String(player.first_name)} {String(player.last_name)}
      </PageTitle>
      <Card>
        <Flash searchParams={sp} />
        <InjuryForm playerId={playerId} teams={teams} stadiums={stadiums} allTypes={allTypes} defaultSeason={season} />
        {!allTypes && (
          <p className="mt-4 text-sm text-muted">
            Need MCL/other?{" "}
            <Link href={`/admin/injuries/new?player=${playerId}&all=1`} className={linkCls}>
              Show all injury types
            </Link>
          </p>
        )}
      </Card>
    </>
  );
}
