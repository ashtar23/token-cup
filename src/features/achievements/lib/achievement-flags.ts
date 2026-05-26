const DISABLED_VALUES = new Set(["0", "false", "off", "disabled"]);

export function areAchievementsEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_ACHIEVEMENTS_ENABLED;
  if (!value) return true;
  return !DISABLED_VALUES.has(value.toLowerCase());
}
