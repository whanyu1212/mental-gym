\set ON_ERROR_STOP on
BEGIN;
\ir employees_outearning_managers.fixture.sql

\pset format csv
\pset tuples_only on
\o /tmp/mental-gym-employees-outearning-managers.csv
\ir employees_outearning_managers.sql
\o
\pset format aligned
\pset tuples_only off

CREATE TEMP TABLE actual (employee_name TEXT);
\copy actual FROM '/tmp/mental-gym-employees-outearning-managers.csv' WITH (FORMAT csv)
\! rm -f /tmp/mental-gym-employees-outearning-managers.csv

CREATE TEMP TABLE expected (employee_name TEXT);

INSERT INTO expected (employee_name) VALUES
  ('Joe'),
  ('Ling'),
  ('Priya');

DO $$
BEGIN
  IF EXISTS (
    (
      SELECT employee_name FROM actual
      EXCEPT ALL
      SELECT employee_name FROM expected
    )
    UNION ALL
    (
      SELECT employee_name FROM expected
      EXCEPT ALL
      SELECT employee_name FROM actual
    )
  ) THEN
    RAISE EXCEPTION 'employees_outearning_managers returned unexpected rows';
  END IF;
END
$$;

ROLLBACK;
