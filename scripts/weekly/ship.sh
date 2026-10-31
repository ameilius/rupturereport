#!/usr/bin/env bash
# Lint, typecheck, build, commit, push to main, watch the "CI & Deploy" run for that commit, then check live.
#   scripts/weekly/ship.sh "Weekly ACL & Achilles update 2026-11-03" [paths to add...]   (default: git add -A)
# Never touches the VPS directly: deploy happens through CI. Requires an authenticated `gh`.
set -euo pipefail
MSG=${1:?usage: ship.sh "commit message" [paths...]}; shift || true
cd "$(git rev-parse --show-toplevel)"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
[ "$BRANCH" = main ] || { echo "on $BRANCH, not main"; exit 1; }
git ls-files --others --modified --exclude-standard | grep -E '(^|/)\.env' && { echo "refusing: env file in changes"; exit 1; } || true

echo "== lint";      npm run -s lint
echo "== typecheck"; npx tsc --noEmit -p .
echo "== build";     npm run -s build >/tmp/rr-ship-build.log 2>&1 || { tail -40 /tmp/rr-ship-build.log; exit 1; }

echo "== commit"
if [ $# -gt 0 ]; then git add -- "$@"; else git add -A; fi
git diff --cached --quiet && { echo "nothing to commit"; exit 1; }
git commit -q -m "$MSG"
git pull -q --rebase origin main
git push -q origin main
SHA=$(git rev-parse HEAD); echo "pushed ${SHA:0:7}"

echo "== CI & Deploy"
RUN=""
for _ in $(seq 1 30); do
  RUN=$(gh run list -w "CI & Deploy" -b main -L 10 --json databaseId,headSha -q ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -1)
  [ -n "$RUN" ] && break; sleep 5
done
[ -n "$RUN" ] || { echo "no CI run found for $SHA"; exit 1; }
echo "run $RUN: $(gh run view "$RUN" --json url -q .url)"
gh run watch "$RUN" --exit-status --interval 15 >/dev/null || { gh run view "$RUN" --log-failed | tail -60; exit 1; }
echo "CI & Deploy passed"

echo "== live check"
SITE=${SITE:-https://rupturereport.com}
for p in / /nba /stats /nba/stats /players /nba/players /llms-full.txt /opengraph-image /nba/opengraph-image; do
  c=$(curl -s -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0 RR-ship' "$SITE$p"); echo "  $c $p"; [ "$c" = 200 ] || FAIL=1
done
node scripts/weekly/dump-db.mjs --out /tmp/rr-live-dump.json >/dev/null
[ -z "${FAIL:-}" ] || { echo "live check FAILED"; exit 1; }
echo "shipped ${SHA:0:7} (run $RUN)"
