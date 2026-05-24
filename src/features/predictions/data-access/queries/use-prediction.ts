"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPrediction } from "../../api/predictions-api";
import { predictionQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function usePrediction(matchId: string | undefined) {
  const userId = useCurrentUserId();
  const enabled = !!userId && !!matchId;
  return useQuery({
    queryKey: predictionQueryKey(userId ?? "", matchId ?? ""),
    queryFn: () => fetchPrediction(userId as string, matchId as string),
    enabled,
  });
}
