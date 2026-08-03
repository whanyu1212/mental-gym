WITH numbered AS (
  SELECT
    user_id,
    login_date,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY login_date
    ) AS rn
  FROM logins
),
islands AS (
  SELECT
    user_id,
    login_date,
    julianday(login_date) - rn AS island_key
  FROM numbered
)
SELECT DISTINCT user_id
FROM islands
GROUP BY user_id, island_key
HAVING COUNT(*) >= 3
ORDER BY user_id;
