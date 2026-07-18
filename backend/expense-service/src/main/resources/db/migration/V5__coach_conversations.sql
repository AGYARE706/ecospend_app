-- V5: "Ask EcoSpend" AI financial coach — chat history and a once-a-day
-- cached proactive insight shown on the dashboard.
CREATE TABLE coach_conversations (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL,
    title       VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coach_messages (
    id               UUID PRIMARY KEY,
    conversation_id  UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
    role             VARCHAR(20) NOT NULL,
    content          TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One cached insight per user per day, lazily generated on first
-- dashboard load of the day rather than a scheduled job.
CREATE TABLE coach_daily_insight (
    user_id        UUID NOT NULL,
    insight_date   DATE NOT NULL,
    heading        VARCHAR(120) NOT NULL,
    message        TEXT NOT NULL,
    generated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, insight_date)
);

CREATE INDEX idx_coach_conversations_user ON coach_conversations(user_id);
CREATE INDEX idx_coach_messages_conversation ON coach_messages(conversation_id);
