-- InternGuide database schema
-- recreate the database from scratch with:  mysql -u root < database/schema.sql

CREATE DATABASE IF NOT EXISTS internguide
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE internguide;

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student', 'company_owner', 'admin') NOT NULL DEFAULT 'student',
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  owner_id       INT,
  name           VARCHAR(150) NOT NULL UNIQUE,
  description    TEXT,
  industry       VARCHAR(100),
  location       VARCHAR(150),
  website        VARCHAR(255),
  -- kept up to date by the rating engine, stays NULL until the first approved review
  average_rating DECIMAL(2,1),
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE internships (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company_id  INT NOT NULL,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  location    VARCHAR(150),
  deadline    DATE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
