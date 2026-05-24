"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserTokens } from "../../api/user-api";
import { userTokensQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function useUserTokens() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: userTokensQueryKey(userId ?? ""),
    queryFn: () => fetchUserTokens(userId as string),
    enabled: !!userId,
  });
}
