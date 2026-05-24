"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MATCHES_QUERY_KEY } from "@/features/matches/data-access/keys";

// Settle affects every user who predicted the match, so we invalidate by
// the broad prefixes. TanStack Query does prefix matching — these catch
// every entry under predictions/* and leaderboard/* in the cache.
const PREDICTIONS_PREFIX = ["predictions"] as const;
const LEADERBOARD_PREFIX = ["leaderboard"] as const;

export interface SettleMatchInput {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

async function settleMatch(input: SettleMatchInput) {
  const res = await fetch("/api/settle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Settle failed");
  return data as { settled: number };
}

export function useSettleMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settleMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PREDICTIONS_PREFIX });
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_PREFIX });
    },
  });
}
