"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAchievements } from "../../api/achievements-api";
import { achievementsQueryKey } from "../keys";
import { areAchievementsEnabled } from "../../lib/achievement-flags";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function useAchievements() {
  const userId = useCurrentUserId();

  return useQuery({
    queryKey: achievementsQueryKey(userId ?? ""),
    queryFn: () => fetchAchievements(userId as string),
    enabled: !!userId && areAchievementsEnabled(),
  });
}
