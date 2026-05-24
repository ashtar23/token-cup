-- Remove TBD knockout matches where teams haven't been determined yet
-- These come from football-data.org with empty name strings
DELETE FROM matches
WHERE home_team = '' OR away_team = ''
   OR home_team IS NULL OR away_team IS NULL;

-- Prevent empty team names from being inserted in the future
ALTER TABLE matches
  ADD CONSTRAINT matches_home_team_nonempty CHECK (home_team <> ''),
  ADD CONSTRAINT matches_away_team_nonempty CHECK (away_team <> '');
