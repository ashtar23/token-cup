import type {
  AchievementDefinition,
  AchievementId,
} from "./achievement-definitions";

export interface AchievementUnlockPayload {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity: AchievementDefinition["rarity"];
  unlockedAt: string;
}
