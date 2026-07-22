-- Plus is now a real subscription (MONTHLY or YEARLY) that expires and
-- auto-renews from the wallet, instead of a one-time permanent unlock.
ALTER TABLE users
    ADD COLUMN subscription_plan VARCHAR(20),
    ADD COLUMN subscription_expires_at TIMESTAMP,
    ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT TRUE;
