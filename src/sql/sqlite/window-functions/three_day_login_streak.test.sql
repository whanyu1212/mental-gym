BEGIN;
.read src/sql/sqlite/window-functions/three_day_login_streak.fixture.sql
.read src/sql/sqlite/window-functions/three_day_login_streak.sql
ROLLBACK;
