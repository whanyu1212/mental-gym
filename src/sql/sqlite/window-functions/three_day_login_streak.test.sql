.bail on
BEGIN;
.read src/sql/sqlite/window-functions/three_day_login_streak.fixture.sql
.headers off
.mode csv
.once /tmp/mental-gym-three-day-login-streak.csv
.read src/sql/sqlite/window-functions/three_day_login_streak.sql

CREATE TEMP TABLE actual (user_id INTEGER);
.import /tmp/mental-gym-three-day-login-streak.csv actual
.shell rm -f /tmp/mental-gym-three-day-login-streak.csv

CREATE TEMP TABLE expected (user_id INTEGER);

INSERT INTO expected (user_id) VALUES
  (1),
  (3);

CREATE TEMP TABLE assertion (
  matches INTEGER CHECK (matches = 1)
);

INSERT INTO assertion (matches)
SELECT
  NOT EXISTS (
    SELECT user_id FROM actual
    EXCEPT
    SELECT user_id FROM expected
  )
  AND NOT EXISTS (
    SELECT user_id FROM expected
    EXCEPT
    SELECT user_id FROM actual
  )
  AND (SELECT COUNT(*) FROM actual) = (SELECT COUNT(*) FROM expected);

ROLLBACK;
