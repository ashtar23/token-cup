"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { upsertUser } from "@/features/user/api/user-api";
import {
  useCurrentUserId,
  useUserSession,
} from "@/providers/UserSessionProvider";

export default function ConnectingPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const { clearUserId } = useUserSession();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      router.replace("/");
      return;
    }
    // Guard against React 18 StrictMode double-invocation
    if (startedRef.current) return;
    startedRef.current = true;

    // Run the upsert IN PARALLEL with the cosmetic spinner delay so we don't
    // wait sequentially. Total time = max(MIN_DELAY_MS, upsert latency).
    const MIN_DELAY_MS = 500;
    const minDelay = new Promise<void>((r) => setTimeout(r, MIN_DELAY_MS));

    Promise.all([upsertUser(userId), minDelay])
      .then(([user]) => {
        router.replace(user.fantasy_name ? "/arena" : "/setup");
      })
      .catch(() => {
        clearUserId();
        router.replace("/");
      });
  }, [router, userId, clearUserId]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 text-center">
        <div className="spinner mx-auto" />

        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Connecting wallet
          </h1>
          <p className="text-sm text-muted-foreground">
            Approve the connection request in your Socios.com app.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-tc-blue/30 bg-tc-blue/5 px-4 py-3 max-w-sm w-full text-left">
          <span className="text-lg shrink-0" aria-hidden="true">
            🛡️
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Token Cup only reads your wallet address and token balances. No
            transactions are ever requested.
          </p>
        </div>

        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            clearUserId();
            router.push("/");
          }}
        >
          Cancel
        </Button>
      </div>
    </main>
  );
}
