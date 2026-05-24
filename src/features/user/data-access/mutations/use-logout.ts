"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUserSession } from "@/providers/UserSessionProvider";

/**
 * Clear the session cookie and drop the React Query cache.
 * The user's DB row is left intact so they can reconnect later with
 * the same UUID and resume their account.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { clearUserId } = useUserSession();
  return useMutation({
    mutationFn: async () => {
      clearUserId();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
  });
}
