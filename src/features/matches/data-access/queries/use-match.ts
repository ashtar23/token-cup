"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMatch } from "../../api/matches-api";
import { matchQueryKey } from "../keys";

export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: matchQueryKey(matchId ?? ""),
    queryFn: () => fetchMatch(matchId as string),
    enabled: !!matchId,
  });
}
