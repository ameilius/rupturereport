#!/usr/bin/env bash
# Run on the VPS by /home/rupturereport/app/deploy.sh after `git pull`.
set -euo pipefail
APP=/home/rupturereport/app
cd "$APP"

# --- database: build a temp client config from .env.production.local (password never on the command line)
envval() { grep -E "^$1=" .env.production.local | tail -n1 | cut -d= -f2- | sed -e "s/^['\"]//" -e "s/['\"]$//"; }
CNF=$(mktemp); chmod 600 "$CNF"; trap 'rm -f "$CNF"' EXIT
{
  echo "[client]"
  echo "host=$(envval DB_HOST)"
  echo "port=$(envval DB_PORT)"
  echo "user=$(envval DB_USER)"
  echo "password=\"$(envval DB_PASSWORD)\""
  echo "default-character-set=utf8mb4"
} > "$CNF"
DB=$(envval DB_NAME)
sql() { mariadb --defaults-extra-file="$CNF" "$DB" "$@"; }

echo "== Schema (idempotent)"
sql < db/schema.sql

echo "== Migrations (each runs once)"
sql -e "CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
for f in $(ls db/migrations/*.sql 2>/dev/null | sort); do
  n=$(basename "$f")
  if [ -z "$(sql -N -e "SELECT 1 FROM schema_migrations WHERE name='$n'")" ]; then
    echo "  applying $n"; sql < "$f"; sql -e "INSERT INTO schema_migrations (name) VALUES ('$n')"
  fi
done

echo "== Seeds (idempotent upserts)"
for f in db/seed_*.sql; do echo "  $f"; sql < "$f"; done

echo "== Build"
npm ci
npm run build
pm2 restart rupturereport --update-env
echo "Deployed $(git rev-parse --short HEAD)"
