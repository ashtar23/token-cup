"use client";

import * as React from "react";
import {
  setClientUserId,
  clearClientUserId,
  getClientUserId,
} from "@/lib/user-session";

interface UserSessionContextValue {
  userId: string | null;
  setUserId: (id: string) => void;
  clearUserId: () => void;
}

const UserSessionContext = React.createContext<UserSessionContextValue | null>(
  null,
);

export function UserSessionProvider({
  initialUserId,
  children,
}: {
  initialUserId: string | null;
  children: React.ReactNode;
}) {
  const [userId, setUserIdState] = React.useState<string | null>(initialUserId);

  // Keep in sync across tabs — when another tab sets/clears the cookie,
  // we won't see it via cookie alone, but a storage event will fire if
  // someone also writes to localStorage. Cheap belt-and-suspenders.
  React.useEffect(() => {
    const onFocus = () => {
      const fresh = getClientUserId();
      setUserIdState((curr) => (curr === fresh ? curr : fresh));
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const setUserId = React.useCallback((id: string) => {
    setClientUserId(id);
    setUserIdState(id);
  }, []);

  const clearUserId = React.useCallback(() => {
    clearClientUserId();
    setUserIdState(null);
  }, []);

  const value = React.useMemo(
    () => ({ userId, setUserId, clearUserId }),
    [userId, setUserId, clearUserId],
  );

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession(): UserSessionContextValue {
  const ctx = React.useContext(UserSessionContext);
  if (!ctx)
    throw new Error("useUserSession must be used within UserSessionProvider");
  return ctx;
}

/** Convenience: just the userId (or null if not connected). */
export function useCurrentUserId(): string | null {
  return useUserSession().userId;
}
