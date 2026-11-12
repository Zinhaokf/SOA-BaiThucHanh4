CREATE DATABASE IF NOT EXISTS soa_th3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soa_th3;

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity    INT            NOT NULL DEFAULT 0,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price, quantity) VALUES
  ('Laptop Dell XPS 13', 'Laptop mỏng nhẹ, màn hình 13 inch', 25990000.00, 10),
  ('Chuột Logitech MX Master 3', 'Chuột không dây cao cấp', 2490000.00, 50);