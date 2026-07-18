-- V6: tracks whether a user has completed the compulsory first-login
-- account setup wizard (income target + budgets + notifications).

ALTER TABLE users
    ADD COLUMN setup_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing accounts predate this wizard — grandfather them in so nobody
-- already using the app gets force-onboarded on their next login.
UPDATE users SET setup_completed = TRUE;
