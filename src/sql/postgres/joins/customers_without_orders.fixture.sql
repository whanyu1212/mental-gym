DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  total_cents INTEGER NOT NULL
);

INSERT INTO customers (customer_id, customer_name) VALUES
  (1, 'Ada'),
  (2, 'Brianna'),
  (3, 'Chen'),
  (4, 'Darius');

INSERT INTO orders (order_id, customer_id, total_cents) VALUES
  (101, 1, 2400),
  (102, 1, 1800),
  (103, 3, 990);
