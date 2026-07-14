-- V3: Recurring bills ("subscriptions" — Netflix, DSTV, gym...).
-- Paying a bill debits the central wallet, auto-records an EXPENSE
-- transaction, and advances next_due_date by one billing cycle.
CREATE TABLE subscriptions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    name           VARCHAR(100) NOT NULL,
    amount         DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    category       VARCHAR(50) NOT NULL DEFAULT 'Subscription',
    billing_cycle  VARCHAR(10) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
    next_due_date  DATE NOT NULL,
    status         VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_due ON subscriptions(user_id, next_due_date);
