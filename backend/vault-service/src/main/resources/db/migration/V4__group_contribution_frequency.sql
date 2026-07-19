-- V4: The creator chooses how often members contribute (weekly/monthly).
-- Together with target_amount, max_members and locked_until this fully
-- determines the automatic per-member contribution plan — equal shares,
-- equal instalments — so no schedule rows need to be stored.
ALTER TABLE group_vaults
    ADD COLUMN contribution_frequency VARCHAR(10) NOT NULL DEFAULT 'MONTHLY'
    CHECK (contribution_frequency IN ('WEEKLY', 'MONTHLY'));
