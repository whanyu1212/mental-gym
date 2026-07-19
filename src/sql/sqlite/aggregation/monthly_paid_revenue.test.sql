BEGIN;
.read src/sql/sqlite/aggregation/monthly_paid_revenue.fixture.sql
.read src/sql/sqlite/aggregation/monthly_paid_revenue.sql
ROLLBACK;
