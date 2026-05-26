INSERT INTO achievement_definitions
  (id, title, description, category, icon, points, rarity, sort_order)
VALUES
  ('three_locks', 'Hat-Trick Caller', 'Lock predictions for three different matches.', 'prediction', '🎩', 20, 'common', 15),
  ('fixture_regular', 'Fixture Regular', 'Lock ten match predictions.', 'prediction', '📅', 45, 'epic', 18),
  ('centurion', 'Centurion', 'Reach 100 total tournament points.', 'leaderboard', '💯', 30, 'rare', 65),
  ('big_haul', 'Big Haul', 'Earn at least 200 points from one settled match.', 'settlement', '💎', 50, 'epic', 75),
  ('multiplier_stack', 'Multiplier Stack', 'Score with both a team-token bonus and an active streak.', 'streak', '🚀', 75, 'legendary', 95),
  ('match_winner', 'Match Winner', 'Finish first on a match leaderboard.', 'leaderboard', '🥇', 90, 'legendary', 115)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  points = EXCLUDED.points,
  rarity = EXCLUDED.rarity,
  sort_order = EXCLUDED.sort_order,
  is_active = TRUE;
