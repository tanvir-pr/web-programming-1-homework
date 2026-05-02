-- Pizza CRUD table for homework (MySQL / MariaDB)
-- Local XAMPP: create DB `webprog1_homework` in phpMyAdmin (or uncomment below), select it, run this file then seed_pizzas.sql.
-- Hosting: use the database name your provider gives you and match it in api/db.php.

-- CREATE DATABASE IF NOT EXISTS webprog1_homework CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE webprog1_homework;

CREATE TABLE IF NOT EXISTS pizzas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pname VARCHAR(255) NOT NULL,
  categoryname VARCHAR(64) NOT NULL,
  vegetarian TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
