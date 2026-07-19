-- V5: phone verification, optional 2FA, and login lockout tracking on
-- users; generalize the password-reset-only OTP table into a
-- purpose-discriminated table shared by registration verification,
-- password reset, and login 2FA.

ALTER TABLE users
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN locked_until TIMESTAMPTZ;

-- Existing accounts predate phone verification — grandfather them in so
-- nobody already registered gets locked out of their own account.
UPDATE users SET phone_verified = TRUE;

ALTER TABLE password_reset_otps RENAME TO otps;

ALTER TABLE otps ADD COLUMN purpose VARCHAR(20) NOT NULL DEFAULT 'PASSWORD_RESET';
ALTER TABLE otps ALTER COLUMN purpose DROP DEFAULT;
ALTER TABLE otps ADD CONSTRAINT otps_purpose_check
    CHECK (purpose IN ('REGISTRATION', 'PASSWORD_RESET', 'LOGIN_2FA'));

ALTER TABLE otps ADD COLUMN attempts INT NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS idx_password_reset_otps_phone;
DROP INDEX IF EXISTS idx_password_reset_otps_user;
CREATE INDEX idx_otps_phone_purpose ON otps(phone_number, purpose);
CREATE INDEX idx_otps_user ON otps(user_id);
