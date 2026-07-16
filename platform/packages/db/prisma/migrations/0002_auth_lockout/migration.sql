-- Brute-force protection: track consecutive failed logins and lock the account
-- for a cooldown window once a threshold is crossed (enforced in the API).
ALTER TABLE app_user
  ADD COLUMN failed_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN locked_until    timestamptz;
