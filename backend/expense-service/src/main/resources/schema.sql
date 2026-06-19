-- 1. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount DECIMAL(15,2) NOT NULL,
    provider VARCHAR(20) NOT NULL, 
    category VARCHAR(50) NOT NULL,
    momo_fee DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Savings Goals Table
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Budget Envelopes Table
CREATE TABLE budget_envelopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    monthly_limit DECIMAL(15,2) NOT NULL,
    current_spend DECIMAL(15,2) DEFAULT 0.00,
    month INT NOT NULL,
    year INT NOT NULL
);

-- 4. Performance Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_budget_envelopes_user_id ON budget_envelopes(user_id);