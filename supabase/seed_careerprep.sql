INSERT INTO careerprep_questions (title, slug, difficulty, industry, content_md, schema_sql, initial_sql, solution_sql, success_rate)
VALUES
(
  'Top 5 Merchants by Cash Out Volume',
  'top-merchants-cashout',
  'Medium',
  'Fintech (MFS)',
  '### Problem Description
You are working as a Data Analyst for a prominent MFS in Bangladesh.
Find the top merchants with the highest ''Cash Out'' volume.

**Task:**
Write a query to return the `merchant_id` and the total cash out `amount` as `total_volume`.

**Hint:** Group by the merchant and filter where type is ''Cash Out''.',
  'CREATE TABLE transactions (
  id int,
  merchant_id int,
  amount decimal,
  type varchar,
  created_at timestamp
);',
  'CREATE TABLE IF NOT EXISTS transactions (id int, merchant_id int, amount decimal, type varchar, created_at timestamp);
INSERT INTO transactions VALUES (1, 101, 500, ''Cash Out'', now());
INSERT INTO transactions VALUES (2, 102, 1200, ''Cash Out'', now());
INSERT INTO transactions VALUES (3, 101, 800, ''Cash Out'', now());
INSERT INTO transactions VALUES (4, 103, 200, ''Payment'', now());
INSERT INTO transactions VALUES (5, 104, 2500, ''Cash Out'', now());',
  'SELECT merchant_id, SUM(amount) AS total_volume FROM transactions WHERE type = ''Cash Out'' GROUP BY merchant_id ORDER BY total_volume DESC LIMIT 5;',
  64
),
(
  'Top Performing Delivery Riders',
  'top-delivery-riders',
  'Easy',
  'Logistics',
  '### Problem Description
You are an operations analyst at a major logistics company (like Pathao or eCourier).
Your manager wants to reward the riders who completed the most deliveries successfully.

**Task:**
Write an SQL query to find the `rider_id` and the count of their successfully delivered orders (call it `deliveries`), ordered from most to least.',
  'CREATE TABLE orders (
  order_id int,
  rider_id int,
  status varchar,
  delivery_date date
);',
  'CREATE TABLE IF NOT EXISTS orders (order_id int, rider_id int, status varchar, delivery_date date);
INSERT INTO orders VALUES (1001, 50, ''Delivered'', ''2023-10-01'');
INSERT INTO orders VALUES (1002, 50, ''Delivered'', ''2023-10-01'');
INSERT INTO orders VALUES (1003, 51, ''Cancelled'', ''2023-10-01'');
INSERT INTO orders VALUES (1004, 52, ''Delivered'', ''2023-10-01'');
INSERT INTO orders VALUES (1005, 52, ''Delivered'', ''2023-10-01'');
INSERT INTO orders VALUES (1006, 52, ''Delivered'', ''2023-10-01'');',
  'SELECT rider_id, COUNT(*) AS deliveries FROM orders WHERE status = ''Delivered'' GROUP BY rider_id ORDER BY deliveries DESC;',
  82
),
(
  'E-commerce High-Value Defaulters',
  'ecommerce-unpaid-big-spenders',
  'Hard',
  'E-commerce',
  '### Problem Description
At a local e-commerce giant, Finance needs to track down customers who have large Unpaid orders blocking up inventory.

**Task:**
Find all customers who have at least one order with `status` = ''Unpaid'' where the `total_amount` is greater than 10,000 BDT. Return their `customer_id`, `name`, and the `total_amount`.',
  'CREATE TABLE customers (
  customer_id int,
  name varchar
);
CREATE TABLE cart_orders (
  order_id int,
  customer_id int,
  total_amount decimal,
  status varchar
);',
  'CREATE TABLE IF NOT EXISTS customers (customer_id int, name varchar);
CREATE TABLE IF NOT EXISTS cart_orders (order_id int, customer_id int, total_amount decimal, status varchar);
INSERT INTO customers VALUES (1, ''Rahim'');
INSERT INTO customers VALUES (2, ''Karim'');
INSERT INTO customers VALUES (3, ''Salma'');
INSERT INTO cart_orders VALUES (101, 1, 15000, ''Unpaid'');
INSERT INTO cart_orders VALUES (102, 1,  5000, ''Paid'');
INSERT INTO cart_orders VALUES (103, 2, 12000, ''Paid'');
INSERT INTO cart_orders VALUES (104, 3, 25000, ''Unpaid'');',
  'SELECT c.customer_id, c.name, o.total_amount FROM customers c JOIN cart_orders o ON c.customer_id = o.customer_id WHERE o.status = ''Unpaid'' AND o.total_amount > 10000;',
  31
);
