DROP TABLE IF EXISTS logins;

CREATE TABLE logins (
  user_id INTEGER NOT NULL,
  login_date TEXT NOT NULL
);

INSERT INTO logins (user_id, login_date) VALUES
  (1, '2026-01-01'),
  (1, '2026-01-02'),
  (1, '2026-01-03'),
  (1, '2026-01-05'),
  (2, '2026-01-01'),
  (2, '2026-01-03'),
  (2, '2026-01-04'),
  (3, '2026-01-01'),
  (3, '2026-01-02'),
  (3, '2026-01-03'),
  (3, '2026-01-04');
