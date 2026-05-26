"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fanPulseQueryKey,
  predictionQueryKey,
  userPredictionsQueryKey,
} from "../keys";
import { syncAchievementUnlocks } from "@/features/achievements/data-access/client-achievement-sync";
import type { AchievementUnlockPayload } from "@/features/achievements/lib/achievement-unlock";
import { useCurrentUserId } from "@/providers/UserSessionProvider";
import type { PredictedResult, GoalsRange } from "@/lib/types";

export interface SubmitPredictionInput {
  matchId: string;
  predictedResult: PredictedResult;
  predictedGoalsRange?: GoalsRange | null;
  predictedFirstScorer?: string | null;
}

async function submitPrediction(input: SubmitPredictionInput) {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Submission failed");
  return data as {
    success: true;
    unlockedAchievements?: AchievementUnlockPayload[];
  };
}

export function useSubmitPrediction() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  return useMutation({
    mutationFn: submitPrediction,
    onSuccess: (data, vars) => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: predictionQueryKey(userId, vars.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: userPredictionsQueryKey(userId),
      });
      queryClient.invalidateQueries({
        queryKey: fanPulseQueryKey(vars.matchId),
      });
      syncAchievementUnlocks({
        queryClient,
        userId,
        unlocks: data.unlockedAchievements,
      });
    },
  });
}
