\set ON_ERROR_STOP on
BEGIN;
\ir employees_outearning_managers.fixture.sql
\ir employees_outearning_managers.sql
ROLLBACK;
