import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACHIEVEMENT_BY_ID,
  type AchievementDefinition,
  type AchievementId,
} from "./achievement-definitions";
import type { AchievementUnlockPayload } from "./achievement-unlock";
import { areAchievementsEnabled } from "./achievement-flags";
import type { PredictedResult } from "@/lib/types";

export type AchievementEvent =
  | {
      type: "PREDICTION_LOCKED";
      userId: string;
      sourceId: string;
      payload: {
        predictionCount: number;
        has2xBonus: boolean;
        predictedResult: PredictedResult;
        kickoffAt: string;
        fanPulseLeader: PredictedResult | null;
      };
    }
  | {
      type: "MATCH_SETTLED";
      userId: string;
      sourceId: string;
      payload: {
        pointsEarned: number;
        isVoided: boolean;
        streakCount: number;
        has2xBonus: boolean;
        correctResult: boolean;
        correctGoalsRange: boolean;
        matchRank: number | null;
        tournamentPoints: number;
      };
    };

export interface AchievementUnlock {
  achievement: AchievementDefinition;
  unlockedAt: string;
}

export function toAchievementUnlockPayload(
  unlock: AchievementUnlock,
): AchievementUnlockPayload {
  return {
    id: unlock.achievement.id,
    title: unlock.achievement.title,
    description: unlock.achievement.description,
    icon: unlock.achievement.icon,
    points: unlock.achievement.points,
    rarity: unlock.achievement.rarity,
    unlockedAt: unlock.unlockedAt,
  };
}

export async function recordAchievementEvent(
  supabase: SupabaseClient,
  event: AchievementEvent,
): Promise<AchievementUnlock[]> {
  if (!areAchievementsEnabled()) return [];

  await supabase.from("achievement_events").insert({
    user_id: event.userId,
    event_type: event.type,
    source_id: event.sourceId,
    payload: event.payload,
  });

  const candidateIds = evaluateAchievementIds(event);
  if (candidateIds.length === 0) return [];

  const { data: existingRows } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", event.userId)
    .in("achievement_id", candidateIds);

  const existingIds = new Set(
    ((existingRows ?? []) as { achievement_id: AchievementId }[]).map(
      (row) => row.achievement_id,
    ),
  );
  const newIds = candidateIds.filter((id) => !existingIds.has(id));
  if (newIds.length === 0) return [];

  const unlockedAt = new Date().toISOString();
  const rows = newIds.map((id) => ({
    user_id: event.userId,
    achievement_id: id,
    unlocked_at: unlockedAt,
    metadata: event.payload,
  }));

  const { data: insertedRows, error } = await supabase
    .from("user_achievements")
    .insert(rows)
    .select("achievement_id, unlocked_at");

  if (error) return [];

  const unlocks: AchievementUnlock[] = [];
  for (const row of (insertedRows ?? []) as {
    achievement_id: AchievementId;
    unlocked_at: string;
  }[]) {
    const achievement = ACHIEVEMENT_BY_ID.get(row.achievement_id);
    if (achievement) {
      unlocks.push({
        achievement,
        unlockedAt: row.unlocked_at,
      });
    }
  }

  return unlocks;
}

function evaluateAchievementIds(event: AchievementEvent): AchievementId[] {
  if (event.type === "PREDICTION_LOCKED") {
    const ids: AchievementId[] = [];
    const daysUntilKickoff =
      (new Date(event.payload.kickoffAt).getTime() - Date.now()) / 86_400_000;

    if (event.payload.predictionCount === 1) ids.push("first_lock");
    if (event.payload.has2xBonus) ids.push("token_backer");
    if (daysUntilKickoff >= 7) ids.push("early_caller");
    if (event.payload.fanPulseLeader !== null) {
      ids.push(
        event.payload.fanPulseLeader === event.payload.predictedResult
          ? "crowd_rider"
          : "contrarian",
      );
    }

    return ids;
  }

  const ids: AchievementId[] = [];
  if (!event.payload.isVoided) ids.push("diamond_hands");
  if (event.payload.pointsEarned > 0) ids.push("points_on_board");
  if (event.payload.correctResult && event.payload.correctGoalsRange) {
    ids.push("perfect_read");
  }
  if (event.payload.pointsEarned > 0 && event.payload.has2xBonus) {
    ids.push("token_captain");
  }
  if (event.payload.streakCount >= 3) ids.push("on_fire");
  if (event.payload.matchRank !== null && event.payload.matchRank <= 3) {
    ids.push("podium_threat");
  }
  if (event.payload.tournamentPoints >= 500) ids.push("tournament_climber");

  return ids;
}
