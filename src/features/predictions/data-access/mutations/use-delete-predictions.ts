"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { userPredictionsQueryKey } from "../keys";
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
      const { error } = await supabase
        .from("predictions")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({
          queryKey: userPredictionsQueryKey(userId),
        });
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_PREFIX });
    },
  });
}
