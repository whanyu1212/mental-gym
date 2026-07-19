SELECT
  strftime('%Y-%m', placed_at) AS month,
  SUM(amount_cents) AS revenue_cents
FROM purchases
WHERE status = 'paid'
GROUP BY month
ORDER BY month;
