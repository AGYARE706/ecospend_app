-- V5: Per-person invite tracking (who an admin invited by phone number,
-- and whether they've joined) and a real activity log — every event that
-- happens in a group vault, not just money movements — for transparency
-- and admin oversight.

CREATE TABLE group_vault_invites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES group_vaults(id) ON DELETE CASCADE,
    invited_by      UUID NOT NULL,
    phone_number    VARCHAR(20) NOT NULL,
    invited_user_id UUID,
    status          VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'JOINED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    joined_at       TIMESTAMPTZ,
    UNIQUE (group_id, phone_number)
);

CREATE INDEX idx_group_vault_invites_group ON group_vault_invites(group_id);
CREATE INDEX idx_group_vault_invites_phone ON group_vault_invites(phone_number);

CREATE TABLE group_vault_activity (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES group_vaults(id) ON DELETE CASCADE,
    actor_user_id   UUID,
    type            VARCHAR(30) NOT NULL,
    message         TEXT NOT NULL,
    amount          DECIMAL(15,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_group_vault_activity_group ON group_vault_activity(group_id, created_at DESC);
