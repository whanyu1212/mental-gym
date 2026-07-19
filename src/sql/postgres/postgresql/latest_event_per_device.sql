SELECT DISTINCT ON (device_id)
  device_id,
  event_type
FROM device_events
ORDER BY device_id, occurred_at DESC, event_id DESC;
