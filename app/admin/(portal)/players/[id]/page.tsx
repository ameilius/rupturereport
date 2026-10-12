import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPlayer, getPlayerInjuries, listTeams } from "@/lib/admin-db";
import { PlayerForm } from "@/components/admin/forms";
import { Card, Flash, Loading, btnCls, fmtDate, linkCls, type SP } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }>; searchParams: SP };

export default function EditPlayer(props: Props) {
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
  const [player, teams, injuries, sp] = await Promise.all([
    getPlayer(id),
    listTeams(),
    getPlayerInjuries(id),
    searchParams,
  ]);
  if (!player) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {String(player.first_name)} {String(player.last_name)}
        </h1>
        <Link href={`/players/${player.slug}`} className={linkCls} target="_blank">
          View public page ↗
        </Link>
      </div>
      <Flash searchParams={sp} />
      <Card title="Injuries">
        {injuries.length === 0 ? (
          <p className="mb-4 text-muted">No injuries recorded.</p>
        ) : (
          <ul className="mb-4 divide-y divide-border">
            {injuries.map((i) => (
              <li key={String(i.id)} className="flex flex-wrap justify-between gap-2 py-2">
                <Link href={`/admin/injuries/${i.id}`} className={linkCls}>
                  {String(i.injury_type)} — {fmtDate(i.injury_date)}
                </Link>
                <span className="text-sm text-muted">
                  {[i.stadium_name, i.opponent_name && `vs ${i.opponent_name}`].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href={`/admin/injuries/new?player=${id}`} className={btnCls}>+ Add injury</Link>
      </Card>
      <Card title="Player details">
        <PlayerForm player={player} teams={teams} />
      </Card>
    </div>
  );
}
