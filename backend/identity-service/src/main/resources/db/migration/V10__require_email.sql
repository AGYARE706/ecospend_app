-- Email is now required and unique: it's the OTP delivery channel
-- (registration, password reset, login 2FA) via Brevo.
--
-- Backfill any pre-existing rows that never captured an email with a
-- unique, non-deliverable placeholder so the NOT NULL + UNIQUE constraints
-- can be added without failing on legacy/dev data. These placeholders are
-- intentionally invalid addresses (@invalid.ecospend.local) so no real
-- mail is ever sent to them; such accounts must set a real email later.
UPDATE users
SET email = 'user-' || id || '@invalid.ecospend.local'
WHERE email IS NULL OR btrim(email) = '';

ALTER TABLE users
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT uq_users_email UNIQUE (email);
