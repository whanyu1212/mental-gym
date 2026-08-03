SELECT e.staff_name AS employee_name
FROM staff AS e
JOIN staff AS m ON e.manager_id = m.staff_id
WHERE e.salary_cents > m.salary_cents
ORDER BY e.staff_name;
