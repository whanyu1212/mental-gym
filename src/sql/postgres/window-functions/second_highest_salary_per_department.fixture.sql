DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary_cents INTEGER NOT NULL
);

INSERT INTO employees (employee_id, employee_name, department, salary_cents) VALUES
  (1, 'Ada',    'Engineering', 950000),
  (2, 'Brianna','Engineering', 950000),
  (3, 'Chen',   'Engineering', 880000),
  (4, 'Darius', 'Engineering', 810000),
  (5, 'Elin',   'Sales',       620000),
  (6, 'Farah',  'Sales',       620000),
  (7, 'Gus',    'Design',      700000);
