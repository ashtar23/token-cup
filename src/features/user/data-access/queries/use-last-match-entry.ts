"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLastMatchEntry, fetchMatchEntry } from "../../api/user-api";
import { lastMatchEntryQueryKey, matchEntryQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function useLastMatchEntry(excludeMatchId?: string) {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: lastMatchEntryQueryKey(userId ?? "", excludeMatchId),
    queryFn: () => fetchLastMatchEntry(userId as string, excludeMatchId),
    enabled: !!userId,
  });
}

export function useMatchEntry(matchId: string | undefined) {
  const userId = useCurrentUserId();
  const enabled = !!userId && !!matchId;
  return useQuery({
    queryKey: matchEntryQueryKey(userId ?? "", matchId ?? ""),
    queryFn: () => fetchMatchEntry(userId as string, matchId as string),
    enabled,
  });
}
