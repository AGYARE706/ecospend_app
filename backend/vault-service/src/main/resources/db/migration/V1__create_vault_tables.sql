-- V1: Locked savings vault tables for EcoSpend vault-service
-- user_id = UUID from gateway header X-User-Id (no FK to identity DB)

CREATE TABLE vaults (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    name            VARCHAR(100) NOT NULL,
    balance         DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    target_amount   DECIMAL(15,2) CHECK (target_amount > 0),
    locked_until    DATE NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BROKEN', 'CLOSED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vault_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id        UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'PENALTY')),
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vaults_user_id ON vaults(user_id);
CREATE INDEX idx_vault_transactions_vault_id ON vault_transactions(vault_id);
CREATE INDEX idx_vault_transactions_user_created ON vault_transactions(user_id, created_at DESC);
