/**
 * Query keys for the user feature.
 * All are scoped by userId so switching accounts purges the right cache slice.
 */

export const userQueryKey = (userId: string) => ["user", userId] as const;

export const userTokensQueryKey = (userId: string) =>
  ["user-tokens", userId] as const;

export const lastMatchEntryQueryKey = (
  userId: string,
  excludeMatchId?: string,
) => ["match-entries", "last", userId, excludeMatchId ?? null] as const;

export const matchEntryQueryKey = (userId: string, matchId: string) =>
  ["match-entries", "by-match", userId, matchId] as const;
