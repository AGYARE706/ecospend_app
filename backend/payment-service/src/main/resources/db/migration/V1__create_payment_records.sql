CREATE TABLE payment_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID           NOT NULL,
    vault_id        UUID,
    type            VARCHAR(20)    NOT NULL, -- DEPOSIT | PAYOUT
    amount_ghs      NUMERIC(12, 2) NOT NULL,
    reference       VARCHAR(100)   NOT NULL UNIQUE,
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING', -- PENDING | SUCCESS | FAILED
    momo_number     VARCHAR(20),
    momo_provider   VARCHAR(20),
    transfer_code   VARCHAR(100),
    failure_reason  TEXT,
    created_at      TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_records_user ON payment_records (user_id, created_at DESC);
CREATE INDEX idx_payment_records_vault ON payment_records (vault_id);
