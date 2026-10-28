import Link from "next/link";
import { saveInjuryAction, savePlayerAction, saveStadiumAction } from "@/app/admin/actions";
import {
  BODY_SIDES,
  HOME_AWAY,
  INJURY_TYPES,
  LEAGUE_OPTIONS,
  MECHANISMS,
  NBA_POSITIONS,
  PHASES,
  POSITIONS,
  SURFACE_TYPES,
  type Row,
} from "@/lib/admin-db";
import { Field, Input, Select, Textarea, btnCls, btnGhostCls, fmtDate } from "./ui";

const NBA_ONLY = ["PG", "SG", "SF", "PF", "G", "F", "G-F", "F-G", "F-C", "C-F"];
/** NFL positions, then NBA positions labelled "(NBA)". C is shared. */
const POSITION_OPTIONS = [
  ...POSITIONS.filter((p) => !NBA_ONLY.includes(p)).map((p) => ({ value: p, label: p })),
  ...NBA_POSITIONS.map((p) => ({ value: p, label: `${p} (NBA)` })).filter((o) => o.value !== "C"),
];

const grid = "grid grid-cols-1 gap-4 sm:grid-cols-2";

export function PlayerForm({ player, teams }: { player?: Row | null; teams: Row[] }) {
  const v = (k: string) => (player?.[k] == null ? undefined : String(player[k]));
  return (
    <form action={savePlayerAction} className="space-y-4">
      {player && <input type="hidden" name="id" value={String(player.id)} />}
      <div className={grid}>
        <Field label="First name *" name="first_name">
          <Input name="first_name" required maxLength={64} defaultValue={v("first_name")} />
        </Field>
        <Field label="Last name *" name="last_name">
          <Input name="last_name" required maxLength={64} defaultValue={v("last_name")} />
        </Field>
        {player && (
          <Field label="Slug" name="slug" hint="Changing this changes the public URL.">
            <Input name="slug" defaultValue={v("slug")} />
          </Field>
        )}
        <Field label="League *" name="league" hint="The team must belong to the same league.">
          <Select name="league" options={LEAGUE_OPTIONS} defaultValue={v("league") ?? "NFL"} required />
        </Field>
        <Field label="Position *" name="position" hint="NBA: store the listed position (G, F, C, G-F …); the site groups it into Guards / Wings-forwards / Bigs.">
          <Select name="position" options={POSITION_OPTIONS} defaultValue={v("position")} empty="—" required />
        </Field>
        <Field label="Team" name="team_id">
          <Select
            name="team_id"
            empty="— None / free agent —"
            defaultValue={v("team_id")}
            options={teams.map((t) => ({ value: Number(t.id), label: `${t.league} · ${t.name} (${t.abbreviation})` }))}
          />
        </Field>
        <Field label="Date of birth" name="dob">
          <Input name="dob" type="date" defaultValue={player?.dob ? fmtDate(player.dob) : undefined} />
        </Field>
        <Field label="Height (inches)" name="height_in">
          <Input name="height_in" type="number" min={48} max={96} defaultValue={v("height_in")} />
        </Field>
        <Field label="Weight (lb)" name="weight_lb">
          <Input name="weight_lb" type="number" min={100} max={450} defaultValue={v("weight_lb")} />
        </Field>
      </div>
      <div className="flex gap-3">
        <button className={btnCls}>{player ? "Save player" : "Create player"}</button>
        <Link href="/admin/players" className={btnGhostCls}>Cancel</Link>
      </div>
    </form>
  );
}

export function StadiumForm({ stadium }: { stadium?: Row | null }) {
  const v = (k: string) => (stadium?.[k] == null ? undefined : String(stadium[k]));
  return (
    <form action={saveStadiumAction} className="space-y-4">
      {stadium && <input type="hidden" name="id" value={String(stadium.id)} />}
      <div className={grid}>
        <Field label="League *" name="league">
          <Select name="league" options={LEAGUE_OPTIONS} defaultValue={v("league") ?? "NFL"} required />
        </Field>
        <Field label="Name *" name="name" hint="Stadium or arena name.">
          <Input name="name" required maxLength={128} defaultValue={v("name")} />
        </Field>
        <Field label="Slug" name="slug" hint="Leave blank to generate from name.">
          <Input name="slug" defaultValue={v("slug")} />
        </Field>
        <Field label="City *" name="city">
          <Input name="city" required maxLength={64} defaultValue={v("city")} />
        </Field>
        <Field label="State" name="state" hint="2-letter code">
          <Input name="state" maxLength={2} defaultValue={v("state")} />
        </Field>
        <Field label="Surface type *" name="surface_type" hint="NBA arenas: hardwood. NFL: natural, hybrid or artificial.">
          <Select name="surface_type" options={SURFACE_TYPES} defaultValue={v("surface_type")} empty="—" required />
        </Field>
        <Field label="Surface brand" name="surface_brand">
          <Input name="surface_brand" maxLength={64} defaultValue={v("surface_brand")} placeholder="e.g. FieldTurf CORE" />
        </Field>
      </div>
      <Field label="Notes" name="notes">
        <Textarea name="notes" defaultValue={v("notes")} />
      </Field>
      <div className="flex gap-3">
        <button className={btnCls}>{stadium ? "Save stadium" : "Create stadium"}</button>
        <Link href="/admin/stadiums" className={btnGhostCls}>Cancel</Link>
      </div>
    </form>
  );
}

