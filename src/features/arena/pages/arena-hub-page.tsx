"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchSection } from "@/features/matches/components/match-section";
import { MatchFilters } from "@/features/matches/components/match-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatches } from "@/features/matches/data-access/queries/use-matches";
import { useSyncMatches } from "@/features/matches/data-access/mutations/use-sync-matches";
import { useUserPredictions } from "@/features/predictions/data-access/queries/use-user-predictions";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import { useUpsertUserToken } from "@/features/user/data-access/mutations/use-token-mutations";
import { useUser } from "@/features/user/data-access/queries/use-user";
import { getHeldTokenSymbols } from "@/features/user/lib/tokens";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import type { Prediction } from "@/lib/types";

export function ArenaHubPage() {
  useAuthGuard();

  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { isLoading: userLoading } = useUser();
  const { data: predictionsArr = [], isLoading: predsLoading } =
    useUserPredictions();
  const { data: userTokens = [] } = useUserTokens();
  const syncMatches = useSyncMatches();
  const upsertToken = useUpsertUserToken();

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const predictionsMap = useMemo(() => {
    const map: Record<string, Prediction> = {};
    for (const p of predictionsArr) map[p.match_id] = p;
    return map;
  }, [predictionsArr]);

  const heldTokens = useMemo(
    () => getHeldTokenSymbols(userTokens),
    [userTokens],
  );

  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    for (const m of matches) if (m.group_name) set.add(m.group_name);
    return [...set].sort();
  }, [matches]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return matches.filter((m) => {
      if (selectedGroup && m.group_name !== selectedGroup) return false;
      if (q && !`${m.home_team} ${m.away_team}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [matches, selectedGroup, searchQuery]);

  // Buckets for the three tabs (all scoped to the current user). Memoized
  // so child <MatchSection> components can skip re-renders on unrelated
  // state changes (search keystrokes, etc.).
  const { open, predicted, settled, predictedLive, predictedUpcoming } =
    useMemo(() => {
      const open = filtered.filter(
        (m) => m.status === "upcoming" && !predictionsMap[m.id],
      );
      const predicted = filtered.filter(
        (m) => m.status !== "settled" && !!predictionsMap[m.id],
      );
      const settled = filtered.filter(
        (m) => m.status === "settled" && !!predictionsMap[m.id],
      );
      return {
        open,
        predicted,
        settled,
        predictedLive: predicted.filter((m) => m.status === "live"),
        predictedUpcoming: predicted.filter((m) => m.status === "upcoming"),
      };
    }, [filtered, predictionsMap]);

  const openCount = open.length;
  const predictedCount = predicted.length;
  const settledCount = settled.length;

  if (matchesLoading || userLoading || predsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  return (
    <>
      <InsetHeader title="Arena" />

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-6">
        {matches.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No matches synced yet"
            description="Pull the latest WC 2026 fixtures from football-data.org to start playing."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => syncMatches.mutate()}
                  disabled={syncMatches.isPending}
                >
                  {syncMatches.isPending ? "Syncing..." : "Sync fixtures"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dev">Open demo controls</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {userTokens.length === 0 && (
              <DemoTokenSetup
                isPending={upsertToken.isPending}
                onApply={async () => {
                  await upsertToken.mutateAsync({ symbol: "ARG", amount: 120 });
                  await upsertToken.mutateAsync({ symbol: "BRA", amount: 80 });
                  await upsertToken.mutateAsync({ symbol: "CHZ", amount: 200 });
                }}
              />
            )}

            <MatchFilters
              groups={availableGroups}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <Tabs defaultValue="open">
              <TabsList className="w-full">
                <TabsTrigger value="open" className="flex-1 text-base gap-1.5">
                  Open
                  <CountBadge>{openCount}</CountBadge>
                </TabsTrigger>
                <TabsTrigger
                  value="predicted"
                  className="flex-1 text-base gap-1.5"
                >
                  Predicted
                  <CountBadge>{predictedCount}</CountBadge>
                </TabsTrigger>
                <TabsTrigger
                  value="settled"
                  className="flex-1 text-base gap-1.5"
                >
                  Settled
                  <CountBadge>{settledCount}</CountBadge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="mt-5 space-y-6">
                <MatchSection
                  title="Open"
                  matches={open}
                  predictions={predictionsMap}
                  heldTokens={heldTokens}
                />
                {openCount === 0 && (
                  <EmptyState
                    icon="⚽"
                    title="No open matches right now"
                    description="Check back after the next kickoff, or change your group/search filters above."
                  />
                )}
              </TabsContent>

              <TabsContent value="predicted" className="mt-5 space-y-6">
                <MatchSection
                  title="Live"
                  matches={predictedLive}
                  predictions={predictionsMap}
                  heldTokens={heldTokens}
                />
                <MatchSection
                  title="Upcoming"
                  matches={predictedUpcoming}
                  predictions={predictionsMap}
                  heldTokens={heldTokens}
                />
                {predictedCount === 0 && (
                  <EmptyState
                    icon="🎯"
                    title="No locked predictions yet"
                    description="Pick a match from the Open tab to make your first call."
                  />
                )}
              </TabsContent>

              <TabsContent value="settled" className="mt-5 space-y-6">
                <MatchSection
                  title="Settled"
                  matches={settled}
                  predictions={predictionsMap}
                  heldTokens={heldTokens}
                />
                {settledCount === 0 && (
                  <EmptyState
                    icon="🏁"
                    title="No settled matches yet"
                    description="Your scored predictions will show up here after each full time."
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
}

function DemoTokenSetup({
  isPending,
  onApply,
}: {
  isPending: boolean;
  onApply: () => void | Promise<void>;
}) {
  return (
    <Card className="border border-tc-orange/25 bg-tc-orange/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Add demo Fan Tokens
          </p>
          <p className="text-xs text-muted-foreground">
            Start with ARG, BRA, and CHZ stake so bonuses and eligibility light
            up.
          </p>
        </div>
        <Button onClick={onApply} disabled={isPending} className="shrink-0">
          {isPending ? "Adding..." : "Add demo stake"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-sm font-semibold tabular-nums">
      {children}
    </span>
  );
}
