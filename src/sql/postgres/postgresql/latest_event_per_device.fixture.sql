DROP TABLE IF EXISTS device_events;

CREATE TABLE device_events (
  event_id INTEGER PRIMARY KEY,
  device_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMP NOT NULL
);

INSERT INTO device_events (event_id, device_id, event_type, occurred_at) VALUES
  (1, 'sensor-a', 'online', '2026-01-04 09:00:00'),
  (2, 'sensor-a', 'offline', '2026-01-04 10:15:00'),
  (3, 'sensor-b', 'online', '2026-01-04 08:45:00'),
  (4, 'sensor-b', 'offline', '2026-01-04 08:45:00'),
  (5, 'sensor-b', 'online', '2026-01-04 08:45:00'),
  (6, 'sensor-c', 'maintenance', '2026-01-05 11:30:00');
