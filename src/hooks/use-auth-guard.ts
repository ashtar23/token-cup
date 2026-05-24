"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

/**
 * Redirect to / if no user is currently connected (no UUID cookie).
 * Used on every authed route as a client-side guard.
 */
export function useAuthGuard() {
  const router = useRouter();
  const userId = useCurrentUserId();
  useEffect(() => {
    if (!userId) router.replace("/");
  }, [userId, router]);
}
