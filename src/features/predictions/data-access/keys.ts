export const userPredictionsQueryKey = (userId: string) =>
  ["predictions", "user", userId] as const;

export const predictionQueryKey = (userId: string, matchId: string) =>
  ["predictions", "by-match", userId, matchId] as const;
