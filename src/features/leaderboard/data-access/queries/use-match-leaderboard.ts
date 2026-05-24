"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMatchLeaderboard } from "../../api/leaderboard-api";
import { matchLeaderboardQueryKey } from "../keys";

export function useMatchLeaderboard(matchId: string | undefined) {
  return useQuery({
    queryKey: matchLeaderboardQueryKey(matchId ?? ""),
    queryFn: () => fetchMatchLeaderboard(matchId as string),
    enabled: !!matchId,
  });
}
