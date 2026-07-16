-- V4: Optional profile photo, stored as a data URI (base64) directly in
-- the row — no object storage needed for a demo-scoped feature.
ALTER TABLE users ADD COLUMN profile_photo TEXT;
