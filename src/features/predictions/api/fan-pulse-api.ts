import { supabase } from "@/lib/supabase";
import type { Match, PredictedResult } from "@/lib/types";

export type FanPulseCampKey = "all" | "home" | "away" | "neutral";

export interface FanPulseSegment {
  result: PredictedResult;
  count: number;
  percentage: number;
}

export interface FanPulseCamp {
  key: FanPulseCampKey;
  label: string;
  tokenSymbol: string | null;
  totalPicks: number;
  leadingResult: PredictedResult | null;
  leadingPercentage: number;
  segments: FanPulseSegment[];
}

export interface FanPulseData {
  matchId: string;
  totalPicks: number;
  camps: FanPulseCamp[];
}

interface PredictionPulseRow {
  user_id: string;
  predicted_result: PredictedResult;
}

interface UserTokenPulseRow {
  user_id: string;
  token_symbol: string;
  staked_amount: number;
}

const RESULT_ORDER: PredictedResult[] = ["home_win", "draw", "away_win"];

export async function fetchFanPulse(match: Match): Promise<FanPulseData> {
  const { data: predictionRows, error: predictionError } = await supabase
    .from("predictions")
    .select("user_id, predicted_result")
    .eq("match_id", match.id)
    .eq("is_voided", false);

  if (predictionError) throw predictionError;

  const predictions = (predictionRows ?? []) as PredictionPulseRow[];
  const userIds = Array.from(new Set(predictions.map((p) => p.user_id)));
  const tokenSymbols = [match.home_token, match.away_token].filter(
    (token): token is string => Boolean(token),
  );

  let tokenRows: UserTokenPulseRow[] = [];
  if (userIds.length > 0 && tokenSymbols.length > 0) {
    const { data, error } = await supabase
      .from("user_tokens")
      .select("user_id, token_symbol, staked_amount")
      .in("user_id", userIds)
      .in("token_symbol", tokenSymbols)
      .gt("staked_amount", 0);

    if (error) throw error;
    tokenRows = (data ?? []) as UserTokenPulseRow[];
  }

  const homeHolderIds = buildHolderSet(tokenRows, match.home_token);
  const awayHolderIds = buildHolderSet(tokenRows, match.away_token);

  const camps: FanPulseCamp[] = [
    buildCamp({
      key: "all",
      label: "All locked picks",
      tokenSymbol: null,
      predictions,
    }),
  ];

  if (match.home_token) {
    camps.push(
      buildCamp({
        key: "home",
        label: `${match.home_token} camp`,
        tokenSymbol: match.home_token,
        predictions: predictions.filter((p) => homeHolderIds.has(p.user_id)),
      }),
    );
  }

  if (match.away_token) {
    camps.push(
      buildCamp({
        key: "away",
        label: `${match.away_token} camp`,
        tokenSymbol: match.away_token,
        predictions: predictions.filter((p) => awayHolderIds.has(p.user_id)),
      }),
    );
  }

  camps.push(
    buildCamp({
      key: "neutral",
      label: "Neutral fans",
      tokenSymbol: null,
      predictions: predictions.filter(
        (p) => !homeHolderIds.has(p.user_id) && !awayHolderIds.has(p.user_id),
      ),
    }),
  );

  return {
    matchId: match.id,
    totalPicks: predictions.length,
    camps,
  };
}

function buildHolderSet(
  rows: UserTokenPulseRow[],
  tokenSymbol: string | null,
): Set<string> {
  if (!tokenSymbol) return new Set();

  return new Set(
    rows
      .filter(
        (row) => row.token_symbol === tokenSymbol && row.staked_amount > 0,
      )
      .map((row) => row.user_id),
  );
}

function buildCamp({
  key,
  label,
  tokenSymbol,
  predictions,
}: {
  key: FanPulseCampKey;
  label: string;
  tokenSymbol: string | null;
  predictions: PredictionPulseRow[];
}): FanPulseCamp {
  const total = predictions.length;
  const counts = new Map<PredictedResult, number>(
    RESULT_ORDER.map((result) => [result, 0]),
  );

  for (const prediction of predictions) {
    counts.set(
      prediction.predicted_result,
      (counts.get(prediction.predicted_result) ?? 0) + 1,
    );
  }

  const segments = RESULT_ORDER.map((result) => {
    const count = counts.get(result) ?? 0;
    return {
      result,
      count,
      percentage: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });

  const leadingSegment = [...segments].sort((a, b) => b.count - a.count)[0];

  return {
    key,
    label,
    tokenSymbol,
    totalPicks: total,
    leadingResult:
      leadingSegment && leadingSegment.count > 0 ? leadingSegment.result : null,
    leadingPercentage:
      leadingSegment && leadingSegment.count > 0
        ? leadingSegment.percentage
        : 0,
    segments,
  };
}
