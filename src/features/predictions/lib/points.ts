import {
  BASE_POINTS,
  STREAK_MULTIPLIER,
  STREAK_THRESHOLD,
  TEAM_TOKEN_MULTIPLIER,
} from "@/lib/constants";
import type { GoalsRange, Match, Prediction } from "@/lib/types";

export function goalsToRange(goals: number): GoalsRange {
  if (goals <= 1) return "0-1";
  if (goals <= 3) return "2-3";
  return "4+";
}

export function calculatePoints(
  prediction: Pick<
    Prediction,
    | "predicted_result"
    | "predicted_goals_range"
    | "has_2x_bonus"
    | "streak_count"
  >,
  match: Pick<Match, "home_score" | "away_score">,
): number {
  if (match.home_score === null || match.away_score === null) return 0;

  const actualResult = getResult(match.home_score, match.away_score);
  const actualRange = goalsToRange(match.home_score + match.away_score);

  let points = 0;
  if (prediction.predicted_result === actualResult) points += BASE_POINTS;
  if (
    prediction.predicted_goals_range &&
    prediction.predicted_goals_range === actualRange
  )
    points += BASE_POINTS;
  if (points === 0) return 0;

  const tokenMult = prediction.has_2x_bonus ? TEAM_TOKEN_MULTIPLIER : 1;
  const streakMult =
    prediction.streak_count >= STREAK_THRESHOLD ? STREAK_MULTIPLIER : 1;

  return Math.floor(points * tokenMult * streakMult);
}

export function getResult(
  home: number,
  away: number,
): "home_win" | "draw" | "away_win" {
  if (home > away) return "home_win";
  if (away > home) return "away_win";
  return "draw";
}

export function formatPoints(pts: number): string {
  return pts.toLocaleString();
}
