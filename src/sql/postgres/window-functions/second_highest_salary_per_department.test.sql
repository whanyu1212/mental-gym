\set ON_ERROR_STOP on
BEGIN;
\ir second_highest_salary_per_department.fixture.sql

\pset format csv
\pset tuples_only on
\o /tmp/mental-gym-second-highest-salary-per-department.csv
\ir second_highest_salary_per_department.sql
\o
\pset format aligned
\pset tuples_only off

CREATE TEMP TABLE actual (
  department TEXT,
  employee_name TEXT,
  salary_cents INTEGER
);
\copy actual FROM '/tmp/mental-gym-second-highest-salary-per-department.csv' WITH (FORMAT csv)
\! rm -f /tmp/mental-gym-second-highest-salary-per-department.csv

CREATE TEMP TABLE expected (
  department TEXT,
  employee_name TEXT,
  salary_cents INTEGER
);

INSERT INTO expected (department, employee_name, salary_cents) VALUES
  ('Engineering', 'Chen', 880000);

DO $$
BEGIN
  IF EXISTS (
    (
      SELECT department, employee_name, salary_cents FROM actual
      EXCEPT ALL
      SELECT department, employee_name, salary_cents FROM expected
    )
    UNION ALL
    (
      SELECT department, employee_name, salary_cents FROM expected
      EXCEPT ALL
      SELECT department, employee_name, salary_cents FROM actual
    )
  ) THEN
    RAISE EXCEPTION 'second_highest_salary_per_department returned unexpected rows';
  END IF;
END
$$;

ROLLBACK;
