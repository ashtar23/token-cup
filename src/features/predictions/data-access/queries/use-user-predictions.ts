"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserPredictions } from "../../api/predictions-api";
import { userPredictionsQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function useUserPredictions() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: userPredictionsQueryKey(userId ?? ""),
    queryFn: () => fetchUserPredictions(userId as string),
    enabled: !!userId,
  });
}
