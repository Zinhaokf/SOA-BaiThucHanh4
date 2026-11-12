CREATE DATABASE IF NOT EXISTS soa_th4 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soa_th4;

CREATE TABLE IF NOT EXISTS orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  customer_name  VARCHAR(255)   NOT NULL,
  customer_email VARCHAR(255)   NOT NULL,
  total_amount   DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status         VARCHAR(50)    NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT            NOT NULL,
  product_id   INT            NOT NULL,
  product_name VARCHAR(255)   NOT NULL,
  quantity     INT            NOT NULL,
  unit_price   DECIMAL(10, 2) NOT NULL,
  total_price  DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO orders (customer_name, customer_email, total_amount, status) VALUES
  ('Nguyễn Văn A', 'a@example.com', 30970000.00, 'pending');

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
  (1, 1, 'Laptop Dell XPS 13', 1, 25990000.00, 25990000.00),
  (1, 2, 'Chuột Logitech MX Master 3', 2, 2490000.00, 4980000.00);
