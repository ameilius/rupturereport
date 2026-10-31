# Weekly tooling

All commands run from the repo root on a dev box. Nothing here touches the VPS or env files; production changes ship only through a push to `main` (CI & Deploy runs the migrations).

## 1. Dump current data
```bash
node scripts/weekly/dump-db.mjs --out /tmp/rr-live.json          # LIVE (authoritative): parses /llms-full.txt
node scripts/weekly/dump-db.mjs --local --out /tmp/rr-local.json  # local rrtest DB (NFL game data incomplete)
```
Per league: season, live totals (tears / ACL / Achilles), and one row per tracked player (slug, position, team, type, tear date, surface, in-game, stage, stage date).

## 2. Build a migration from a changes file
```bash
cp scripts/weekly/example-changes.json /tmp/changes.json   # edit: confirmed facts only, every tear/update needs a source URL
node scripts/weekly/build-migration.mjs /tmp/changes.json --dry-run   # preview
node scripts/weekly/build-migration.mjs /tmp/changes.json             # writes db/migrations/00NN_<name>_<date>.sql
```
`changes.json` keys (all optional except what you use):
- `date`, `name` (file slug, default `weekly_acl_achilles`), `title`, `summary` (header comment; newline-separated)
- `players[]`: `league` (NFL|NBA), `slug`, `firstName`, `lastName`, `position`, `team` (abbr), `dob`, `heightIn`, `weightLb`, `headshot` (default `/players/<slug>.png`; `null` to skip)
- `tears[]`: `league`, `slug`, `type` (ACL|Achilles), `date`, `season` (default: settings current season for that league), `week`, `stadium` (stadium slug), `homeAway`, `opponent` (abbr), `mechanism`, `side`, `phase`, `notes`, `source`
- `updates[]`: `league`, `slug`, `type`, `tearDate`, `date`, `stage` (progress_updates enum), `label`, `notes`, `source`
- `playerUpdates[]`: `league`, `slug`, `team`, `position`, `statusNote`

Every lookup is league-qualified (`teams.league`, `stadiums.league`, `players.league`), every insert is `NOT EXISTS`-guarded, bio fields use `COALESCE` (never overwrite), so re-running is a no-op. Unknowns are omitted → `NULL`.

## 3. Check idempotency (local rrtest, rolled back)
```bash
scripts/weekly/check-idempotency.sh db/migrations/00NN_weekly_acl_achilles_2026-11-03.sql
```
Applies the file twice inside one transaction on `rrtest` (rrlocal/rrlocal @127.0.0.1), compares row counts + checksums after each run, then `ROLLBACK`. PASS = second run changed nothing. Refuses non-local hosts. A "first run changed nothing" warning means a lookup (team/stadium/slug) matched nothing locally or it was already applied — check the slugs.

## 4. Ship
```bash
scripts/weekly/ship.sh "Weekly ACL & Achilles update 2026-11-03"            # git add -A
scripts/weekly/ship.sh "Fix Smythe stage" db/migrations/0017_fix.sql        # only these paths
```
lint → typecheck → build → commit → push `main` → finds the "CI & Deploy" run for that SHA and `gh run watch`es it → live check (key pages + cards 200, live dump totals). Refuses to commit `.env*` files.

## Post-deploy audit (runs in CI after every deploy; also runnable locally)
```bash
node scripts/audit/og-check.mjs                     # link previews on every sitemap page + contact/terms
NODE_PATH=/path/to/node_modules PW_CHROMIUM=/usr/bin/google-chrome node scripts/audit/overflow-check.mjs
```
