"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTournamentLeaderboard } from "../../api/leaderboard-api";
import { TOURNAMENT_LEADERBOARD_QUERY_KEY } from "../keys";

const TOURNAMENT_BOARD_STALE_TIME_MS = 60 * 1000;

export function useTournamentLeaderboard() {
  return useQuery({
    queryKey: TOURNAMENT_LEADERBOARD_QUERY_KEY,
    queryFn: fetchTournamentLeaderboard,
    staleTime: TOURNAMENT_BOARD_STALE_TIME_MS,
  });
}
