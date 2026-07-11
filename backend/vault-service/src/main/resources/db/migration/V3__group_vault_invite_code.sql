-- Add unique invite codes for group vault join-by-code flow
ALTER TABLE group_vaults
    ADD COLUMN IF NOT EXISTS invite_code VARCHAR(12);

UPDATE group_vaults
SET invite_code = UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE invite_code IS NULL;

ALTER TABLE group_vaults
    ALTER COLUMN invite_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_group_vaults_invite_code
    ON group_vaults (invite_code);
