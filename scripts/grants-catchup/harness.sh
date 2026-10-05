#!/usr/bin/env bash
# Replay harness for the grants catch-up under SIMULATED post-2026-10-30 defaults.
#
#   scripts/grants-catchup/harness.sh            replay all migrations, catch-up included
#   scripts/grants-catchup/harness.sh --without  replay all migrations except the catch-up
#
# Starts a throwaway supabase/postgres container (no published ports), removes
# the Data API default privileges the 10-30 change removes, replays
# supabase/migrations in order as postgres, then runs verify-noop.sql against
# the replay. 0 rows means the replay holds exactly the in-scope prod grants.
# With --without, the rows are what a replay would lose today. The container is
# always removed on exit. Nothing here talks to a hosted project.
set -euo pipefail
cd "$(dirname "$0")/../.."
IMAGE="${GRANTS_HARNESS_IMAGE:-public.ecr.aws/supabase/postgres:17.6.1.042}"
NAME="grants-harness-$$"
WITHOUT=0; [[ "${1:-}" == "--without" ]] && WITHOUT=1
CATCHUP=$(ls supabase/migrations/*_explicit_data_api_grants_catchup.sql)

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --name "$NAME" -e POSTGRES_PASSWORD=postgres "$IMAGE" >/dev/null
for _ in $(seq 1 60); do
  docker exec "$NAME" pg_isready -U postgres -h localhost >/dev/null 2>&1 && docker exec "$NAME" psql -U postgres -h localhost -tAc 'select 1' >/dev/null 2>&1 && break
  sleep 2
done
psql_as() { local u=$1; shift; docker exec -i -e PGOPTIONS="-c client_min_messages=warning" "$NAME" psql -v ON_ERROR_STOP=1 -q -U "$u" -h localhost -d postgres "$@"; }

# Simulate the change: no automatic Data API grants on new public objects.
psql_as supabase_admin <<'SQL'
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema public revoke all on tables from anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema public revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema public revoke all on functions from anon, authenticated, service_role;
SQL

for f in supabase/migrations/*.sql; do
  [[ $WITHOUT == 1 && "$f" == "$CATCHUP" ]] && continue
  if ! psql_as postgres < "$f" >/dev/null; then
    echo "REPLAY FAILED at $f (pre-existing migration-history problem, not the catch-up)"; exit 3
  fi
done
echo "replayed $(ls supabase/migrations/*.sql | wc -l | tr -d ' ') files$([[ $WITHOUT == 1 ]] && echo ', catch-up skipped')"
rows=$(psql_as postgres -tA < scripts/grants-catchup/verify-noop.sql)
echo "$rows" | sed '/^$/d'
n=$(echo "$rows" | sed '/^$/d' | wc -l | tr -d ' ')
echo "$n verify row(s) against the replay"
[[ $n == 0 ]]
