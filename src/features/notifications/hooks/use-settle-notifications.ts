"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useUserPredictions } from "@/features/predictions/data-access/queries/use-user-predictions";
import { useMatches } from "@/features/matches/data-access/queries/use-matches";
import { useCurrentUserId } from "@/providers/UserSessionProvider";
import type { Match, Prediction } from "@/lib/types";

const LS_KEY_PREFIX = "tc_notifications_last_seen_";

export interface SettleNotification {
  predictionId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  pointsEarned: number;
  voided: boolean;
  settledAt: string;
}

/* ── Tiny external store: localStorage timestamp per user ─────────────── */

function lsKey(userId: string | null): string {
  return userId ? LS_KEY_PREFIX + userId : "";
}

function getLastSeen(userId: string | null): number {
  if (!userId || typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(lsKey(userId));
  return raw ? Number(raw) || 0 : 0;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("tc:notifications-seen", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tc:notifications-seen", callback);
  };
}

function getServerSnapshot(): number {
  return 0;
}

function useLastSeenAt(userId: string | null): number {
  return useSyncExternalStore(
    subscribe,
    () => getLastSeen(userId),
    getServerSnapshot,
  );
}

export function markNotificationsSeen(userId: string | null): void {
  if (!userId || typeof window === "undefined") return;
  window.localStorage.setItem(lsKey(userId), String(Date.now()));
  window.dispatchEvent(new Event("tc:notifications-seen"));
}

/* ── The hook itself ──────────────────────────────────────────────────── */

interface UseSettleNotificationsResult {
  notifications: SettleNotification[];
  unreadCount: number;
  markAllSeen: () => void;
}

const MAX_NOTIFICATIONS = 10;

export function useSettleNotifications(): UseSettleNotificationsResult {
  const userId = useCurrentUserId();
  const { data: predictions = [] } = useUserPredictions();
  const { data: matches = [] } = useMatches();
  const lastSeenAt = useLastSeenAt(userId);

  const matchById = useMemo(() => {
    const m = new Map<string, Match>();
    for (const match of matches) m.set(match.id, match);
    return m;
  }, [matches]);

  const notifications = useMemo<SettleNotification[]>(() => {
    return (predictions as Prediction[])
      .filter((p) => !!p.settled_at)
      .map((p) => {
        const match = matchById.get(p.match_id);
        if (!match) return null;
        return {
          predictionId: p.id,
          matchId: p.match_id,
          homeTeam: match.home_team,
          awayTeam: match.away_team,
          pointsEarned: p.points_earned ?? 0,
          voided: p.is_voided,
          settledAt: p.settled_at as string,
        };
      })
      .filter((n): n is SettleNotification => n !== null)
      .sort((a, b) => +new Date(b.settledAt) - +new Date(a.settledAt))
      .slice(0, MAX_NOTIFICATIONS);
  }, [predictions, matchById]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => +new Date(n.settledAt) > lastSeenAt).length,
    [notifications, lastSeenAt],
  );

  const markAllSeen = () => markNotificationsSeen(userId);

  return { notifications, unreadCount, markAllSeen };
}
