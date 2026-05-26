export const ARENA_TABS = ["open", "predicted", "settled", "results"] as const;

export type ArenaTab = (typeof ARENA_TABS)[number];

export const DEFAULT_ARENA_TAB: ArenaTab = "open";

export const ARENA_VIEW_PARAM = {
  tab: "tab",
  group: "group",
  search: "q",
} as const;

export function isArenaTab(value: string): value is ArenaTab {
  return ARENA_TABS.includes(value as ArenaTab);
}

export function parseArenaTab(value: string | null): ArenaTab {
  return value !== null && isArenaTab(value) ? value : DEFAULT_ARENA_TAB;
}

export function parseNullableViewParam(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function parseSearchViewParam(value: string | null): string {
  return value ?? "";
}
