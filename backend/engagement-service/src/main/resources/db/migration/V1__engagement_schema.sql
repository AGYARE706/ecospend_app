-- V1: badges/streaks/XP + financial-literacy lessons. One row per user per
-- active day drives the real streak (replaces two independently-hardcoded
-- mock streak numbers on the mobile side). Achievements and lesson content
-- are server-owned catalogs, seeded in V2, instead of client-side constants.

CREATE TABLE daily_activity (
    user_id       UUID NOT NULL,
    activity_date DATE NOT NULL,
    PRIMARY KEY (user_id, activity_date)
);

CREATE TABLE achievements (
    id          VARCHAR(60) PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon        VARCHAR(40) NOT NULL,
    category    VARCHAR(20) NOT NULL,
    target      INT NOT NULL,
    xp_reward   INT NOT NULL DEFAULT 0
);

CREATE TABLE user_achievements (
    user_id        UUID NOT NULL,
    achievement_id VARCHAR(60) NOT NULL REFERENCES achievements(id),
    progress       INT NOT NULL DEFAULT 0,
    unlocked_at    TIMESTAMPTZ,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE user_xp (
    user_id  UUID PRIMARY KEY,
    total_xp INT NOT NULL DEFAULT 0
);

CREATE TABLE lesson_tracks (
    id          VARCHAR(60) PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon        VARCHAR(40) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE lessons (
    id         VARCHAR(80) PRIMARY KEY,
    track_id   VARCHAR(60) NOT NULL REFERENCES lesson_tracks(id),
    title      VARCHAR(120) NOT NULL,
    summary    VARCHAR(255) NOT NULL,
    content    TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    xp_reward  INT NOT NULL DEFAULT 20
);

CREATE TABLE quiz_questions (
    id             BIGSERIAL PRIMARY KEY,
    lesson_id      VARCHAR(80) NOT NULL REFERENCES lessons(id),
    question       VARCHAR(255) NOT NULL,
    choices        JSONB NOT NULL,
    correct_index  INT NOT NULL,
    explanation    VARCHAR(255) NOT NULL,
    sort_order     INT NOT NULL DEFAULT 0
);

CREATE TABLE user_lesson_progress (
    user_id      UUID NOT NULL,
    lesson_id    VARCHAR(80) NOT NULL REFERENCES lessons(id),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quiz_score   INT NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_lessons_track ON lessons(track_id);
CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id);
