# SQL Exercises

Each exercise has three files:

- `<problem>.sql` is the answer rendered on the Astro site.
- `<problem>.fixture.sql` creates deterministic local tables and data.
- `<problem>.test.sql` runs the fixture and answer together.

Run PostgreSQL exercises from the repository root:

```bash
brew services start postgresql@17
./scripts/run_postgres_sql.sh src/sql/postgres/joins/customers_without_orders.test.sql
```

Run SQLite exercises from the repository root:

```bash
sqlite3 :memory: < src/sql/sqlite/aggregation/monthly_paid_revenue.test.sql
```

The runner defaults to the local `postgres` database. Override it with `SQL_DATABASE` if you prefer another local database:

```bash
SQL_DATABASE=mental_gym ./scripts/run_postgres_sql.sh src/sql/postgres/joins/customers_without_orders.test.sql
```

Each test runs inside a transaction and rolls back afterward, so the fixtures leave no tables or rows in the database.
