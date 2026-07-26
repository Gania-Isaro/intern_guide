-- Adds email verification (an OTP a new account must enter) to an existing DB:
--   mysql -u root internguide < database/add_email_verification.sql
USE internguide;

ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
-- everyone who already has an account is grandfathered in as verified
UPDATE users SET email_verified = TRUE;

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  code_hash  VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  attempts   TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
