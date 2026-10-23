\set ON_ERROR_STOP on
BEGIN;
\ir latest_event_per_device.fixture.sql

\pset format csv
\pset tuples_only on
\o /tmp/mental-gym-latest-event-per-device.csv
\ir latest_event_per_device.sql
\o
\pset format aligned
\pset tuples_only off

CREATE TEMP TABLE actual (
  device_id TEXT,
  event_type TEXT
);
\copy actual FROM '/tmp/mental-gym-latest-event-per-device.csv' WITH (FORMAT csv)
\! rm -f /tmp/mental-gym-latest-event-per-device.csv

CREATE TEMP TABLE expected (
  device_id TEXT,
  event_type TEXT
);

INSERT INTO expected (device_id, event_type) VALUES
  ('sensor-a', 'offline'),
  ('sensor-b', 'online'),
  ('sensor-c', 'maintenance');

DO $$
BEGIN
  IF EXISTS (
    (
      SELECT device_id, event_type FROM actual
      EXCEPT ALL
      SELECT device_id, event_type FROM expected
    )
    UNION ALL
    (
      SELECT device_id, event_type FROM expected
      EXCEPT ALL
      SELECT device_id, event_type FROM actual
    )
  ) THEN
    RAISE EXCEPTION 'latest_event_per_device returned unexpected rows';
  END IF;
END
$$;

ROLLBACK;
