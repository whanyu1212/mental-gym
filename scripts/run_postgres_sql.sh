#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <test-file.sql>" >&2
  exit 1
fi

test_file="$1"
if [[ ! -f "$test_file" ]]; then
  echo "SQL test file not found: $test_file" >&2
  exit 1
fi

psql_command=""
pg_isready_command=""
discovery_error=""

is_postgres_17() {
  local version
  version="$("$1" --version 2>/dev/null)" || return 1
  [[ "$version" =~ PostgreSQL[^0-9]*17([.][0-9]+)?([^0-9]|$) ]]
}

if [[ -n "${POSTGRES_BIN:-}" ]]; then
  postgres_bin="${POSTGRES_BIN%/}"
  psql_command="$postgres_bin/psql"
  pg_isready_command="$postgres_bin/pg_isready"
elif psql_path="$(command -v psql 2>/dev/null)" &&
  pg_isready_path="$(command -v pg_isready 2>/dev/null)" &&
  is_postgres_17 "$psql_path"; then
  psql_command="$psql_path"
  pg_isready_command="$pg_isready_path"
elif command -v brew >/dev/null 2>&1 &&
  brew_prefix="$(brew --prefix postgresql@17 2>/dev/null)"; then
  psql_command="$brew_prefix/bin/psql"
  pg_isready_command="$brew_prefix/bin/pg_isready"
else
  if [[ -n "${psql_path:-}" ]]; then
    discovery_error=" Found $("$psql_path" --version 2>/dev/null || printf 'an unusable psql') on PATH."
  fi
  echo "PostgreSQL 17 client tools were not found.${discovery_error}" >&2
  echo "Set POSTGRES_BIN to the PostgreSQL 17 bin directory or add it to PATH." >&2
  exit 1
fi

if [[ ! -x "$psql_command" || ! -x "$pg_isready_command" ]]; then
  echo "PostgreSQL client tools were not found at the selected location." >&2
  echo "Expected executable psql and pg_isready commands." >&2
  exit 1
fi

if ! is_postgres_17 "$psql_command"; then
  echo "PostgreSQL 17 is required; found: $("$psql_command" --version 2>/dev/null || printf 'unknown version')" >&2
  exit 1
fi

sql_database="${SQL_DATABASE:-postgres}"
if ! "$pg_isready_command" -q -d "$sql_database"; then
  echo "PostgreSQL is not accepting connections for database '$sql_database'." >&2
  echo "Check PGHOST, PGPORT, and PGUSER, or start the SQL container documented in src/sql/README.md." >&2
  exit 1
fi

exec "$psql_command" -v ON_ERROR_STOP=1 -d "$sql_database" -f "$test_file"
