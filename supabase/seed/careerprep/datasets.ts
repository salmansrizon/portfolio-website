/**
 * Shared industry datasets ("worlds"). Each SQL Question references one of
 * these; many questions share a world so candidates build familiarity with a
 * schema the way they would at a real company.
 * All data is fictional; amounts are BDT.
 */

export interface SeedDataset {
  schema_sql: string;
  initial_sql: string;
}

export const datasets: Record<string, SeedDataset> = {
  // ── Fintech: an MFS mobile wallet (bKash/Nagad-style) ──────────────
  fintech_wallet: {
    schema_sql: `CREATE TABLE users (
  user_id INT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  joined_at DATE NOT NULL,
  kyc_verified BOOLEAN NOT NULL
);
CREATE TABLE agents (
  agent_id INT PRIMARY KEY,
  shop_name TEXT NOT NULL,
  district TEXT NOT NULL
);
CREATE TABLE transactions (
  txn_id INT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id),
  agent_id INT REFERENCES agents(agent_id),
  txn_type TEXT NOT NULL, -- 'cash_in' | 'cash_out' | 'send_money' | 'payment'
  amount NUMERIC(12,2) NOT NULL,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  txn_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL -- 'success' | 'failed' | 'reversed'
);`,
    initial_sql: `INSERT INTO users VALUES
  (1,'Rahim Uddin','Dhaka','2025-11-03',true),
  (2,'Karima Akter','Chattogram','2025-12-18',true),
  (3,'Sabbir Hossain','Dhaka','2026-01-25',false),
  (4,'Nusrat Jahan','Sylhet','2026-02-07',true),
  (5,'Tanvir Ahmed','Khulna','2026-02-19',true),
  (6,'Mim Chowdhury','Dhaka','2026-03-12',false),
  (7,'Arif Islam','Rajshahi','2026-04-02',true),
  (8,'Farzana Haque','Chattogram','2026-04-28',true);
INSERT INTO agents VALUES
  (101,'Bhai Bhai Telecom','Dhaka'),
  (102,'Ma Enterprise','Chattogram'),
  (103,'Padma Store','Rajshahi'),
  (104,'Digital Point','Dhaka');
INSERT INTO transactions VALUES
  (1001,1,101,'cash_in',5000.00,0,'2026-06-01 09:15:00','success'),
  (1002,1,NULL,'send_money',1200.00,5.00,'2026-06-01 12:40:00','success'),
  (1003,2,102,'cash_in',8000.00,0,'2026-06-02 10:05:00','success'),
  (1004,2,102,'cash_out',3000.00,55.50,'2026-06-03 16:22:00','success'),
  (1005,3,101,'cash_in',2000.00,0,'2026-06-03 18:30:00','success'),
  (1006,3,NULL,'payment',450.00,0,'2026-06-04 11:00:00','success'),
  (1007,4,NULL,'send_money',2500.00,10.00,'2026-06-04 14:45:00','failed'),
  (1008,4,NULL,'send_money',2500.00,10.00,'2026-06-04 14:52:00','success'),
  (1009,5,104,'cash_in',12000.00,0,'2026-06-05 09:00:00','success'),
  (1010,5,104,'cash_out',7000.00,129.50,'2026-06-05 19:10:00','success'),
  (1011,1,NULL,'payment',890.00,0,'2026-06-06 08:20:00','success'),
  (1012,6,101,'cash_in',1500.00,0,'2026-06-06 13:33:00','success'),
  (1013,6,NULL,'send_money',700.00,5.00,'2026-06-07 10:11:00','reversed'),
  (1014,7,103,'cash_in',6000.00,0,'2026-06-07 15:55:00','success'),
  (1015,7,103,'cash_out',2000.00,37.00,'2026-06-08 09:47:00','success'),
  (1016,8,102,'cash_in',9500.00,0,'2026-06-08 11:28:00','success'),
  (1017,8,NULL,'payment',1250.00,0,'2026-06-09 17:05:00','success'),
  (1018,2,NULL,'send_money',4000.00,10.00,'2026-06-10 12:00:00','success'),
  (1019,5,NULL,'payment',3200.00,0,'2026-06-10 20:15:00','success'),
  (1020,1,101,'cash_out',2500.00,46.25,'2026-06-11 10:30:00','success'),
  (1021,4,102,'cash_in',3000.00,0,'2026-06-11 14:00:00','success'),
  (1022,7,NULL,'send_money',900.00,5.00,'2026-06-12 09:05:00','success'),
  (1023,8,102,'cash_out',5000.00,92.50,'2026-06-12 18:40:00','failed'),
  (1024,8,102,'cash_out',5000.00,92.50,'2026-06-12 18:47:00','success');`,
  },

  // ── E-Commerce: an online shop (Daraz-style) ───────────────────────
  ecommerce_shop: {
    schema_sql: `CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  signup_date DATE NOT NULL
);
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  order_date DATE NOT NULL,
  status TEXT NOT NULL -- 'delivered' | 'cancelled' | 'returned' | 'processing'
);
CREATE TABLE order_items (
  order_id INT NOT NULL REFERENCES orders(order_id),
  product_id INT NOT NULL REFERENCES products(product_id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);`,
    initial_sql: `INSERT INTO customers VALUES
  (1,'Shorna Rahman','Dhaka','2025-10-11'),
  (2,'Imran Kabir','Chattogram','2025-12-02'),
  (3,'Priya Das','Dhaka','2026-01-15'),
  (4,'Rakib Hasan','Sylhet','2026-02-20'),
  (5,'Lamia Islam','Khulna','2026-03-08'),
  (6,'Fahim Chowdhury','Dhaka','2026-04-19');
INSERT INTO products VALUES
  (11,'Wireless Earbuds','Electronics',2490.00),
  (12,'Cotton Panjabi','Fashion',1850.00),
  (13,'Blender 500W','Home Appliance',3200.00),
  (14,'Yoga Mat','Sports',990.00),
  (15,'Power Bank 20000mAh','Electronics',1750.00),
  (16,'Deshi Cotton Saree','Fashion',2950.00),
  (17,'LED Desk Lamp','Home Appliance',780.00),
  (18,'Gaming Mouse','Electronics',1450.00);
INSERT INTO orders VALUES
  (501,1,'2026-05-02','delivered'),
  (502,2,'2026-05-04','delivered'),
  (503,1,'2026-05-10','returned'),
  (504,3,'2026-05-12','delivered'),
  (505,4,'2026-05-15','cancelled'),
  (506,5,'2026-05-18','delivered'),
  (507,3,'2026-05-21','delivered'),
  (508,6,'2026-05-25','processing'),
  (509,2,'2026-06-01','delivered'),
  (510,1,'2026-06-05','delivered');
INSERT INTO order_items VALUES
  (501,11,1,2490.00),(501,14,2,990.00),
  (502,12,1,1850.00),
  (503,13,1,3200.00),
  (504,15,2,1750.00),(504,17,1,780.00),
  (505,16,1,2950.00),
  (506,11,1,2490.00),(506,15,1,1750.00),
  (507,14,1,990.00),(507,17,2,780.00),
  (508,13,1,3200.00),
  (509,16,2,2950.00),(509,12,1,1850.00),
  (510,15,1,1750.00);`,
  },

  // ── Logistics: a courier network (Pathao/RedX-style) ───────────────
  logistics_courier: {
    schema_sql: `CREATE TABLE hubs (
  hub_id INT PRIMARY KEY,
  city TEXT NOT NULL
);
CREATE TABLE riders (
  rider_id INT PRIMARY KEY,
  name TEXT NOT NULL,
  hub_id INT NOT NULL REFERENCES hubs(hub_id)
);
CREATE TABLE parcels (
  parcel_id INT PRIMARY KEY,
  sender_area TEXT NOT NULL,
  receiver_area TEXT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL,
  cod_amount NUMERIC(10,2) NOT NULL, -- cash on delivery, 0 = prepaid
  created_at TIMESTAMP NOT NULL
);
CREATE TABLE deliveries (
  delivery_id INT PRIMARY KEY,
  parcel_id INT NOT NULL REFERENCES parcels(parcel_id),
  rider_id INT NOT NULL REFERENCES riders(rider_id),
  picked_at TIMESTAMP NOT NULL,
  delivered_at TIMESTAMP, -- NULL = not delivered yet
  status TEXT NOT NULL -- 'delivered' | 'in_transit' | 'failed'
);`,
    initial_sql: `INSERT INTO hubs VALUES (1,'Dhaka'),(2,'Chattogram'),(3,'Sylhet');
INSERT INTO riders VALUES
  (21,'Jashim Uddin',1),(22,'Selim Reza',1),(23,'Polash Mia',2),
  (24,'Hridoy Khan',2),(25,'Shuvo Roy',3);
INSERT INTO parcels VALUES
  (301,'Uttara','Dhanmondi',1.20,1500.00,'2026-06-01 08:00:00'),
  (302,'Banani','Mirpur',0.50,0,'2026-06-01 09:30:00'),
  (303,'Agrabad','Nasirabad',2.80,3200.00,'2026-06-01 10:15:00'),
  (304,'Gulshan','Uttara',0.90,850.00,'2026-06-02 08:45:00'),
  (305,'Zindabazar','Ambarkhana',1.50,2100.00,'2026-06-02 11:20:00'),
  (306,'Dhanmondi','Banani',3.40,0,'2026-06-03 09:00:00'),
  (307,'Mirpur','Gulshan',0.75,650.00,'2026-06-03 14:30:00'),
  (308,'Nasirabad','Agrabad',1.10,1200.00,'2026-06-04 10:00:00'),
  (309,'Uttara','Mirpur',2.00,1800.00,'2026-06-04 15:45:00'),
  (310,'Ambarkhana','Zindabazar',0.60,0,'2026-06-05 09:10:00');
INSERT INTO deliveries VALUES
  (401,301,21,'2026-06-01 10:00:00','2026-06-01 15:30:00','delivered'),
  (402,302,22,'2026-06-01 11:00:00','2026-06-01 13:45:00','delivered'),
  (403,303,23,'2026-06-01 12:30:00','2026-06-02 17:00:00','delivered'),
  (404,304,21,'2026-06-02 10:30:00','2026-06-02 14:20:00','delivered'),
  (405,305,25,'2026-06-02 13:00:00',NULL,'in_transit'),
  (406,306,22,'2026-06-03 11:00:00','2026-06-04 10:30:00','delivered'),
  (407,307,21,'2026-06-03 16:00:00',NULL,'failed'),
  (408,307,22,'2026-06-04 09:00:00','2026-06-04 12:15:00','delivered'),
  (409,308,24,'2026-06-04 11:30:00','2026-06-04 18:40:00','delivered'),
  (410,309,21,'2026-06-05 08:30:00',NULL,'in_transit'),
  (411,310,25,'2026-06-05 10:00:00','2026-06-05 12:00:00','delivered');`,
  },

  // ── Telco: a mobile operator (GP/Robi-style) ───────────────────────
  telco_network: {
    schema_sql: `CREATE TABLE plans (
  plan_id INT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_fee NUMERIC(8,2) NOT NULL,
  data_gb INT NOT NULL
);
CREATE TABLE subscribers (
  sub_id INT PRIMARY KEY,
  name TEXT NOT NULL,
  plan_id INT NOT NULL REFERENCES plans(plan_id),
  activated_on DATE NOT NULL,
  district TEXT NOT NULL
);
CREATE TABLE recharges (
  recharge_id INT PRIMARY KEY,
  sub_id INT NOT NULL REFERENCES subscribers(sub_id),
  amount NUMERIC(8,2) NOT NULL,
  recharged_at TIMESTAMP NOT NULL
);
CREATE TABLE usage_daily (
  sub_id INT NOT NULL REFERENCES subscribers(sub_id),
  usage_date DATE NOT NULL,
  data_mb INT NOT NULL,
  voice_min INT NOT NULL,
  PRIMARY KEY (sub_id, usage_date)
);`,
    initial_sql: `INSERT INTO plans VALUES
  (1,'Bondhu 199',199.00,5),(2,'Shadhin 349',349.00,15),
  (3,'Power 599',599.00,40),(4,'Business 999',999.00,100);
INSERT INTO subscribers VALUES
  (61,'Mahmud Hasan',1,'2025-09-14','Dhaka'),
  (62,'Rima Sultana',2,'2025-11-30','Chattogram'),
  (63,'Joy Barua',2,'2026-01-08','Chattogram'),
  (64,'Sadia Afrin',3,'2026-02-14','Dhaka'),
  (65,'Nayeem Islam',1,'2026-03-22','Rajshahi'),
  (66,'Tania Akter',4,'2026-04-05','Dhaka');
INSERT INTO recharges VALUES
  (901,61,199.00,'2026-06-01 08:00:00'),
  (902,62,349.00,'2026-06-01 09:30:00'),
  (903,63,100.00,'2026-06-02 12:00:00'),
  (904,63,249.00,'2026-06-03 10:15:00'),
  (905,64,599.00,'2026-06-03 18:20:00'),
  (906,65,199.00,'2026-06-04 11:00:00'),
  (907,66,999.00,'2026-06-05 09:45:00'),
  (908,61,50.00,'2026-06-08 20:30:00'),
  (909,62,100.00,'2026-06-10 14:10:00');
INSERT INTO usage_daily VALUES
  (61,'2026-06-01',350,22),(61,'2026-06-02',420,15),(61,'2026-06-03',180,40),
  (62,'2026-06-01',900,10),(62,'2026-06-02',1150,8),(62,'2026-06-03',600,25),
  (63,'2026-06-01',450,30),(63,'2026-06-02',380,45),(63,'2026-06-03',720,12),
  (64,'2026-06-01',2100,5),(64,'2026-06-02',1800,18),(64,'2026-06-03',2500,7),
  (65,'2026-06-01',120,60),(65,'2026-06-02',90,75),(65,'2026-06-03',200,55),
  (66,'2026-06-01',3400,20),(66,'2026-06-02',4100,35),(66,'2026-06-03',2900,28);`,
  },
};
