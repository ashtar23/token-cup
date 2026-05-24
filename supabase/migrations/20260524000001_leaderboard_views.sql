-- Push leaderboard aggregation into the DB so it scales past the JS loop.
-- These are simple VIEWs (not materialized) — the planner uses the existing
-- predictions indexes; recomputation cost is negligible at our scale.

-- Tournament-wide leaderboard: total points per user across all settled
-- non-voided predictions.
CREATE OR REPLACE VIEW tournament_leaderboard_view AS
SELECT
  p.user_id,
  COALESCE(u.fantasy_name, 'Unknown') AS fantasy_name,
  COALESCE(SUM(p.points_earned), 0)::int AS total_points,
  COALESCE(MAX(p.streak_count), 0)::int AS max_streak,
  COUNT(*)::int AS count
FROM predictions p
LEFT JOIN users u ON u.id = p.user_id
WHERE p.is_voided = false
  AND p.points_earned IS NOT NULL
GROUP BY p.user_id, u.fantasy_name;

-- Per-match leaderboard: points each user earned on a single match.
-- Includes match_id so callers can filter via .eq('match_id', ...)
CREATE OR REPLACE VIEW match_leaderboard_view AS
SELECT
  p.match_id,
  p.user_id,
  COALESCE(u.fantasy_name, 'Unknown') AS fantasy_name,
  COALESCE(p.points_earned, 0)::int AS total_points,
  COALESCE(p.streak_count, 0)::int AS streak_count
FROM predictions p
LEFT JOIN users u ON u.id = p.user_id
WHERE p.is_voided = false
  AND p.points_earned IS NOT NULL;

-- Grants so the publishable key can read the views (RLS is disabled).
GRANT SELECT ON tournament_leaderboard_view TO anon, authenticated;
GRANT SELECT ON match_leaderboard_view TO anon, authenticated;
