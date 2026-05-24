export type MatchStatus = "upcoming" | "live" | "settled";
export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "final";
export type PredictedResult = "home_win" | "draw" | "away_win";
export type GoalsRange = "0-1" | "2-3" | "4+";

export interface User {
  id: string;
  wallet_address: string;
  fantasy_name: string | null;
  created_at: string;
}

export interface UserToken {
  id: string;
  user_id: string;
  token_symbol: string;
  staked_amount: number;
  updated_at: string;
}

export interface Match {
  id: string;
  api_match_id: number | null;
  home_team: string;
  away_team: string;
  home_team_api_id: number | null;
  away_team_api_id: number | null;
  home_token: string | null;
  away_token: string | null;
  kickoff_at: string;
  status: MatchStatus;
  stage: MatchStage | null;
  group_name: string | null;
  home_score: number | null;
  away_score: number | null;
  created_at: string;
}

export interface UserMatchEntry {
  id: string;
  user_id: string;
  match_id: string;
  total_staked_snapshot: number;
  entered_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_result: PredictedResult;
  predicted_goals_range: GoalsRange | null;
  predicted_first_scorer: string | null;
  stake_snapshot: number;
  has_2x_bonus: boolean;
  streak_count: number;
  is_voided: boolean;
  points_earned: number | null;
  submitted_at: string;
  settled_at: string | null;
  match?: Match;
}

export interface LeaderboardEntry {
  user_id: string;
  fantasy_name: string;
  total_points: number;
  predictions_count: number;
  max_streak: number;
  rank: number;
}
