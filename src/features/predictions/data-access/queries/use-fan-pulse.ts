"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFanPulse } from "../../api/fan-pulse-api";
import { fanPulseQueryKey } from "../keys";
import type { Match } from "@/lib/types";

export function useFanPulse(match: Match | null | undefined) {
  return useQuery({
    queryKey: fanPulseQueryKey(match?.id ?? ""),
    queryFn: () => {
      if (!match) throw new Error("Match is required for Fan Pulse");
      return fetchFanPulse(match);
    },
    enabled: Boolean(match?.id),
    staleTime: 20_000,
  });
}
