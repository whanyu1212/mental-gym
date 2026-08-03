WITH ranked AS (
  SELECT
    department,
    employee_name,
    salary_cents,
    DENSE_RANK() OVER (
      PARTITION BY department
      ORDER BY salary_cents DESC
    ) AS salary_rank
  FROM employees
)
SELECT department, employee_name, salary_cents
FROM ranked
WHERE salary_rank = 2
ORDER BY department;
