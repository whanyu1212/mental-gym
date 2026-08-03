DROP TABLE IF EXISTS logins;

CREATE TABLE logins (
  user_id INTEGER NOT NULL,
  login_date TEXT NOT NULL
);

INSERT INTO logins (user_id, login_date) VALUES
  -- User 1: a 3-day run, then a gap. Logs in twice on 01-02, which must still
  -- count as a single day of the streak.
  (1, '2026-01-01'),
  (1, '2026-01-02'),
  (1, '2026-01-02'),
  (1, '2026-01-03'),
  (1, '2026-01-05'),
  -- User 2: three logins, but never three consecutive days.
  (2, '2026-01-01'),
  (2, '2026-01-03'),
  (2, '2026-01-04'),
  -- User 3: a 4-day run, so "at least 3" must not mean "exactly 3".
  (3, '2026-01-01'),
  (3, '2026-01-02'),
  (3, '2026-01-03'),
  (3, '2026-01-04'),
  -- User 4: three rows on one calendar day is not a 3-day streak.
  (4, '2026-01-01'),
  (4, '2026-01-01'),
  (4, '2026-01-01');
