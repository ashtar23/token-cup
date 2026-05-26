"use client";

import { useEffect, useMemo } from "react";
import { Award, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENT_UNLOCK_EVENT } from "../lib/achievement-unlock-events";
import type { AchievementUnlockPayload } from "../lib/achievement-unlock";

const TOAST_MS = 5000;

export function AchievementToastHost() {
  useEffect(() => {
    function onUnlock(event: Event) {
      const customEvent = event as CustomEvent<AchievementUnlockPayload[]>;

      for (const unlock of customEvent.detail) {
        toast.custom(
          (toastId) => (
            <AchievementToastContent toastId={toastId} unlock={unlock} />
          ),
          {
            className:
              "!border-0 !bg-transparent !p-0 !shadow-none !outline-none",
            duration: TOAST_MS,
            unstyled: true,
          },
        );
      }
    }

    window.addEventListener(ACHIEVEMENT_UNLOCK_EVENT, onUnlock);
    return () => window.removeEventListener(ACHIEVEMENT_UNLOCK_EVENT, onUnlock);
  }, []);

  return null;
}

function AchievementToastContent({
  toastId,
  unlock,
}: {
  toastId: string | number;
  unlock: AchievementUnlockPayload;
}) {
  return (
    <div className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-card p-4 text-card-foreground shadow-2xl shadow-primary/15">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl">
          {unlock.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Award className="size-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Achievement unlocked
            </p>
          </div>
          <p className="truncate text-base font-semibold">{unlock.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {unlock.description}
          </p>
          <ToastMeta unlock={unlock} />
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="-mr-2 -mt-2 size-8 shrink-0"
          aria-label="Dismiss achievement"
          onClick={() => toast.dismiss(toastId)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ToastMeta({ unlock }: { unlock: AchievementUnlockPayload }) {
  const rarityLabel = useMemo(
    () => unlock.rarity.charAt(0).toUpperCase() + unlock.rarity.slice(1),
    [unlock.rarity],
  );

  return (
    <div className="mt-3 flex items-center gap-2">
      <Badge variant="default">+{unlock.points} XP</Badge>
      <Badge variant="secondary">{rarityLabel}</Badge>
    </div>
  );
}
