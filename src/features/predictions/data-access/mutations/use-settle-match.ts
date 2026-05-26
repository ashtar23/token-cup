"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncAchievementUnlocks } from "@/features/achievements/data-access/client-achievement-sync";
import type { AchievementUnlockPayload } from "@/features/achievements/lib/achievement-unlock";
import { MATCHES_QUERY_KEY } from "@/features/matches/data-access/keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

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
  return data as {
    settled: number;
    unlockedAchievements?: AchievementUnlockPayload[];
  };
}

export function useSettleMatch() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  return useMutation({
    mutationFn: settleMatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PREDICTIONS_PREFIX });
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_PREFIX });
      syncAchievementUnlocks({
        queryClient,
        userId,
        unlocks: data.unlockedAchievements,
      });
    },
  });
}
