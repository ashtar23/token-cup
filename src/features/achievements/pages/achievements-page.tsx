"use client";

import { useMemo, useState } from "react";
import { Award, CheckCircle2, Lock } from "lucide-react";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementCard } from "../components/achievement-card";
import { useAchievements } from "../data-access/queries/use-achievements";
import { areAchievementsEnabled } from "../lib/achievement-flags";
import type { AchievementCategory } from "../lib/achievement-definitions";
import { useAuthGuard } from "@/hooks/use-auth-guard";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "prediction", label: "Prediction" },
  { value: "token", label: "Tokens" },
  { value: "settlement", label: "Scoring" },
  { value: "streak", label: "Streaks" },
  { value: "leaderboard", label: "Leaderboard" },
] as const satisfies readonly {
  value: AchievementCategory | "all";
  label: string;
}[];

type AchievementFilter = (typeof FILTERS)[number]["value"];

export function AchievementsPage() {
  useAuthGuard();

  const achievementsEnabled = areAchievementsEnabled();
  const { data = [], isLoading } = useAchievements();
  const [filter, setFilter] = useState<AchievementFilter>("all");

  const unlocked = data.filter((item) => item.unlockedAt !== null);
  const totalXp = unlocked.reduce(
    (sum, item) => sum + item.definition.points,
    0,
  );
  const completion = data.length
    ? Math.round((unlocked.length / data.length) * 100)
    : 0;

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((item) => item.definition.category === filter);
  }, [data, filter]);

  return (
    <>
      <InsetHeader title="Achievements" />

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
        {!achievementsEnabled ? (
          <EmptyState
            icon="🏆"
            title="Achievements are disabled"
            description="Set NEXT_PUBLIC_ACHIEVEMENTS_ENABLED=true to show the progression system."
          />
        ) : (
          <>
            <AchievementSummary
              unlockedCount={unlocked.length}
              totalCount={data.length}
              completion={completion}
              totalXp={totalXp}
            />

            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={filter === item.value ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <AchievementSkeleton />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="🏆"
                title="No achievements in this category"
                description="Try another filter to see the full achievement set."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((achievement) => (
                  <AchievementCard
                    key={achievement.definition.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function AchievementSummary({
  unlockedCount,
  totalCount,
  completion,
  totalXp,
}: {
  unlockedCount: number;
  totalCount: number;
  completion: number;
  totalXp: number;
}) {
  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Trophy room
              </p>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {unlockedCount} of {totalCount} unlocked
            </h2>
          </div>
          <Badge variant="default" className="shrink-0">
            {totalXp} XP
          </Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-semibold">{completion}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <SummaryPill
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Unlocked"
            value={unlockedCount.toLocaleString()}
          />
          <SummaryPill
            icon={<Lock className="h-4 w-4" />}
            label="Remaining"
            value={Math.max(totalCount - unlockedCount, 0).toLocaleString()}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function AchievementSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex gap-3 p-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
