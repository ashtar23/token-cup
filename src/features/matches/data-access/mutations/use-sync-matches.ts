"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MATCHES_QUERY_KEY } from "../keys";

interface SyncResult {
  total: number;
  upserted: number;
  skipped?: number;
}

async function syncMatches(): Promise<SyncResult> {
  const res = await fetch("/api/sync-matches");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Sync failed");
  return data as SyncResult;
}

export function useSyncMatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncMatches,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
    },
  });
}
