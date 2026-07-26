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
  -- the address the owner copies out of Google Maps, e.g. "KG 7 Ave, Kigali".
  -- the profile page drops it straight into a Google Maps iframe, so anything
  -- Google can find works. NULL simply means "no map on this profile".
  google_address VARCHAR(255),
  -- headcount bracket rather than an exact number, which owners rarely know
  size           ENUM('1-10', '11-50', '51-200', '200+'),
  founded_year   SMALLINT,
  -- a company an owner registered starts as 'pending' and only appears in
  -- search once an admin approves it. Companies added by an admin skip the
  -- queue, which is why the default is 'approved'.
  status         ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  -- kept up to date by the rating engine, stays NULL until the first approved review
  average_rating DECIMAL(2,1),
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- What a company offers its interns: meals, transport money, a laptop, and so
-- on. One row per perk instead of a column per perk, so adding a new perk is a
-- Python change and never a schema change. The allowed names live in
-- backend/app/routes/manage.py (AMENITIES).
CREATE TABLE company_amenities (
  company_id INT NOT NULL,
  amenity    VARCHAR(40) NOT NULL,
  PRIMARY KEY (company_id, amenity),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE internships (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  company_id      INT NOT NULL,
  title           VARCHAR(150) NOT NULL,
  description     TEXT,
  location        VARCHAR(150),
  deadline        DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  -- Pay lives on the posting, not on the company: the same employer can run a
  -- paid engineering internship and an unpaid marketing one at the same time.
  -- 'intern_pays' covers programmes the student is charged for.
  compensation    ENUM('paid', 'stipend', 'unpaid', 'academic_credit', 'intern_pays')
                    NOT NULL DEFAULT 'unpaid',
  stipend_amount  DECIMAL(10,2),
  stipend_currency CHAR(3) NOT NULL DEFAULT 'RWF',
  stipend_period  ENUM('hour', 'week', 'month', 'total'),
  work_mode       ENUM('onsite', 'hybrid', 'remote') NOT NULL DEFAULT 'onsite',
  schedule        ENUM('full_time', 'part_time', 'flexible') NOT NULL DEFAULT 'full_time',
  duration_months TINYINT,
  start_date      DATE,
  openings        SMALLINT NOT NULL DEFAULT 1,
  -- broad area of work, e.g. Engineering, Design, Finance. Used by the filters.
  field           VARCHAR(60),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
  -- Optional, and only ever shown added up. Both questions are skippable on the
  -- review form, and the charts hide themselves when too few people answered,
  -- so a single reviewer can never be picked out of a graph.
  gender      ENUM('female', 'male', 'other', 'prefer_not_to_say'),
  intern_year SMALLINT,
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

-- One-time 6-digit codes for the "forgot password" flow. We store only a HASH
-- of the code (never the code itself), it expires after a few minutes, and it
-- is thrown away once used. attempts caps guessing before a new code is needed.
CREATE TABLE password_reset_codes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  code_hash  VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  attempts   TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

-- A student's saved/bookmarked companies (a shortlist to revisit or compare).
-- One row per (user, company); the unique key stops duplicates.
CREATE TABLE bookmarks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  company_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookmark (user_id, company_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
