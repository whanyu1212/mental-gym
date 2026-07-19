DROP TABLE IF EXISTS purchases;

CREATE TABLE purchases (
  purchase_id INTEGER PRIMARY KEY,
  placed_at TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);

INSERT INTO purchases (purchase_id, placed_at, status, amount_cents) VALUES
  (1, '2026-01-03 12:00:00', 'paid', 1200),
  (2, '2026-01-08 09:30:00', 'pending', 990),
  (3, '2026-01-26 18:45:00', 'paid', 2900),
  (4, '2026-02-02 14:15:00', 'paid', 2800),
  (5, '2026-02-18 10:05:00', 'refunded', 700);
