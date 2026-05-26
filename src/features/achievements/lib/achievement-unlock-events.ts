"use client";

import type { AchievementUnlockPayload } from "./achievement-unlock";
import { areAchievementsEnabled } from "./achievement-flags";

export const ACHIEVEMENT_UNLOCK_EVENT = "tc:achievement-unlocked";

export function publishAchievementUnlocks(
  unlocks: AchievementUnlockPayload[] | undefined,
): void {
  if (
    !areAchievementsEnabled() ||
    !unlocks?.length ||
    typeof window === "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AchievementUnlockPayload[]>(ACHIEVEMENT_UNLOCK_EVENT, {
      detail: unlocks,
    }),
  );
}
