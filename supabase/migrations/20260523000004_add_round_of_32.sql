-- WC 2026 has a Round of 32 stage (LAST_32 in football-data.org API)
-- Add it to the matches.stage CHECK constraint

ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;
ALTER TABLE matches ADD CONSTRAINT matches_stage_check
  CHECK (stage IN ('group','round_of_32','round_of_16','quarter_final','semi_final','final'));
