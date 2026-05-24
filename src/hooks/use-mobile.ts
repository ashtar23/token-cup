"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

// SSR snapshot — assume desktop so the markup matches the desktop layout
// (mobile gets a hydration update on first paint via useSyncExternalStore)
function getServerSnapshot() {
  return false;
}

/**
 * Reactive flag for sub-md viewports.
 * Uses useSyncExternalStore — no setState-in-effect, no hydration mismatch.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
