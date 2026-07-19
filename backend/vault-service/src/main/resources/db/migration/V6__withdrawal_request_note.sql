-- V6: optional note on a group withdrawal request, so other members know
-- why the money is being asked for before they vote.

ALTER TABLE group_withdrawal_requests
    ADD COLUMN note VARCHAR(280);
