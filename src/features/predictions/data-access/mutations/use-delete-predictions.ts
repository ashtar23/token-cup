"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userPredictionsQueryKey } from "../keys";
import { achievementsQueryKey } from "@/features/achievements/data-access/keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

const LEADERBOARD_PREFIX = ["leaderboard"] as const;

/**
 * Dev-only: clear all predictions for the currently connected user
 * so the demo can be replayed against the same matches.
 */
export function useDeleteAllPredictions() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not connected");
      const res = await fetch("/api/predictions", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Prediction reset failed");
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: userPredictionsQueryKey(userId),
        });
        queryClient.invalidateQueries({
          queryKey: achievementsQueryKey(userId),
        });
      }
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_PREFIX });
    },
  });
}
