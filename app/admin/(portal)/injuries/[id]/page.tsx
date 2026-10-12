import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { STAGES, getInjury, getUpdates, listStadiums, listTeams } from "@/lib/admin-db";
import { addUpdateAction, deleteInjuryAction, deleteUpdateAction } from "@/app/admin/actions";
import { InjuryForm } from "@/components/admin/forms";
import {
  Card, Field, Flash, Input, Loading, Select, Textarea,
  btnCls, btnDangerCls, fmtDate, linkCls, type SP,
} from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }>; searchParams: SP };

export default function EditInjury(props: Props) {
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
  const [injury, updates, teams, stadiums, sp] = await Promise.all([
    getInjury(id), getUpdates(id), listTeams(), listStadiums(), searchParams,
  ]);
  if (!injury) notFound();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          <Link href={`/admin/players/${injury.player_id}`} className={linkCls}>
            {String(injury.first_name)} {String(injury.last_name)}
          </Link>
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {String(injury.injury_type)} injury — {fmtDate(injury.injury_date)}
        </h1>
      </div>
      <Flash searchParams={sp} />

      <Card title="Progress updates">
        <form action={addUpdateAction} className="mb-6 space-y-4">
          <input type="hidden" name="injury_id" value={id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Date *" name="update_date">
              <Input name="update_date" type="date" required defaultValue={today} />
            </Field>
            <Field label="Stage *" name="stage">
              <Select name="stage" options={STAGES} required defaultValue={updates[0]?.stage as string | undefined} />
            </Field>
            <Field label="Status label" name="status_label">
              <Input name="status_label" maxLength={64} placeholder="e.g. Surgery successful" />
            </Field>
          </div>
          <Field label="Source URL" name="source">
            <Input name="source" type="url" placeholder="https://" />
          </Field>
          <Field label="Notes" name="notes">
            <Textarea name="notes" />
          </Field>
          <button className={btnCls}>Add update</button>
        </form>
        {updates.length === 0 ? (
          <p className="text-muted">No updates yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {updates.map((u) => (
              <li key={String(u.id)} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">
                    {fmtDate(u.update_date)} · {String(u.stage).replace(/_/g, " ")}
                    {u.status_label ? ` — ${String(u.status_label)}` : ""}
                  </p>
                  {u.notes ? <p className="text-sm text-muted">{String(u.notes)}</p> : null}
                  {u.source ? (
                    <a href={String(u.source)} className={`${linkCls} text-sm break-all`} target="_blank" rel="noopener noreferrer">
                      {String(u.source)}
                    </a>
                  ) : null}
                </div>
                <form action={deleteUpdateAction}>
                  <input type="hidden" name="id" value={String(u.id)} />
                  <input type="hidden" name="injury_id" value={id} />
                  <button className={btnDangerCls} aria-label={`Delete update from ${fmtDate(u.update_date)}`}>
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Injury details">
        <InjuryForm injury={injury} playerId={Number(injury.player_id)} teams={teams} stadiums={stadiums} />
      </Card>

      <Card title="Danger zone">
        <form action={deleteInjuryAction}>
          <input type="hidden" name="id" value={id} />
          <button className={btnDangerCls}>Delete this injury and all its updates</button>
        </form>
      </Card>
    </div>
  );
}
