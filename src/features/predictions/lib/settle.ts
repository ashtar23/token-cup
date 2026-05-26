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

  const stakeByUser = (allTokens ?? []).reduce((map, token) => {
    map.set(token.user_id, (map.get(token.user_id) ?? 0) + token.staked_amount);
    return map;
  }, new Map<string, number>());

  const matchData = {
    id: matchId,
    home_score: homeScore,
    away_score: awayScore,
  } as Match;

  const settledAt = new Date().toISOString();
  const settledPredictions = (
    await Promise.all(
      (predictions as Prediction[]).map(async (pred) => {
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
        return error ? null : { prediction: pred, points, voided };
      }),
    )
  ).filter(
    (
      result,
    ): result is {
      prediction: Prediction;
      points: number;
      voided: boolean;
    } => result !== null,
  );

  const actualResult = getResult(homeScore, awayScore);
  const actualGoalsRange = goalsToRange(homeScore + awayScore);
  const [matchRanksByUser, tournamentPointsByUser] = await Promise.all([
    fetchMatchRanks(supabase, matchId),
    fetchTournamentPointsByUser(supabase, userIds),
  ]);

  const achievementResults = await Promise.all(
    settledPredictions.map(async ({ prediction, points, voided }) => {
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
          correctGoalsRange:
            prediction.predicted_goals_range === actualGoalsRange,
          matchRank: matchRanksByUser.get(prediction.user_id) ?? null,
          tournamentPoints: tournamentPointsByUser.get(prediction.user_id) ?? 0,
        },
      });

      return { userId: prediction.user_id, unlocks };
    }),
  );

  const unlockedAchievementsByUser = Object.fromEntries(
    achievementResults
      .filter(({ unlocks }) => unlocks.length > 0)
      .map(({ userId, unlocks }) => [userId, unlocks]),
  );

  return {
    settled: settledPredictions.length,
    matchUpdated: true,
    unlockedAchievementsByUser,
  };
}

async function fetchMatchRanks(
  supabase: SupabaseClient,
  matchId: string,
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("match_leaderboard_view")
    .select("user_id, total_points")
    .eq("match_id", matchId)
    .order("total_points", { ascending: false });

  const rows = (data ?? []) as { user_id: string; total_points: number }[];
  return new Map(rows.map((row, index) => [row.user_id, index + 1]));
}

async function fetchTournamentPointsByUser(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("tournament_leaderboard_view")
    .select("user_id, total_points")
    .in("user_id", userIds);

  return new Map(
    ((data ?? []) as { user_id: string; total_points: number }[]).map((row) => [
      row.user_id,
      row.total_points,
    ]),
  );
}
