"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchSquad, type Squad } from "../../api/teams-api";
import { squadQueryKey } from "../keys";

const SQUAD_STALE_TIME_MS = 30 * 60 * 1000; // 30 min — squads rarely change
const SQUAD_GC_TIME_MS = 60 * 60 * 1000;

export function useSquad(teamApiId: number | null | undefined) {
  return useQuery({
    queryKey: squadQueryKey(teamApiId ?? 0),
    queryFn: () => fetchSquad(teamApiId as number),
    enabled: !!teamApiId,
    staleTime: SQUAD_STALE_TIME_MS,
    gcTime: SQUAD_GC_TIME_MS,
    retry: 1,
  });
}

/**
 * Convenience hook for fetching multiple squads in parallel (e.g. both
 * teams of a match). Returns each query's status so callers can show
 * a partial result when one team's squad fails or is empty.
 */
export function useSquads(teamApiIds: Array<number | null | undefined>) {
  return useQueries({
    queries: teamApiIds.map((id) => ({
      queryKey: squadQueryKey(id ?? 0),
      queryFn: () => fetchSquad(id as number),
      enabled: !!id,
      staleTime: SQUAD_STALE_TIME_MS,
      gcTime: SQUAD_GC_TIME_MS,
      retry: 1,
    })),
  }) as Array<{
    data: Squad | undefined;
    isLoading: boolean;
    isError: boolean;
  }>;
}
