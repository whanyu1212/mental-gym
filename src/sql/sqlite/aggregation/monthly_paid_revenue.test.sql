.bail on
BEGIN;
.read src/sql/sqlite/aggregation/monthly_paid_revenue.fixture.sql
.headers off
.mode csv
.once /tmp/mental-gym-monthly-paid-revenue.csv
.read src/sql/sqlite/aggregation/monthly_paid_revenue.sql

CREATE TEMP TABLE actual (
  month TEXT,
  revenue_cents INTEGER
);
.import /tmp/mental-gym-monthly-paid-revenue.csv actual
.shell rm -f /tmp/mental-gym-monthly-paid-revenue.csv

CREATE TEMP TABLE expected (
  month TEXT,
  revenue_cents INTEGER
);

INSERT INTO expected (month, revenue_cents) VALUES
  ('2026-01', 4100),
  ('2026-02', 2800);

CREATE TEMP TABLE assertion (
  matches INTEGER CHECK (matches = 1)
);

INSERT INTO assertion (matches)
SELECT
  NOT EXISTS (
    SELECT month, revenue_cents FROM actual
    EXCEPT
    SELECT month, revenue_cents FROM expected
  )
  AND NOT EXISTS (
    SELECT month, revenue_cents FROM expected
    EXCEPT
    SELECT month, revenue_cents FROM actual
  )
  AND (SELECT COUNT(*) FROM actual) = (SELECT COUNT(*) FROM expected);

ROLLBACK;
