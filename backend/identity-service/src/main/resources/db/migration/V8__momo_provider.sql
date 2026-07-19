-- V8: the user's own Mobile Money provider (MTN/Telecel/AT), so the
-- account's linked phone number can be used as a "send to myself"
-- destination without asking for it on every send.

ALTER TABLE users
    ADD COLUMN momo_provider VARCHAR(20);
