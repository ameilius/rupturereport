#!/usr/bin/env bash
# Apply a migration twice to the LOCAL test DB inside one transaction, assert the second run changes nothing,
# then ROLLBACK (rrtest is left untouched). Never points at production.
#   scripts/weekly/check-idempotency.sh db/migrations/0016_weekly_acl_achilles_2026-11-03.sql
# Env overrides: RR_DB_HOST (127.0.0.1) RR_DB_USER (rrlocal) RR_DB_PASS (rrlocal) RR_DB_NAME (rrtest)
# Requires a mysql or mariadb client and a reachable local test DB with the tracker tables.
# Failures (missing client, connection error, missing schema/tables) print to stderr and exit non-zero.
# There is no silent skip; do not treat an empty run as a pass.
set -euo pipefail

die() { echo "FAIL: $*" >&2; exit 1; }

F=${1:?usage: check-idempotency.sh <migration.sql>}
[ -f "$F" ] || die "migration file not found: $F"
H=${RR_DB_HOST:-127.0.0.1}; U=${RR_DB_USER:-rrlocal}; P=${RR_DB_PASS:-rrlocal}; D=${RR_DB_NAME:-rrtest}
case "$H" in 127.0.0.1|localhost) ;; *) echo "refusing non-local host $H" >&2; exit 2;; esac
grep -qiE '^\s*(CREATE|ALTER|DROP|TRUNCATE|RENAME)\b' "$F" && echo "note: DDL in $F auto-commits in MySQL; rollback won't undo it."

if command -v mysql >/dev/null 2>&1; then
  MYSQL_BIN=$(command -v mysql)
elif command -v mariadb >/dev/null 2>&1; then
  MYSQL_BIN=$(command -v mariadb)
else
  die "mysql/mariadb client not found in PATH. Install a MariaDB or MySQL client before running this check."
fi

# Run the client. Stdout is passed through. The command-line password warning is
# dropped; real client errors stay on stderr. Returns the client's exit status.
run_sql() {
  local err rc
  err=$(mktemp)
  set +e
  "$MYSQL_BIN" -h"$H" -u"$U" -p"$P" "$D" "$@" 2>"$err"
  rc=$?
  set -e
  grep -v "Using a password" "$err" >&2 || true
  rm -f "$err"
  return "$rc"
}

if ! run_sql -N -e "SELECT 1;" >/dev/null; then
  die "could not connect to database '$D' as $U@$H. Check that MariaDB is running and RR_DB_* credentials are correct."
fi

for t in players injuries progress_updates; do
  found=$(run_sql -N -e "SHOW TABLES LIKE '$t';") \
    || die "could not inspect schema of database '$D'"
  found=${found//[[:space:]]/}
  [ "$found" = "$t" ] || die "required table '$t' is missing from database '$D'"
done

SNAP="SELECT CONCAT_WS(' ',
  (SELECT COUNT(*) FROM players), (SELECT COUNT(*) FROM injuries), (SELECT COUNT(*) FROM progress_updates),
  (SELECT COALESCE(SUM(CRC32(CONCAT_WS('|',slug,league,team_id,position,dob,height_in,weight_lb,headshot_path))),0) FROM players),
  (SELECT COALESCE(SUM(CRC32(CONCAT_WS('|',player_id,injury_type,injury_date,season,week,stadium_id,opponent_id,phase,body_side,mechanism))),0) FROM injuries),
  (SELECT COALESCE(SUM(CRC32(CONCAT_WS('|',injury_id,update_date,stage,status_label))),0) FROM progress_updates)) AS snap;"

tmp_out=$(mktemp)
if ! { echo "START TRANSACTION;"; echo "$SNAP"; cat "$F"; echo; echo "$SNAP"; cat "$F"; echo; echo "$SNAP"; echo "ROLLBACK;"; } \
  | run_sql -N >"$tmp_out"; then
  rm -f "$tmp_out"
  die "failed applying $F to $D (see client error above)"
fi
OUT=$(cat "$tmp_out")
rm -f "$tmp_out"

S=($(echo "$OUT" | grep -E '^[0-9]+( [0-9]+){5}$'))
[ ${#S[@]} -eq 18 ] || { echo "$OUT"; echo "FAIL: could not read snapshots" >&2; exit 1; }
BEFORE="${S[*]:0:6}"; FIRST="${S[*]:6:6}"; SECOND="${S[*]:12:6}"
echo "before : players/injuries/updates ${S[0]}/${S[1]}/${S[2]}"
echo "1st run: ${S[6]}/${S[7]}/${S[8]}  (+$((S[6]-S[0]))/+$((S[7]-S[1]))/+$((S[8]-S[2])))"
echo "2nd run: ${S[12]}/${S[13]}/${S[14]}"
[ "$BEFORE" != "$FIRST" ] || echo "warning: first run changed nothing (already applied locally, or lookups matched nothing?)"
if [ "$FIRST" = "$SECOND" ]; then echo "PASS: idempotent (rolled back; $D unchanged)"; else echo "FAIL: second run changed data" >&2; exit 1; fi
