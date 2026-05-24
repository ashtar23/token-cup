-- Token Cup schema
-- Run this in the Supabase SQL editor to set up the database

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  fantasy_name TEXT,
  mock_staked_amount INTEGER NOT NULL DEFAULT 500,
  mock_tokens TEXT[] NOT NULL DEFAULT ARRAY['ARG', 'BRA'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_match_id INTEGER UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_token TEXT,
  away_token TEXT,
  kickoff_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'live', 'settled')),
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_match_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  staked_amount INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_result TEXT NOT NULL
    CHECK (predicted_result IN ('home_win', 'draw', 'away_win')),
  predicted_total_goals INTEGER,
  stake_snapshot INTEGER NOT NULL,
  has_2x_bonus BOOLEAN NOT NULL DEFAULT FALSE,
  streak_count INTEGER NOT NULL DEFAULT 1,
  is_voided BOOLEAN NOT NULL DEFAULT FALSE,
  points_earned INTEGER,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  UNIQUE(user_id, match_id)
);

-- Seed the mock user (ARG + BRA token holder, 500 staked to start)
INSERT INTO users (id, wallet_address, fantasy_name, mock_staked_amount, mock_tokens)
VALUES (
  'mock-user-001',
  '0xMOCK1234567890ABCDEF',
  NULL,
  500,
  ARRAY['ARG', 'BRA']
) ON CONFLICT (id) DO NOTHING;

-- Seed World Cup 2026 group stage openers (adjust dates/teams as needed)
-- These will also be synced from football-data.org via /api/sync-matches
INSERT INTO matches (home_team, away_team, home_token, away_token, kickoff_at, status) VALUES
  ('Mexico', 'USA', 'MEX', NULL, '2026-06-11 17:00:00+00', 'upcoming'),
  ('Canada', 'France', NULL, 'FRA', '2026-06-12 17:00:00+00', 'upcoming'),
  ('Argentina', 'Morocco', 'ARG', 'MAR', '2026-06-13 17:00:00+00', 'upcoming'),
  ('Brazil', 'Germany', 'BRA', 'GER', '2026-06-14 17:00:00+00', 'upcoming'),
  ('Spain', 'Portugal', 'ESP', 'POR', '2026-06-15 17:00:00+00', 'upcoming'),
  ('England', 'Iran', 'ENG', NULL, '2026-06-16 17:00:00+00', 'upcoming'),
  ('France', 'Brazil', 'FRA', 'BRA', '2026-06-25 17:00:00+00', 'upcoming'),
  ('Argentina', 'Germany', 'ARG', 'GER', '2026-06-26 17:00:00+00', 'upcoming')
ON CONFLICT DO NOTHING;
