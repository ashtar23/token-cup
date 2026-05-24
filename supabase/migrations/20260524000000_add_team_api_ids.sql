-- Store football-data.org team IDs alongside each match so we can fetch
-- squads (and any future team-keyed data) without a name-based lookup.

ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_api_id INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_api_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_matches_home_team_api_id ON matches(home_team_api_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team_api_id ON matches(away_team_api_id);
