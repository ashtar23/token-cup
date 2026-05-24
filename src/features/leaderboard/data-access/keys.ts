export const TOURNAMENT_LEADERBOARD_QUERY_KEY = [
  "leaderboard",
  "tournament",
] as const;

export const matchLeaderboardQueryKey = (matchId: string) =>
  ["leaderboard", "match", matchId] as const;
