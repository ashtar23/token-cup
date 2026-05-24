"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMatchLeaderboard } from "../../api/leaderboard-api";
import { matchLeaderboardQueryKey } from "../keys";

const MATCH_BOARD_STALE_TIME_MS = 60 * 1000;

export function useMatchLeaderboard(matchId: string | undefined) {
  return useQuery({
    queryKey: matchLeaderboardQueryKey(matchId ?? ""),
    queryFn: () => fetchMatchLeaderboard(matchId as string),
    enabled: !!matchId,
    staleTime: MATCH_BOARD_STALE_TIME_MS,
  });
}
