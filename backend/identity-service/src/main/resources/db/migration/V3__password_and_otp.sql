-- Switch from PIN to password-based auth and add OTP reset support.
ALTER TABLE users RENAME COLUMN pin_hash TO password_hash;

CREATE TABLE password_reset_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(15) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_otps_phone ON password_reset_otps(phone_number);
CREATE INDEX idx_password_reset_otps_user ON password_reset_otps(user_id);
