import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculatePoints, getResult, goalsToRange } from "./points";
import {
  recordAchievementEvent,
  type AchievementUnlock,
} from "@/features/achievements/lib/achievement-service";
import type { Match, Prediction } from "@/lib/types";

export interface SettleResult {
  settled: number;
  matchUpdated: boolean;
  unlockedAchievementsByUser: Record<string, AchievementUnlock[]>;
}

export async function settleMatchService(
  supabase: SupabaseClient,
  args: { matchId: string; homeScore: number; awayScore: number },
): Promise<SettleResult> {
  const { matchId, homeScore, awayScore } = args;

  const { error: matchErr } = await supabase
    .from("matches")
    .update({ status: "settled", home_score: homeScore, away_score: awayScore })
    .eq("id", matchId);
  if (matchErr) throw matchErr;

  const { data: predictions, error: predErr } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .is("settled_at", null);
  if (predErr) throw predErr;
  if (!predictions || predictions.length === 0) {
    return { settled: 0, matchUpdated: true, unlockedAchievementsByUser: {} };
  }

  const userIds = [...new Set(predictions.map((p: Prediction) => p.user_id))];
  const { data: allTokens } = await supabase
    .from("user_tokens")
    .select("user_id, staked_amount")
    .in("user_id", userIds);

  const stakeByUser = new Map<string, number>();
  for (const t of allTokens ?? []) {
    stakeByUser.set(
      t.user_id,
      (stakeByUser.get(t.user_id) ?? 0) + t.staked_amount,
    );
  }

  const matchData = {
    id: matchId,
    home_score: homeScore,
    away_score: awayScore,
  } as Match;

  const settledAt = new Date().toISOString();
  const settledPredictions: Array<{
    prediction: Prediction;
    points: number;
    voided: boolean;
  }> = [];
  let settled = 0;
  for (const pred of predictions as Prediction[]) {
    const currentStake = stakeByUser.get(pred.user_id) ?? 0;
    const voided = currentStake < pred.stake_snapshot;
    const points = voided ? 0 : calculatePoints(pred, matchData);
    const { error } = await supabase
      .from("predictions")
      .update({
        is_voided: voided,
        points_earned: points,
        settled_at: settledAt,
      })
      .eq("id", pred.id);
    if (!error) {
      settled++;
      settledPredictions.push({ prediction: pred, points, voided });
    }
  }

  const actualResult = getResult(homeScore, awayScore);
  const actualGoalsRange = goalsToRange(homeScore + awayScore);
  const unlockedAchievementsByUser: Record<string, AchievementUnlock[]> = {};

  for (const settledPrediction of settledPredictions) {
    const { prediction, points, voided } = settledPrediction;
    const [matchRank, tournamentPoints] = await Promise.all([
      fetchMatchRank(supabase, matchId, prediction.user_id),
      fetchTournamentPoints(supabase, prediction.user_id),
    ]);

    const unlocks = await recordAchievementEvent(supabase, {
      type: "MATCH_SETTLED",
      userId: prediction.user_id,
      sourceId: matchId,
      payload: {
        pointsEarned: points,
        isVoided: voided,
        streakCount: prediction.streak_count,
        has2xBonus: prediction.has_2x_bonus,
        correctResult: prediction.predicted_result === actualResult,
        correctGoalsRange: prediction.predicted_goals_range === actualGoalsRange,
        matchRank,
        tournamentPoints,
      },
    });

    if (unlocks.length > 0) {
      unlockedAchievementsByUser[prediction.user_id] = unlocks;
    }
  }

  return { settled, matchUpdated: true, unlockedAchievementsByUser };
}

async function fetchMatchRank(
  supabase: SupabaseClient,
  matchId: string,
  userId: string,
): Promise<number | null> {
  const { data } = await supabase
    .from("match_leaderboard_view")
    .select("user_id, total_points")
    .eq("match_id", matchId)
    .order("total_points", { ascending: false });

  const rows = (data ?? []) as { user_id: string; total_points: number }[];
  const index = rows.findIndex((row) => row.user_id === userId);
  return index === -1 ? null : index + 1;
}

async function fetchTournamentPoints(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from("tournament_leaderboard_view")
    .select("total_points")
    .eq("user_id", userId)
    .maybeSingle();

  return ((data as { total_points?: number } | null)?.total_points ?? 0);
}
