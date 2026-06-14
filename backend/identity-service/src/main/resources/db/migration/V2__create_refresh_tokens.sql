CREATE TABLE identity_schema.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity_schema.users(id)
        ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id
    ON identity_schema.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token
    ON identity_schema.refresh_tokens(token);