"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTournamentLeaderboard } from "../../api/leaderboard-api";
import { TOURNAMENT_LEADERBOARD_QUERY_KEY } from "../keys";

export function useTournamentLeaderboard() {
  return useQuery({
    queryKey: TOURNAMENT_LEADERBOARD_QUERY_KEY,
    queryFn: fetchTournamentLeaderboard,
  });
}
