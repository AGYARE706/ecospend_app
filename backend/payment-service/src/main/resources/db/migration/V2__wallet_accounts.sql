-- The central EcoSpend wallet: one row per user, the single real
-- app-level balance. Money enters via Paystack top-ups and leaves via
-- MoMo payouts; every product move (vault, goal, group, subscription)
-- is an internal transfer against this balance.
CREATE TABLE wallet_accounts (
    user_id    UUID PRIMARY KEY,
    balance    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at TIMESTAMP      NOT NULL DEFAULT now()
);
