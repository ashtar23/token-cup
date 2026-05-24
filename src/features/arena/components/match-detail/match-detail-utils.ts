import { getResult, goalsToRange } from "@/features/predictions/lib/points";
import type { Match, Prediction, PredictedResult } from "@/lib/types";

export function formatStage(stage: Match["stage"]): string {
  if (!stage) return "-";
  return stage
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatResult(result: PredictedResult, match: Match): string {
  const resultLabels = {
    home_win: `${match.home_team} win`,
    draw: "Draw",
    away_win: `${match.away_team} win`,
  } satisfies Record<PredictedResult, string>;

  return resultLabels[result];
}

export function getKickoffLabel(match: Match): string {
  if (match.status !== "upcoming") {
    return match.status === "live" ? "Live" : "Full time";
  }

  const diff = new Date(match.kickoff_at).getTime() - Date.now();
  if (diff <= 0) return "Soon";

  const days = Math.floor(diff / 86_400_000);
  if (days > 0) return `${days}d`;

  const hours = Math.floor(diff / 3_600_000);
  if (hours > 0) return `${hours}h`;

  const minutes = Math.max(1, Math.floor(diff / 60_000));
  return `${minutes}m`;
}

export function getPredictionOutcome(match: Match, prediction: Prediction) {
  const actualResult =
    match.home_score === null || match.away_score === null
      ? null
      : getResult(match.home_score, match.away_score);
  const actualGoals =
    match.home_score === null || match.away_score === null
      ? null
      : goalsToRange(match.home_score + match.away_score);

  return {
    actualResult,
    actualGoals,
    resultHit:
      actualResult !== null && prediction.predicted_result === actualResult,
    goalsHit:
      actualGoals !== null && prediction.predicted_goals_range === actualGoals,
  };
}
