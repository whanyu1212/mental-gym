\set ON_ERROR_STOP on
BEGIN;
\ir latest_event_per_device.fixture.sql
\ir latest_event_per_device.sql
ROLLBACK;
