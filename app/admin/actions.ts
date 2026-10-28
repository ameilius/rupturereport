"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearFailures,
  clearSessionCookie,
  rateLimited,
  recordFailure,
  requireAdmin,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import {
  BODY_SIDES,
  HOME_AWAY,
  INJURY_TYPES,
  LEAGUE_OPTIONS,
  MECHANISMS,
  PHASES,
  STAGES,
  SURFACE_TYPES,
  exec,
  getInjury,
  getImageRow,
  getPlayer,
  getStadiumLeague,
  getTeamLeague,
  positionValidFor,
  countPlayerInjuries,
  slugify,
  uniqueSlug,
} from "@/lib/admin-db";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { deleteUpload, storeUpload } from "@/lib/uploads";
import { officialImagePath } from "@/lib/leagues";
import { getCurrentSeason, invalidateSeasonCache, parseSeason } from "@/lib/seasons";

// ---------- helpers ----------
function str(fd: FormData, k: string, max = 255): string | null {
  const v = fd.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}
function int(fd: FormData, k: string): number | null {
  const v = str(fd, k);
  if (v == null) return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}
function date(fd: FormData, k: string): string | null {
  const v = str(fd, k);
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}
function oneOf<T extends readonly string[]>(
  fd: FormData,
  k: string,
  allowed: T,
): T[number] | null {
  const v = str(fd, k);
  return v && (allowed as readonly string[]).includes(v) ? v : null;
}
function fail(path: string, msg: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}error=${encodeURIComponent(msg)}`);
}
function revalidatePublic(playerSlug?: string | null) {
  revalidatePath("/players");
  revalidatePath("/sitemap.xml");
  revalidatePath("/");
  revalidatePath("/[season]", "page");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
  revalidatePath("/nba");
  revalidatePath("/nba/players");
  revalidatePath("/nba/[season]", "page");
  invalidateSeasonCache();
  if (playerSlug) {
    revalidatePath(`/players/${playerSlug}`);
    revalidatePath(`/players/${playerSlug}/opengraph-image`);
    revalidatePath(`/nba/players/${playerSlug}`);
    revalidatePath(`/nba/players/${playerSlug}/opengraph-image`);
  }
}

// ---------- auth ----------
export async function loginAction(fd: FormData) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) fail("/admin/login", "Too many attempts. Try again in 15 minutes.");
  const password = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";
  let ok = false;
  try {
    ok = verifyPassword(password);
  } catch {
    ok = false;
  }
  if (!ok) {
    recordFailure(ip);
    fail("/admin/login", "Invalid password");
  }
  clearFailures(ip);
  await setSessionCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

// ---------- players ----------
export async function savePlayerAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const back = id ? `/admin/players/${id}` : "/admin/players/new";
  const first = str(fd, "first_name", 64);
  const last = str(fd, "last_name", 64);
  const position = str(fd, "position", 4);
  if (!first || !last || !position) fail(back, "First name, last name and position are required");
  const existingPlayer = id ? await getPlayer(id) : null;
  const league = oneOf(fd, "league", LEAGUE_OPTIONS) ?? ((existingPlayer?.league as string | undefined) === "NBA" ? "NBA" : "NFL");
  const teamId = int(fd, "team_id");
  if (teamId != null && (await getTeamLeague(teamId)) !== league) fail(back, `That team is not an ${league} team`);
  if (!positionValidFor(league, position)) fail(back, `${position} is not an ${league} position`);
  if (existingPlayer && existingPlayer.league !== league && (await countPlayerInjuries(Number(existingPlayer.id))) > 0)
    fail(back, "This player has injuries recorded; delete them before changing the league");
  const fields = {
    first_name: first,
    last_name: last,
    league,
    position,
    team_id: teamId,
    dob: date(fd, "dob"),
    height_in: int(fd, "height_in"),
    weight_lb: int(fd, "weight_lb"),
  };
  let slug: string;
  let oldSlug: string | null = null;
  if (id) {
    const existing = await getPlayer(id);
    if (!existing) fail("/admin/players", "Player not found");
    oldSlug = existing.slug as string;
    const wanted = str(fd, "slug", 140);
    slug = wanted
      ? await uniqueSlug("players", slugify(wanted), id)
      : (existing.slug as string);
    await exec(`UPDATE players SET ?, slug = ? WHERE id = ?`, [fields, slug, id]);
  } else {
    slug = await uniqueSlug("players", slugify(`${first} ${last}`));
    const r = await exec(`INSERT INTO players SET ?, slug = ?`, [fields, slug]);
    revalidatePublic(slug);
    redirect(`/admin/players/${r.insertId}?saved=1`);
  }
  revalidatePublic(slug);
  if (oldSlug && oldSlug !== slug) revalidatePublic(oldSlug);
  redirect(`/admin/players/${id}?saved=1`);
}

// ---------- stadiums ----------
export async function saveStadiumAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const back = id ? `/admin/stadiums/${id}` : "/admin/stadiums/new";
  const name = str(fd, "name", 128);
  const city = str(fd, "city", 64);
  const surfaceType = oneOf(fd, "surface_type", SURFACE_TYPES);
  if (!name || !city || !surfaceType) fail(back, "Name, city and surface type are required");
  const stadiumLeague = oneOf(fd, "league", LEAGUE_OPTIONS) ?? "NFL";
  if (stadiumLeague === "NBA" && surfaceType !== "hardwood") fail(back, "NBA arenas use the hardwood surface type");
  if (stadiumLeague === "NFL" && surfaceType === "hardwood") fail(back, "Hardwood is only for NBA arenas");
  const fields = {
    league: oneOf(fd, "league", LEAGUE_OPTIONS) ?? "NFL",
    name,
    city,
    state: str(fd, "state", 2)?.toUpperCase() ?? null,
    surface_type: surfaceType,
    surface_brand: str(fd, "surface_brand", 64),
    notes: str(fd, "notes", 5000),
  };
  const slug = await uniqueSlug(
    "stadiums",
    slugify(str(fd, "slug", 140) ?? name),
    id ?? undefined,
  );
  if (id) {
    await exec(`UPDATE stadiums SET ?, slug = ? WHERE id = ?`, [fields, slug, id]);
  } else {
    await exec(`INSERT INTO stadiums SET ?, slug = ?`, [fields, slug]);
  }
  // Stadium details appear on every player page.
  revalidatePath("/players/[slug]", "page");
  revalidatePublic();
  redirect("/admin/stadiums?saved=1");
}

// ---------- injuries ----------
export async function saveInjuryAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const playerId = int(fd, "player_id");
  const back = id ? `/admin/injuries/${id}` : `/admin/injuries/new?player=${playerId ?? ""}`;
  const player = playerId ? await getPlayer(playerId) : null;
  if (!player) fail(back, "Player is required");
  const injuryType = oneOf(fd, "injury_type", INJURY_TYPES);
  const injuryDate = date(fd, "injury_date");
  if (!injuryType || !injuryDate) fail(back, "Injury type and date are required");
  const stadiumId = int(fd, "stadium_id");
  const opponentId = int(fd, "opponent_id");
  const pl = player.league as string;
  if (stadiumId != null && (await getStadiumLeague(stadiumId)) !== pl) fail(back, `That ${pl === "NBA" ? "arena" : "stadium"} is not in the ${pl}`);
  if (opponentId != null && (await getTeamLeague(opponentId)) !== pl) fail(back, `That opponent is not an ${pl} team`);
  const fields = {
    player_id: playerId,
    injury_type: injuryType,
    injury_date: injuryDate,
    season: parseSeason(str(fd, "season")) ?? (await getCurrentSeason(player.league === "NBA" ? "NBA" : "NFL")),
    week: int(fd, "week"),
    stadium_id: stadiumId,
    home_away: oneOf(fd, "home_away", HOME_AWAY),
    opponent_id: opponentId,
    mechanism: oneOf(fd, "mechanism", MECHANISMS),
    body_side: oneOf(fd, "body_side", BODY_SIDES),
    phase: oneOf(fd, "phase", PHASES),
    severity_notes: str(fd, "severity_notes", 5000),
    source: str(fd, "source", 500),
  };
  let injuryId = id;
  if (id) {
    await exec(`UPDATE injuries SET ? WHERE id = ?`, [fields, id]);
  } else {
    injuryId = (await exec(`INSERT INTO injuries SET ?`, [fields])).insertId;
  }
  revalidatePublic(player.slug as string);
  redirect(`/admin/injuries/${injuryId}?saved=1`);
}

export async function deleteInjuryAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const injury = id ? await getInjury(id) : null;
  if (!injury) fail("/admin", "Injury not found");
  await exec(`DELETE FROM progress_updates WHERE injury_id = ?`, [id]);
  await exec(`DELETE FROM injuries WHERE id = ?`, [id]);
  revalidatePublic(injury.player_slug as string);
  redirect(`/admin/players/${injury.player_id}?saved=1`);
}

// ---------- progress updates ----------
export async function addUpdateAction(fd: FormData) {
  await requireAdmin();
  const injuryId = int(fd, "injury_id");
  const injury = injuryId ? await getInjury(injuryId) : null;
  if (!injury) fail("/admin", "Injury not found");
  const back = `/admin/injuries/${injuryId}`;
  const stage = oneOf(fd, "stage", STAGES);
  const updateDate = date(fd, "update_date");
  if (!stage || !updateDate) fail(back, "Date and stage are required");
  await exec(`INSERT INTO progress_updates SET ?`, [
    {
      injury_id: injuryId,
      update_date: updateDate,
      stage,
      status_label: str(fd, "status_label", 64),
      notes: str(fd, "notes", 5000),
      source: str(fd, "source", 500),
    },
  ]);
  revalidatePublic(injury.player_slug as string);
  redirect(`${back}?saved=1`);
}

export async function deleteUpdateAction(fd: FormData) {
  await requireAdmin();
  const id = int(fd, "id");
  const injuryId = int(fd, "injury_id");
  const injury = injuryId ? await getInjury(injuryId) : null;
  if (!id || !injury) fail("/admin", "Update not found");
  await exec(`DELETE FROM progress_updates WHERE id = ? AND injury_id = ?`, [id, injuryId]);
  revalidatePublic(injury.player_slug as string);
  redirect(`/admin/injuries/${injuryId}?saved=1`);
}

// ---------- images (player headshots / team logos) ----------
const IMAGE_TARGETS = {
  players: { table: "players", column: "headshot_path", back: "/admin/players" },
  teams: { table: "teams", column: "logo_path", back: "/admin/teams" },
} as const;

async function imageTarget(fd: FormData) {
  await requireAdmin();
  const kind = oneOf(fd, "kind", ["players", "teams"] as const);
  const id = int(fd, "id");
  if (!kind || !id) fail("/admin", "Invalid image request");
  const t = IMAGE_TARGETS[kind];
  const back = `${t.back}/${id}`;
  const r = await getImageRow(t.table, t.column, id);
  if (!r) fail(t.back, "Not found");
  return {
    kind, id, t, back,
    slug: String(r.slug),
    league: (r.league === "NBA" ? "NBA" : "NFL") as "NFL" | "NBA",
    abbreviation: (r.abbreviation as string | null) ?? null,
    current: (r.path as string | null) ?? null,
  };
}

function revalidateImage(kind: "players" | "teams", slug: string) {
  revalidatePublic(kind === "players" ? slug : null);
  if (kind === "teams") revalidatePath("/players/[slug]", "page");
  revalidatePath(`/admin/${kind}`, "layout");
}

export async function uploadImageAction(fd: FormData) {
  const { kind, id, t, back, slug, current } = await imageTarget(fd);
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) fail(back, "Choose an image to upload");
  let path: string;
  try {
    path = await storeUpload(kind, slug, file);
  } catch (e) {
    fail(back, e instanceof Error ? e.message : "Upload failed");
  }
  await exec(`UPDATE ${t.table} SET ${t.column} = ? WHERE id = ?`, [path, id]);
  if (current !== path) await deleteUpload(current);
  revalidateImage(kind, slug);
  redirect(`${back}?saved=1`);
}

export async function removeImageAction(fd: FormData) {
  const { kind, id, t, back, slug, current, league, abbreviation } = await imageTarget(fd);
  const mode = str(fd, "mode") === "official" ? "official" : "none";
  let next: string | null = null;
  if (mode === "official") {
    // NFL: /teams/{slug}.png, /players/{slug}.png. NBA team logos are /teams/nba/{ABBR}.png.
    const official = officialImagePath(kind, slug, league, abbreviation);
    if (!existsSync(join(process.cwd(), "public", official))) fail(back, "No official image on file");
    next = official;
  }
  await exec(`UPDATE ${t.table} SET ${t.column} = ? WHERE id = ?`, [next, id]);
  await deleteUpload(current);
  revalidateImage(kind, slug);
  redirect(`${back}?saved=1`);
}

// ---------- settings ----------
export async function saveSettingsAction(fd: FormData) {
  await requireAdmin();
  const season = parseSeason(str(fd, "current_season"));
  if (season == null) fail("/admin/settings", "Current season must be a 4-digit year");
  await exec(
    "INSERT INTO settings (k, v) VALUES ('current_season', ?) ON DUPLICATE KEY UPDATE v = VALUES(v)",
    [String(season)],
  );
  // NBA season = the year it starts (2026 = 2026-27). Optional: leave blank to keep the current value.
  const nbaRaw = str(fd, "current_season_nba");
  if (nbaRaw != null) {
    const nba = parseSeason(nbaRaw);
    if (nba == null) fail("/admin/settings", "NBA season must be a 4-digit start year (2026 = 2026-27)");
    await exec(
      "INSERT INTO settings (k, v) VALUES ('current_season_nba', ?) ON DUPLICATE KEY UPDATE v = VALUES(v)",
      [String(nba)],
    );
  }
  revalidatePublic();
  redirect("/admin/settings?saved=1");
}
