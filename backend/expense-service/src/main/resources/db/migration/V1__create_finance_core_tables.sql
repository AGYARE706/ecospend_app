-- V1: Core finance tables for EcoSpend expense-service
-- user_id = UUID from gateway header X-User-Id (no FK to identity DB)

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    provider        VARCHAR(20) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    momo_fee        DECIMAL(10,2) DEFAULT 0.00,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE savings_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    target_amount   DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    deadline        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE budget_envelopes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    category        VARCHAR(50) NOT NULL,
    monthly_limit   DECIMAL(15,2) NOT NULL CHECK (monthly_limit > 0),
    current_spend   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    month           INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year            INT NOT NULL CHECK (year >= 2024),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, category, month, year)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_budget_envelopes_user_id ON budget_envelopes(user_id);
CREATE INDEX idx_budget_envelopes_user_month ON budget_envelopes(user_id, month, year);