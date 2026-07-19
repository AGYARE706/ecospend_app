-- Add completed_at for goal contribution completion tracking
ALTER TABLE savings_goals
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Allow income transactions without a MoMo provider
ALTER TABLE transactions
    ALTER COLUMN provider DROP NOT NULL;
