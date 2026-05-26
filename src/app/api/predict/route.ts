import { NextRequest, NextResponse } from "next/server";
import { getServerUserId } from "@/lib/user-session.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  recordAchievementEvent,
  toAchievementUnlockPayload,
} from "@/features/achievements/lib/achievement-service";
import { getStakeEligibility } from "@/features/user/lib/stake-eligibility";
import type { PredictedResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  const { matchId, predictedResult, predictedGoalsRange, predictedFirstScorer } =
    await req.json();

  if (!matchId || !predictedResult) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const [
    { data: match },
    { data: userTokens },
    { data: thisMatchEntry },
    { data: lastMatchEntry },
    { data: recentSettled },
  ] = await Promise.all([
    supabase.from("matches").select("*").eq("id", matchId).single(),
    supabase.from("user_tokens").select("*").eq("user_id", userId),
    supabase
      .from("user_match_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("match_id", matchId)
      .maybeSingle(),
    supabase
      .from("user_match_entries")
      .select("*")
      .eq("user_id", userId)
      .neq("match_id", matchId)
      .order("entered_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // For streak: only settled, non-voided predictions, newest first.
    // We walk this list to count consecutive correct ones.
    supabase
      .from("predictions")
      .select("match_id, points_earned, settled_at")
      .eq("user_id", userId)
      .eq("is_voided", false)
      .not("settled_at", "is", null)
      .neq("match_id", matchId) // exclude any prior settle of this same match
      .order("settled_at", { ascending: false }),
  ]);

  if (!match)
    return NextResponse.json({ error: "Match not found" }, { status: 404 });

  if (match.status !== "upcoming") {
    return NextResponse.json(
      { error: "Predictions are locked for this match" },
      { status: 400 },
    );
  }

  const totalStaked = (userTokens ?? []).reduce(
    (sum: number, t: { staked_amount: number }) => sum + t.staked_amount,
    0,
  );

  const alreadyEntered = !!thisMatchEntry;
  const eligibility = getStakeEligibility({
    alreadyEntered,
    previousEntry: lastMatchEntry,
    totalStaked,
  });
  if (!eligibility.eligible) {
    return NextResponse.json(
      {
        error: `Stake more fan tokens to enter this match. You need at least ${eligibility.requiredStake.toLocaleString()} total staked tokens.`,
      },
      { status: 400 },
    );
  }

  const heldSymbols = (userTokens ?? [])
    .filter((t: { staked_amount: number }) => t.staked_amount > 0)
    .map((t: { token_symbol: string }) => t.token_symbol);
  const has2x =
    (match.home_token && heldSymbols.includes(match.home_token)) ||
    (match.away_token && heldSymbols.includes(match.away_token));

  // Count the user's current "active streak" — consecutive correct
  // predictions immediately preceding this one. The streak is the value
  // attached to THIS prediction; if it also resolves correct on settle,
  // the next prediction will see streak+1.
  const settled = (recentSettled ?? []) as { points_earned: number | null }[];
  let activeStreak = 0;
  for (const p of settled) {
    if ((p.points_earned ?? 0) > 0) {
      activeStreak++;
    } else {
      break; // first wrong/zero-point result ends the streak
    }
  }
  const streak = activeStreak;

  await supabase.from("user_match_entries").upsert(
    { user_id: userId, match_id: matchId, total_staked_snapshot: totalStaked },
    { onConflict: "user_id,match_id" },
  );

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: userId,
      match_id: matchId,
      predicted_result: predictedResult,
      predicted_goals_range: predictedGoalsRange ?? null,
      predicted_first_scorer: predictedFirstScorer ?? null,
      stake_snapshot: totalStaked,
      has_2x_bonus: !!has2x,
      streak_count: streak,
      is_voided: false,
      points_earned: null,
      settled_at: null,
    },
    { onConflict: "user_id,match_id" },
  );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const [{ count: predictionCount }, fanPulseLeader] = await Promise.all([
    supabase
      .from("predictions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    getFanPulseLeader(supabase, matchId),
  ]);

  const unlockedAchievements = await recordAchievementEvent(supabase, {
    type: "PREDICTION_LOCKED",
    userId,
    sourceId: matchId,
    payload: {
      predictionCount: predictionCount ?? 0,
      has2xBonus: !!has2x,
      predictedResult,
      kickoffAt: match.kickoff_at,
      fanPulseLeader,
    },
  });

  return NextResponse.json({
    success: true,
    unlockedAchievements: unlockedAchievements.map(toAchievementUnlockPayload),
  });
}

async function getFanPulseLeader(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  matchId: string,
): Promise<PredictedResult | null> {
  const { data } = await supabase
    .from("predictions")
    .select("predicted_result")
    .eq("match_id", matchId);

  const rows = (data ?? []) as { predicted_result: PredictedResult }[];
  if (rows.length < 3) return null;

  const counts: Record<PredictedResult, number> = {
    home_win: 0,
    draw: 0,
    away_win: 0,
  };
  for (const row of rows) counts[row.predicted_result]++;

  return (Object.entries(counts) as [PredictedResult, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}
