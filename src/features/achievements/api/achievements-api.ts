import { supabase } from "@/lib/supabase";
import {
  ACHIEVEMENT_BY_ID,
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
  type AchievementId,
} from "../lib/achievement-definitions";

interface UserAchievementRow {
  achievement_id: AchievementId;
  unlocked_at: string;
  seen_at: string | null;
  metadata: Record<string, unknown>;
}

export interface AchievementView {
  definition: AchievementDefinition;
  unlockedAt: string | null;
  seenAt: string | null;
  metadata: Record<string, unknown>;
}

export async function fetchAchievements(
  userId: string,
): Promise<AchievementView[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at, seen_at, metadata")
    .eq("user_id", userId);

  if (error) throw error;

  const unlockedById = new Map<AchievementId, UserAchievementRow>();
  for (const row of (data ?? []) as UserAchievementRow[]) {
    if (ACHIEVEMENT_BY_ID.has(row.achievement_id)) {
      unlockedById.set(row.achievement_id, row);
    }
  }

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const unlock = unlockedById.get(definition.id);
    return {
      definition,
      unlockedAt: unlock?.unlocked_at ?? null,
      seenAt: unlock?.seen_at ?? null,
      metadata: unlock?.metadata ?? {},
    };
  });
}
