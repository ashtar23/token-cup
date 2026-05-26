CREATE TABLE IF NOT EXISTS achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('prediction', 'token', 'streak', 'leaderboard', 'settlement')),
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  rarity TEXT NOT NULL
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievement_definitions(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS achievement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id
  ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_events_user_created
  ON achievement_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_events_type
  ON achievement_events(event_type);

ALTER TABLE achievement_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_events DISABLE ROW LEVEL SECURITY;

GRANT ALL ON achievement_definitions TO anon, authenticated;
GRANT ALL ON user_achievements TO anon, authenticated;
GRANT ALL ON achievement_events TO anon, authenticated;

INSERT INTO achievement_definitions
  (id, title, description, category, icon, points, rarity, sort_order)
VALUES
  ('first_lock', 'First Lock', 'Lock your first match prediction.', 'prediction', '🏁', 10, 'common', 10),
  ('token_backer', 'Token Backer', 'Lock a prediction with a team-token bonus.', 'token', '🛡️', 20, 'common', 20),
  ('early_caller', 'Early Caller', 'Lock a prediction at least seven days before kickoff.', 'prediction', '🕰️', 20, 'rare', 30),
  ('crowd_rider', 'Crowd Rider', 'Lock a pick that matches the Fan Pulse leader.', 'prediction', '📡', 25, 'rare', 40),
  ('contrarian', 'Contrarian', 'Lock a pick against the Fan Pulse leader.', 'prediction', '⚡', 25, 'rare', 50),
  ('points_on_board', 'Points On Board', 'Earn your first settled points.', 'settlement', '💰', 20, 'common', 60),
  ('perfect_read', 'Perfect Read', 'Correctly predict both result and goals range.', 'settlement', '🎯', 40, 'rare', 70),
  ('diamond_hands', 'Diamond Hands', 'Maintain enough stake through settlement.', 'settlement', '🔒', 20, 'common', 80),
  ('on_fire', 'On Fire', 'Settle a prediction with a 3-match streak active.', 'streak', '🔥', 50, 'epic', 90),
  ('token_captain', 'Token Captain', 'Earn points from a prediction with a team-token bonus.', 'token', '👑', 50, 'epic', 100),
  ('podium_threat', 'Podium Threat', 'Reach the top 3 on a match leaderboard.', 'leaderboard', '🏆', 60, 'epic', 110),
  ('tournament_climber', 'Tournament Climber', 'Reach 500 total tournament points.', 'leaderboard', '📈', 60, 'epic', 120)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  points = EXCLUDED.points,
  rarity = EXCLUDED.rarity,
  sort_order = EXCLUDED.sort_order,
  is_active = TRUE;
