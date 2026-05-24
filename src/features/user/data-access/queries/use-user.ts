"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../../api/user-api";
import { userQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export function useUser() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: userQueryKey(userId ?? ""),
    queryFn: () => fetchUser(userId as string),
    enabled: !!userId,
  });
}
