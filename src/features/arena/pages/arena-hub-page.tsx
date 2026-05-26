"use client";

import { useState } from "react";
import Link from "next/link";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { MatchFilters } from "@/features/matches/components/match-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ArenaMatchTabs } from "@/features/arena/components/arena-hub/arena-match-tabs";
import { DemoTokenSetup } from "@/features/arena/components/arena-hub/demo-token-setup";
import { MatchdayBriefing } from "@/features/arena/components/arena-hub/matchday-briefing";
import { useArenaHubState } from "@/features/arena/hooks/use-arena-hub-state";
import { useMatches } from "@/features/matches/data-access/queries/use-matches";
import { useSyncMatches } from "@/features/matches/data-access/mutations/use-sync-matches";
import { useUserPredictions } from "@/features/predictions/data-access/queries/use-user-predictions";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import { useUpsertUserToken } from "@/features/user/data-access/mutations/use-token-mutations";
import { useUser } from "@/features/user/data-access/queries/use-user";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function ArenaHubPage() {
  useAuthGuard();

  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { isLoading: userLoading } = useUser();
  const { data: predictions = [], isLoading: predictionsLoading } =
    useUserPredictions();
  const { data: userTokens = [], isLoading: tokensLoading } = useUserTokens();
  const syncMatches = useSyncMatches();
  const upsertToken = useUpsertUserToken();

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    availableGroups,
    briefing,
    heldTokens,
    matchGroups,
    predictionsByMatchId,
  } = useArenaHubState({
    matches,
    predictions,
    selectedGroup,
    searchQuery,
    userTokens,
  });

  async function applyDemoStake() {
    await Promise.all([
      upsertToken.mutateAsync({ symbol: "ARG", amount: 120 }),
      upsertToken.mutateAsync({ symbol: "BRA", amount: 80 }),
      upsertToken.mutateAsync({ symbol: "CHZ", amount: 200 }),
    ]);
  }

  if (matchesLoading || userLoading || predictionsLoading || tokensLoading) {
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
                onApply={applyDemoStake}
              />
            )}

            <MatchFilters
              groups={availableGroups}
              selectedGroup={selectedGroup}
              onGroupChange={setSelectedGroup}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <MatchdayBriefing briefing={briefing} />

            <ArenaMatchTabs
              heldTokens={heldTokens}
              matchGroups={matchGroups}
              predictionsByMatchId={predictionsByMatchId}
            />
          </>
        )}
      </div>
    </>
  );
}
