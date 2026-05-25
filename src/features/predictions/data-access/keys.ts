export const userPredictionsQueryKey = (userId: string) =>
  ["predictions", "user", userId] as const;

export const predictionQueryKey = (userId: string, matchId: string) =>
  ["predictions", "by-match", userId, matchId] as const;

export const fanPulseQueryKey = (matchId: string) =>
  ["predictions", "fan-pulse", matchId] as const;
