"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchMatches, type FetchMatchesParams } from "../../api/matches-api";
import { MATCHES_QUERY_KEY } from "../keys";
import type { Match } from "@/lib/types";

export type UseMatchesOptions = Omit<
  UseQueryOptions<Match[], Error>,
  "queryKey" | "queryFn"
> &
  FetchMatchesParams;

export function useMatches(options: UseMatchesOptions = {}) {
  const { group, search, ...queryOptions } = options;
  return useQuery({
    queryKey: [...MATCHES_QUERY_KEY, { group, search }] as const,
    queryFn: () => fetchMatches({ group, search }),
    ...queryOptions,
  });
}
