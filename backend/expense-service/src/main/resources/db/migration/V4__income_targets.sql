-- V4: Expected fixed monthly income, one row per user. Actual monthly
-- income (auto-recorded INCOME transactions) is tracked against this on
-- the dashboard and in weekly insights, mirroring budget envelopes for
-- the income side.
CREATE TABLE income_targets (
    user_id         UUID PRIMARY KEY,
    monthly_amount  DECIMAL(15,2) NOT NULL CHECK (monthly_amount >= 0),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
