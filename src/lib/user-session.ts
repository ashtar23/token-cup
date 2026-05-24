/**
 * User-session helpers — the single source of truth for "who is the
 * currently connected user" on both server and client.
 *
 * Backed by an HTTP-readable cookie `tc_user_id` so server components
 * and route handlers can resolve the user via `next/headers` without
 * a client roundtrip. A localStorage mirror exists only for the legacy
 * LS_CONNECTED check.
 */

export const USER_ID_COOKIE = "tc_user_id";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

// ── Client helpers ─────────────────────────────────────────────────────────

export function getClientUserId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${USER_ID_COOKIE}=([^;]+)`),
  );
  return match?.[1] ?? null;
}

export function setClientUserId(userId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${USER_ID_COOKIE}=${userId}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearClientUserId(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${USER_ID_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Misc ───────────────────────────────────────────────────────────────────

/** Deterministic fake wallet address derived from a UUID — for display only. */
export function fakeWalletFromUserId(userId: string): string {
  const hex = userId.replace(/-/g, "");
  return `0x${hex.slice(0, 4)}…${hex.slice(-4)}`;
}
