"use client";

import type { QueryClient } from "@tanstack/react-query";
import { achievementsQueryKey } from "./keys";
import { areAchievementsEnabled } from "../lib/achievement-flags";
import { publishAchievementUnlocks } from "../lib/achievement-unlock-events";
import type { AchievementUnlockPayload } from "../lib/achievement-unlock";

export function syncAchievementUnlocks({
  queryClient,
  userId,
  unlocks,
}: {
  queryClient: QueryClient;
  userId: string | null;
  unlocks: AchievementUnlockPayload[] | undefined;
}): void {
  if (!userId || !areAchievementsEnabled()) return;

  queryClient.invalidateQueries({
    queryKey: achievementsQueryKey(userId),
  });
  publishAchievementUnlocks(unlocks);
}
