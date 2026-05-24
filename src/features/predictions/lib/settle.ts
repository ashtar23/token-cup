import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculatePoints } from "./points";
import type { Match, Prediction } from "@/lib/types";

export interface SettleResult {
  /** Number of predictions newly settled by this call. */
  settled: number;
  /** True if the match was actually transitioned (i.e. wasn't already settled). */
  matchUpdated: boolean;
}

/**
 * Shared settlement logic. Called by:
 *   • `/api/settle` route (manual settle from dev panel)
 *   • `/api/cron` route (auto-settle when football-data.org reports FINISHED)
 *
 * Idempotent: re-running on an already-settled match is a no-op.
 * Voids predictions where the user's current stake is below their snapshot.
 */
export async function settleMatchService(
  supabase: SupabaseClient,
  args: { matchId: string; homeScore: number; awayScore: number },
): Promise<SettleResult> {
  const { matchId, homeScore, awayScore } = args;

  // Update the match. If it's already settled with these scores, the UPDATE
  // is a no-op — that's fine, we still re-run the prediction settlement
  // pass for any not-yet-settled rows.
  const { error: matchErr } = await supabase
    .from("matches")
    .update({ status: "settled", home_score: homeScore, away_score: awayScore })
    .eq("id", matchId);
  if (matchErr) throw matchErr;

  // Only score predictions that haven't been settled yet.
  const { data: predictions, error: predErr } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .is("settled_at", null);
  if (predErr) throw predErr;
  if (!predictions || predictions.length === 0) {
    return { settled: 0, matchUpdated: true };
  }

  // Look up the current total stake for every user in this set so we can
  // void predictions where the user's stake dropped below their snapshot.
  const userIds = [...new Set(predictions.map((p: Prediction) => p.user_id))];
  const { data: allTokens } = await supabase
    .from("user_tokens")
    .select("user_id, staked_amount")
    .in("user_id", userIds);

  const stakeByUser = new Map<string, number>();
  for (const t of allTokens ?? []) {
    stakeByUser.set(t.user_id, (stakeByUser.get(t.user_id) ?? 0) + t.staked_amount);
  }

  const matchData = {
    id: matchId,
    home_score: homeScore,
    away_score: awayScore,
  } as Match;

  const settledAt = new Date().toISOString();
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
    if (!error) settled++;
  }

  return { settled, matchUpdated: true };
}
