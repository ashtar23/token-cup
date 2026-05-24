import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerUserId } from "@/lib/user-session.server";

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

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
  if (!alreadyEntered && totalStaked <= 0) {
    return NextResponse.json(
      {
        error:
          "No tokens staked. Stake fan tokens on Socios.com to participate.",
      },
      { status: 400 },
    );
  }

  const heldSymbols = (userTokens ?? []).map(
    (t: { token_symbol: string }) => t.token_symbol,
  );
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

  return NextResponse.json({ success: true });
}
