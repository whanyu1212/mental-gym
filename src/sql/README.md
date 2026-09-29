# SQL Exercises

Each exercise has three files:

- `<problem>.sql` is the answer rendered on the Astro site.
- `<problem>.fixture.sql` creates deterministic local tables and data.
- `<problem>.test.sql` runs the fixture and answer together.

Run PostgreSQL exercises with a local PostgreSQL 17 installation from the repository root:

```bash
brew services start postgresql@17
./scripts/run_postgres_sql.sh src/sql/postgres/joins/customers_without_orders.test.sql
```

The runner looks for PostgreSQL 17 client tools in this order:

1. The directory named by `POSTGRES_BIN`.
2. `psql` and `pg_isready` on `PATH`.
3. Homebrew's `postgresql@17` installation.

For a reproducible container workflow, start the repository's PostgreSQL 17 service and run a test inside it:

```bash
docker compose -f compose.sql.yml up --detach --wait
docker compose -f compose.sql.yml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -f src/sql/postgres/joins/customers_without_orders.test.sql
docker compose -f compose.sql.yml down
```

The Compose file pins PostgreSQL 17.11 by image digest. It mounts `src/sql` read-only and keeps database data in temporary memory. Its data is discarded when the container stops, so each new container starts from a clean database. Tests run inside the container, so this workflow does not conflict with a PostgreSQL server already using port 5432 on the host.

Run SQLite exercises from the repository root:

```bash
sqlite3 -bail :memory: < src/sql/sqlite/aggregation/monthly_paid_revenue.test.sql
```

The native runner defaults to the local `postgres` database. Override it with `SQL_DATABASE` if you prefer another local database. Standard libpq variables such as `PGHOST`, `PGPORT`, and `PGUSER` also work:

```bash
PGHOST=127.0.0.1 SQL_DATABASE=mental_gym \
  ./scripts/run_postgres_sql.sh src/sql/postgres/joins/customers_without_orders.test.sql
```

Each test runs inside a transaction and rolls back afterward, so the fixtures leave no tables or rows in the database.
