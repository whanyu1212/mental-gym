\set ON_ERROR_STOP on
BEGIN;
\ir second_highest_salary_per_department.fixture.sql
\ir second_highest_salary_per_department.sql
ROLLBACK;
