-- V7: device/IP metadata on refresh tokens, plus soft-revocation instead
-- of hard deletion — so a single table can serve both "active sessions"
-- (revoked_at IS NULL AND expires_at > now()) and "login history" (every
-- row ever created, revoked or not).

ALTER TABLE refresh_tokens
    ADD COLUMN user_agent TEXT,
    ADD COLUMN ip_address VARCHAR(64),
    ADD COLUMN last_used_at TIMESTAMP,
    ADD COLUMN revoked_at TIMESTAMP;
