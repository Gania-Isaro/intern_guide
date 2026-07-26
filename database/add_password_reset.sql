-- Adds the "forgot password" (OTP) support to an EXISTING database without
-- touching any of your data. Run it once:
--   mysql -u root internguide < database/add_password_reset.sql
-- (fresh installs get this table from schema.sql already, so they can skip it.)

USE internguide;

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  code_hash  VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  attempts   TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
