"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fanPulseQueryKey } from "../keys";

async function seedFanPulse(matchId: string): Promise<{ seeded: number }> {
  const res = await fetch("/api/dev/seed-fan-pulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId }),
    credentials: "same-origin",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not seed Fan Pulse");
  return data as { seeded: number };
}

export function useSeedFanPulse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedFanPulse,
    onSuccess: (_data, matchId) => {
      queryClient.invalidateQueries({
        queryKey: fanPulseQueryKey(matchId),
      });
    },
  });
}
