"use client";

import { CheckCircle2, Lock } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AchievementView } from "../api/achievements-api";

const achievementCardVariants = cva(
  "relative overflow-hidden transition",
  {
    variants: {
      state: {
        unlocked: "border-primary/35 bg-primary/5",
        locked: "border-border bg-card opacity-70",
      },
      rarity: {
        common: "",
        rare: "shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.18)]",
        epic: "shadow-[inset_0_0_0_1px_hsl(var(--tc-orange)/0.22)]",
        legendary: "shadow-[inset_0_0_0_1px_hsl(var(--tc-green)/0.24)]",
      },
    },
    defaultVariants: {
      state: "locked",
      rarity: "common",
    },
  },
);

interface AchievementCardProps
  extends VariantProps<typeof achievementCardVariants> {
  achievement: AchievementView;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { definition, unlockedAt } = achievement;
  const unlocked = unlockedAt !== null;

  return (
    <Card
      className={cn(
        achievementCardVariants({
          state: unlocked ? "unlocked" : "locked",
          rarity: definition.rarity,
        }),
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl",
              unlocked ? "bg-primary/15" : "bg-muted",
            )}
          >
            {unlocked ? definition.icon : <Lock className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {definition.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {definition.description}
                </p>
              </div>
              {unlocked && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tc-green" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={unlocked ? "default" : "muted"}>
                +{definition.points} XP
              </Badge>
              <Badge variant={rarityBadgeVariant(definition.rarity)}>
                {formatLabel(definition.rarity)}
              </Badge>
              <Badge variant="outline">{formatLabel(definition.category)}</Badge>
            </div>

            {unlockedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Unlocked {formatUnlockedDate(unlockedAt)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function rarityBadgeVariant(rarity: AchievementView["definition"]["rarity"]) {
  if (rarity === "epic") return "orange";
  if (rarity === "legendary") return "green";
  if (rarity === "rare") return "default";
  return "secondary";
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatUnlockedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
