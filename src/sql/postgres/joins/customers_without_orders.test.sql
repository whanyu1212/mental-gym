\set ON_ERROR_STOP on
BEGIN;
\ir customers_without_orders.fixture.sql
\ir customers_without_orders.sql
ROLLBACK;
