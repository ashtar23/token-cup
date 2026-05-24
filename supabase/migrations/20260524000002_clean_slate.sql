-- One-time data wipe: full clean slate before demo runs.
-- Removes every row in every data table so we can re-sync matches
-- from football-data.org and start fresh. Schema is preserved.
--
-- After this migration is applied, hit /api/sync-matches to repopulate
-- the matches table. Existing connected users will auto-recreate their
-- row via the /connecting onboarding guard (self-healing layout).
--
-- Order matters: child tables first to satisfy FK constraints.

DELETE FROM predictions;
DELETE FROM user_match_entries;
DELETE FROM user_tokens;
DELETE FROM matches;
DELETE FROM users;
