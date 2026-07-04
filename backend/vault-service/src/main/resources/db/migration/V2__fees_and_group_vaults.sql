-- V2: FEE transaction type (2% platform sustainability fee) and
--     Group Vault (Digital Susu) tables: 2-8 users pool savings toward
--     a shared goal; withdrawals need majority approval; early exit
--     costs 5% of the member's own balance only.

ALTER TABLE vault_transactions DROP CONSTRAINT vault_transactions_type_check;
ALTER TABLE vault_transactions ADD CONSTRAINT vault_transactions_type_check
    CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'PENALTY', 'FEE'));

CREATE TABLE group_vaults (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    creator_id      UUID NOT NULL,
    target_amount   DECIMAL(15,2) CHECK (target_amount > 0),
    locked_until    DATE NOT NULL,
    max_members     INT NOT NULL DEFAULT 8 CHECK (max_members BETWEEN 2 AND 8),
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_vault_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES group_vaults(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    balance         DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXITED')),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

CREATE TABLE group_vault_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES group_vaults(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'PENALTY', 'FEE')),
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_withdrawal_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES group_vaults(id) ON DELETE CASCADE,
    requester_id    UUID NOT NULL,
    amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    status          VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'REJECTED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_withdrawal_votes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID NOT NULL REFERENCES group_withdrawal_requests(id) ON DELETE CASCADE,
    voter_id        UUID NOT NULL,
    approve         BOOLEAN NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (request_id, voter_id)
);

CREATE INDEX idx_group_vault_members_user ON group_vault_members(user_id);
CREATE INDEX idx_group_vault_members_group ON group_vault_members(group_id);
CREATE INDEX idx_group_vault_tx_group ON group_vault_transactions(group_id, created_at DESC);
CREATE INDEX idx_group_wr_group ON group_withdrawal_requests(group_id);
CREATE INDEX idx_group_votes_request ON group_withdrawal_votes(request_id);
