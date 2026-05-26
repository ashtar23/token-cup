export type AchievementCategory =
  | "prediction"
  | "token"
  | "streak"
  | "leaderboard"
  | "settlement";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type AchievementId =
  | "first_lock"
  | "token_backer"
  | "early_caller"
  | "crowd_rider"
  | "contrarian"
  | "points_on_board"
  | "perfect_read"
  | "diamond_hands"
  | "on_fire"
  | "token_captain"
  | "podium_threat"
  | "tournament_climber";

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  points: number;
  rarity: AchievementRarity;
  sortOrder: number;
}

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first_lock",
    title: "First Lock",
    description: "Lock your first match prediction.",
    category: "prediction",
    icon: "🏁",
    points: 10,
    rarity: "common",
    sortOrder: 10,
  },
  {
    id: "token_backer",
    title: "Token Backer",
    description: "Lock a prediction with a team-token bonus.",
    category: "token",
    icon: "🛡️",
    points: 20,
    rarity: "common",
    sortOrder: 20,
  },
  {
    id: "early_caller",
    title: "Early Caller",
    description: "Lock a prediction at least seven days before kickoff.",
    category: "prediction",
    icon: "🕰️",
    points: 20,
    rarity: "rare",
    sortOrder: 30,
  },
  {
    id: "crowd_rider",
    title: "Crowd Rider",
    description: "Lock a pick that matches the Fan Pulse leader.",
    category: "prediction",
    icon: "📡",
    points: 25,
    rarity: "rare",
    sortOrder: 40,
  },
  {
    id: "contrarian",
    title: "Contrarian",
    description: "Lock a pick against the Fan Pulse leader.",
    category: "prediction",
    icon: "⚡",
    points: 25,
    rarity: "rare",
    sortOrder: 50,
  },
  {
    id: "points_on_board",
    title: "Points On Board",
    description: "Earn your first settled points.",
    category: "settlement",
    icon: "💰",
    points: 20,
    rarity: "common",
    sortOrder: 60,
  },
  {
    id: "perfect_read",
    title: "Perfect Read",
    description: "Correctly predict both result and goals range.",
    category: "settlement",
    icon: "🎯",
    points: 40,
    rarity: "rare",
    sortOrder: 70,
  },
  {
    id: "diamond_hands",
    title: "Diamond Hands",
    description: "Maintain enough stake through settlement.",
    category: "settlement",
    icon: "🔒",
    points: 20,
    rarity: "common",
    sortOrder: 80,
  },
  {
    id: "on_fire",
    title: "On Fire",
    description: "Settle a prediction with a 3-match streak active.",
    category: "streak",
    icon: "🔥",
    points: 50,
    rarity: "epic",
    sortOrder: 90,
  },
  {
    id: "token_captain",
    title: "Token Captain",
    description: "Earn points from a prediction with a team-token bonus.",
    category: "token",
    icon: "👑",
    points: 50,
    rarity: "epic",
    sortOrder: 100,
  },
  {
    id: "podium_threat",
    title: "Podium Threat",
    description: "Reach the top 3 on a match leaderboard.",
    category: "leaderboard",
    icon: "🏆",
    points: 60,
    rarity: "epic",
    sortOrder: 110,
  },
  {
    id: "tournament_climber",
    title: "Tournament Climber",
    description: "Reach 500 total tournament points.",
    category: "leaderboard",
    icon: "📈",
    points: 60,
    rarity: "epic",
    sortOrder: 120,
  },
] as const satisfies readonly AchievementDefinition[];

export const ACHIEVEMENT_BY_ID = new Map(
  ACHIEVEMENT_DEFINITIONS.map((definition) => [definition.id, definition]),
);
