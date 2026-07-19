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

if [[ -n "${POSTGRES_BIN:-}" ]]; then
  postgres_bin="$POSTGRES_BIN"
elif command -v brew >/dev/null 2>&1; then
  postgres_bin="$(brew --prefix postgresql@17)/bin"
else
  echo "Set POSTGRES_BIN to your PostgreSQL 17 bin directory." >&2
  exit 1
fi

if [[ ! -x "$postgres_bin/psql" || ! -x "$postgres_bin/pg_isready" ]]; then
  echo "PostgreSQL 17 tools were not found in $postgres_bin." >&2
  exit 1
fi

if ! "$postgres_bin/pg_isready" -q; then
  echo "PostgreSQL 17 is not running. Start it with: brew services start postgresql@17" >&2
  exit 1
fi

exec "$postgres_bin/psql" -v ON_ERROR_STOP=1 -d "${SQL_DATABASE:-postgres}" -f "$test_file"
