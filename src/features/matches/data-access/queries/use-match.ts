"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMatch } from "../../api/matches-api";
import { matchQueryKey } from "../keys";

const MATCH_DETAIL_STALE_TIME_MS = 2 * 60 * 1000;
const MATCH_DETAIL_GC_TIME_MS = 15 * 60 * 1000;

export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: matchQueryKey(matchId ?? ""),
    queryFn: () => fetchMatch(matchId as string),
    enabled: !!matchId,
    staleTime: MATCH_DETAIL_STALE_TIME_MS,
    gcTime: MATCH_DETAIL_GC_TIME_MS,
  });
}
