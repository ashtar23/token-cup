-- Production schema refactor
-- Remove mock_ prefix, add user_tokens, proper constraints, indexes

-- 1. Users: drop mock columns, add unique constraint on fantasy_name
ALTER TABLE users DROP COLUMN IF EXISTS mock_staked_amount;
ALTER TABLE users DROP COLUMN IF EXISTS mock_tokens;
ALTER TABLE users ADD CONSTRAINT users_fantasy_name_unique UNIQUE (fantasy_name);

-- 2. Per-token holdings table (replaces mock_tokens + mock_staked_amount)
CREATE TABLE IF NOT EXISTS user_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_symbol TEXT       NOT NULL,
  staked_amount INTEGER   NOT NULL DEFAULT 0 CHECK (staked_amount >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token_symbol)
);

-- 3. Rename user_match_stakes → user_match_entries, clean up column names
ALTER TABLE user_match_stakes RENAME TO user_match_entries;
ALTER TABLE user_match_entries RENAME COLUMN staked_amount TO total_staked_snapshot;
ALTER TABLE user_match_entries RENAME COLUMN recorded_at TO entered_at;

-- 4. Predictions: add goalscorer + goals range, keep backward compat for now
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS predicted_goals_range TEXT
  CHECK (predicted_goals_range IN ('0-1', '2-3', '4+'));
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS predicted_first_scorer TEXT;
-- Migrate existing integer goals to range buckets
UPDATE predictions
  SET predicted_goals_range = CASE
    WHEN predicted_total_goals <= 1 THEN '0-1'
    WHEN predicted_total_goals <= 3 THEN '2-3'
    ELSE '4+'
  END
  WHERE predicted_total_goals IS NOT NULL AND predicted_goals_range IS NULL;

-- 5. Matches: add stage + group_name
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT
  CHECK (stage IN ('group', 'round_of_16', 'quarter_final', 'semi_final', 'final'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name TEXT;

-- 6. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_predictions_user_id     ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id    ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_leaderboard ON predictions(match_id, is_voided, points_earned)
  WHERE settled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_match_entries_user ON user_match_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_match_entries_match ON user_match_entries(match_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id     ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status          ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff         ON matches(kickoff_at);

-- 7. Grants + disable RLS on new table
ALTER TABLE user_tokens DISABLE ROW LEVEL SECURITY;
GRANT ALL ON user_tokens TO anon, authenticated;

-- 8. Seed token holdings for demo user
INSERT INTO user_tokens (user_id, token_symbol, staked_amount) VALUES
  ('mock-user-001', 'ARG', 50),
  ('mock-user-001', 'BRA', 150),
  ('mock-user-001', 'CHZ', 200)
ON CONFLICT (user_id, token_symbol) DO NOTHING;

-- 9. Update match stage for seeded fixtures
UPDATE matches SET stage = 'group' WHERE stage IS NULL;
