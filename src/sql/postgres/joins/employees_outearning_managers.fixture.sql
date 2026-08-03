DROP TABLE IF EXISTS staff;

CREATE TABLE staff (
  staff_id INTEGER PRIMARY KEY,
  staff_name TEXT NOT NULL,
  salary_cents INTEGER NOT NULL,
  manager_id INTEGER REFERENCES staff(staff_id)
);

INSERT INTO staff (staff_id, staff_name, salary_cents, manager_id) VALUES
  (1, 'Joe',   500000, 3),
  (2, 'Ling',  480000, 3),
  (3, 'Sam',   450000, NULL),
  (4, 'Priya', 700000, 3),
  (5, 'Owen',  400000, NULL);