export function InjuryForm({
  injury,
  playerId,
  teams,
  stadiums,
  allTypes,
  defaultSeason,
  league = "NFL",
}: {
  injury?: Row | null;
  playerId: number;
  teams: Row[];
  stadiums: Row[];
  allTypes?: boolean;
  /** New injuries default to the current season (settings.current_season). */
  defaultSeason?: number;
  /** The player's league: scopes the phase options and labels. */
  league?: "NFL" | "NBA";
}) {
  const nba = league === "NBA";
  const v = (k: string) => (injury?.[k] == null ? undefined : String(injury[k]));
  const current = v("injury_type");
  const types =
    allTypes || (current && current !== "ACL" && current !== "Achilles")
      ? INJURY_TYPES
      : (["ACL", "Achilles"] as const);
  return (
    <form action={saveInjuryAction} className="space-y-4">
      {injury && <input type="hidden" name="id" value={String(injury.id)} />}
      <input type="hidden" name="player_id" value={playerId} />
      <div className={grid}>
        <Field label="Injury type *" name="injury_type">
          <Select name="injury_type" options={types} defaultValue={current ?? "ACL"} required />
        </Field>
        <Field label="Injury date *" name="injury_date">
          <Input name="injury_date" type="date" required defaultValue={injury ? fmtDate(injury.injury_date) : undefined} />
        </Field>
        <Field label="Season" name="season" hint={nba ? "Start year of the league season: 2026 = 2026-27 (includes Summer League, offseason, preseason and playoffs of that league year)." : "The NFL season year (2026 = 2026 season)."}>
          <Input name="season" type="number" min={2000} max={2100} defaultValue={v("season") ?? (defaultSeason != null ? String(defaultSeason) : undefined)} required />
        </Field>
        <Field label={nba ? "Game #" : "Week"} name="week" hint={nba ? "Game number of the team's season or series (e.g. 4 for Game 4)." : undefined}>
          <Input name="week" type="number" min={0} max={nba ? 110 : 23} defaultValue={v("week")} />
        </Field>
        <Field label="Phase" name="phase">
          <Select name="phase" options={nba ? PHASES : PHASES.filter((p) => p !== "summer_league")} defaultValue={v("phase") ?? "regular"} empty="—" />
        </Field>
        <Field label={nba ? "Arena" : "Stadium"} name="stadium_id">
          <Select
            name="stadium_id"
            empty="—"
            defaultValue={v("stadium_id")}
            options={stadiums.map((s) => ({
              value: Number(s.id),
              label: `${s.name}${s.surface_type && !nba ? ` (${s.surface_type})` : ""}`,
            }))}
          />
        </Field>
        <Field label="Home / away" name="home_away">
          <Select name="home_away" options={HOME_AWAY} defaultValue={v("home_away")} empty="—" />
        </Field>
        <Field label="Opponent" name="opponent_id">
          <Select
            name="opponent_id"
            empty="—"
            defaultValue={v("opponent_id")}
            options={teams.map((t) => ({ value: Number(t.id), label: String(t.name) }))}
          />
        </Field>
        <Field label="Mechanism" name="mechanism">
          <Select name="mechanism" options={MECHANISMS} defaultValue={v("mechanism")} empty="—" />
        </Field>
        <Field label="Body side" name="body_side">
          <Select name="body_side" options={BODY_SIDES} defaultValue={v("body_side")} empty="—" />
        </Field>
      </div>
      <Field label="Source URL" name="source">
        <Input name="source" type="url" defaultValue={v("source")} placeholder="https://" />
      </Field>
      <Field label="Severity notes" name="severity_notes">
        <Textarea name="severity_notes" defaultValue={v("severity_notes")} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button className={btnCls}>{injury ? "Save injury" : "Create injury"}</button>
        <Link href={`/admin/players/${playerId}`} className={btnGhostCls}>Back to player</Link>
      </div>
    </form>
  );
}
