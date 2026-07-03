-- InternGuide database schema (requires MySQL 8.0.16+ for CHECK constraint enforcement)
-- initialize schema: mysql -u root < database/schema.sql (for a full rebuild, drop the database first)

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

CREATE TABLE reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company_id  INT NOT NULL,
  user_id     INT NOT NULL,
  -- the four category scores students rate, 1 to 5 stars each
  mentorship  TINYINT NOT NULL,
  tasks       TINYINT NOT NULL,
  learning    TINYINT NOT NULL,
  environment TINYINT NOT NULL,
  -- overall score, the average of the four categories
  rating      DECIMAL(2,1) NOT NULL,
  comment     TEXT,
  status      ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- one review per student per company
  UNIQUE KEY uq_review_user_company (user_id, company_id),
  CHECK (mentorship BETWEEN 1 AND 5),
  CHECK (tasks BETWEEN 1 AND 5),
  CHECK (learning BETWEEN 1 AND 5),
  CHECK (environment BETWEEN 1 AND 5),
  CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE verification_proofs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  company_id INT NOT NULL,
  -- cleared once the proof is reviewed, the file itself gets deleted for privacy
  file_path  VARCHAR(255),
  status     ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE replies (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  review_id  INT NOT NULL,
  -- the company owner who wrote the reply
  user_id    INT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
