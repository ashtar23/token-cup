import { randomBytes, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerUserId } from "@/lib/user-session.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Match, PredictedResult } from "@/lib/types";

const schema = z.object({
  matchId: z.string().uuid(),
});

type SeedCamp = "home" | "away" | "neutral";

interface SeedUser {
  camp: SeedCamp;
  predictedResult: PredictedResult;
  goalsRange: "0-1" | "2-3" | "4+";
  stake: number;
  streak: number;
}

const SEED_USERS: SeedUser[] = [
  {
    camp: "home",
    predictedResult: "home_win",
    goalsRange: "2-3",
    stake: 900,
    streak: 4,
  },
  {
    camp: "home",
    predictedResult: "home_win",
    goalsRange: "4+",
    stake: 760,
    streak: 2,
  },
  {
    camp: "home",
    predictedResult: "draw",
    goalsRange: "0-1",
    stake: 520,
    streak: 1,
  },
  {
    camp: "home",
    predictedResult: "home_win",
    goalsRange: "2-3",
    stake: 610,
    streak: 2,
  },
  {
    camp: "away",
    predictedResult: "away_win",
    goalsRange: "2-3",
    stake: 680,
    streak: 3,
  },
  {
    camp: "away",
    predictedResult: "home_win",
    goalsRange: "2-3",
    stake: 450,
    streak: 0,
  },
  {
    camp: "away",
    predictedResult: "draw",
    goalsRange: "2-3",
    stake: 390,
    streak: 1,
  },
  {
    camp: "neutral",
    predictedResult: "draw",
    goalsRange: "0-1",
    stake: 300,
    streak: 1,
  },
  {
    camp: "neutral",
    predictedResult: "home_win",
    goalsRange: "4+",
    stake: 260,
    streak: 2,
  },
  {
    camp: "neutral",
    predictedResult: "away_win",
    goalsRange: "0-1",
    stake: 340,
    streak: 0,
  },
  {
    camp: "neutral",
    predictedResult: "home_win",
    goalsRange: "2-3",
    stake: 420,
    streak: 3,
  },
  {
    camp: "neutral",
    predictedResult: "draw",
    goalsRange: "4+",
    stake: 280,
    streak: 1,
  },
];

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid match input" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", parsed.data.matchId)
    .single();

  if (matchError || !match) {
    return NextResponse.json(
      { error: matchError?.message ?? "Match not found" },
      { status: 404 },
    );
  }

  const typedMatch = match as Match;
  const runSuffix = randomUUID().replaceAll("-", "").slice(0, 8);

  const seedRows = SEED_USERS.map((seed, index) => {
    const id = randomUUID();
    return {
      ...seed,
      id,
      name: `fan_${runSuffix}_${String(index + 1).padStart(2, "0")}`,
      walletAddress: randomWalletAddress(),
      tokenSymbol: tokenForCamp(typedMatch, seed.camp),
      has2xBonus:
        (seed.camp === "home" && Boolean(typedMatch.home_token)) ||
        (seed.camp === "away" && Boolean(typedMatch.away_token)),
    };
  });

  const userInserts = seedRows.map((seed) => ({
    id: seed.id,
    wallet_address: seed.walletAddress,
    fantasy_name: seed.name,
  }));

  const tokenUpserts = seedRows.map((seed) => ({
    user_id: seed.id,
    token_symbol: seed.tokenSymbol,
    staked_amount: seed.stake,
  }));

  const entryUpserts = seedRows.map((seed) => ({
    user_id: seed.id,
    match_id: typedMatch.id,
    total_staked_snapshot: seed.stake,
  }));

  const predictionUpserts = seedRows.map((seed) => ({
    user_id: seed.id,
    match_id: typedMatch.id,
    predicted_result: seed.predictedResult,
    predicted_goals_range: seed.goalsRange,
    predicted_first_scorer: null,
    stake_snapshot: seed.stake,
    has_2x_bonus: seed.has2xBonus,
    streak_count: seed.streak,
    is_voided: false,
    points_earned: null,
    settled_at: null,
  }));

  const { error: usersError } = await supabase
    .from("users")
    .insert(userInserts);
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const { error: tokensError } = await supabase
    .from("user_tokens")
    .upsert(tokenUpserts, { onConflict: "user_id,token_symbol" });
  if (tokensError) {
    return NextResponse.json({ error: tokensError.message }, { status: 500 });
  }

  const { error: entriesError } = await supabase
    .from("user_match_entries")
    .upsert(entryUpserts, { onConflict: "user_id,match_id" });
  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const { error: predictionsError } = await supabase
    .from("predictions")
    .upsert(predictionUpserts, { onConflict: "user_id,match_id" });
  if (predictionsError) {
    return NextResponse.json(
      { error: predictionsError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ seeded: seedRows.length });
}

function tokenForCamp(match: Match, camp: SeedCamp): string {
  if (camp === "home" && match.home_token) return match.home_token;
  if (camp === "away" && match.away_token) return match.away_token;

  const fallbacks = ["ARG", "BRA", "POR", "ESP", "FRA"];
  return (
    fallbacks.find(
      (token) => token !== match.home_token && token !== match.away_token,
    ) ?? "CHZ"
  );
}

function randomWalletAddress(): string {
  return `0x${randomBytes(20).toString("hex")}`;
}
