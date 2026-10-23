\set ON_ERROR_STOP on
BEGIN;
\ir customers_without_orders.fixture.sql

\pset format csv
\pset tuples_only on
\o /tmp/mental-gym-customers-without-orders.csv
\ir customers_without_orders.sql
\o
\pset format aligned
\pset tuples_only off

CREATE TEMP TABLE actual (
  customer_id INTEGER,
  customer_name TEXT
);
\copy actual FROM '/tmp/mental-gym-customers-without-orders.csv' WITH (FORMAT csv)
\! rm -f /tmp/mental-gym-customers-without-orders.csv

CREATE TEMP TABLE expected (
  customer_id INTEGER,
  customer_name TEXT
);

INSERT INTO expected (customer_id, customer_name) VALUES
  (2, 'Brianna'),
  (4, 'Darius');

DO $$
BEGIN
  IF EXISTS (
    (
      SELECT customer_id, customer_name FROM actual
      EXCEPT ALL
      SELECT customer_id, customer_name FROM expected
    )
    UNION ALL
    (
      SELECT customer_id, customer_name FROM expected
      EXCEPT ALL
      SELECT customer_id, customer_name FROM actual
    )
  ) THEN
    RAISE EXCEPTION 'customers_without_orders returned unexpected rows';
  END IF;
END
$$;

ROLLBACK;
