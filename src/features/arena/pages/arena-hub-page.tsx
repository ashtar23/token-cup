"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Flame, ShieldCheck, Trophy } from "lucide-react";
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
import { TEAM_FLAG } from "@/lib/constants";
import type { Prediction } from "@/lib/types";

export function ArenaHubPage() {
  useAuthGuard();

  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { isLoading: userLoading } = useUser();
  const { data: predictionsArr = [], isLoading: predsLoading } =
    useUserPredictions();
  const { data: userTokens = [], isLoading: tokensLoading } = useUserTokens();
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

  const {
    open,
    predicted,
    settled,
    results,
    predictedLive,
    predictedUpcoming,
  } =
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
      const results = filtered.filter((m) => m.status === "settled");

      return {
        open,
        predicted,
        settled,
        results,
        predictedLive: predicted.filter((m) => m.status === "live"),
        predictedUpcoming: predicted.filter((m) => m.status === "upcoming"),
      };
    }, [filtered, predictionsMap]);

  const openCount = open.length;
  const predictedCount = predicted.length;
  const settledCount = settled.length;
  const resultsCount = results.length;

  const briefing = useMemo(
    () =>
      buildMatchdayBriefing({
        open,
        predictions: predictionsArr,
        heldTokens,
      }),
    [heldTokens, open, predictionsArr],
  );

  if (matchesLoading || userLoading || predsLoading || tokensLoading) {
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

            <MatchdayBriefing briefing={briefing} />

            <Tabs defaultValue="open">
              <div className="w-full overflow-hidden rounded-xl bg-muted p-1">
                <div className="overflow-x-auto">
                  <TabsList className="w-max min-w-full bg-transparent p-0">
                    <TabsTrigger
                      value="open"
                      className="min-w-28 flex-none gap-1 text-sm sm:min-w-0 sm:flex-1 sm:gap-1.5 sm:text-base"
                    >
                      Open
                      <CountBadge>{openCount}</CountBadge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="predicted"
                      className="min-w-32 flex-none gap-1 text-sm sm:min-w-0 sm:flex-1 sm:gap-1.5 sm:text-base"
                    >
                      Predicted
                      <CountBadge>{predictedCount}</CountBadge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="settled"
                      className="min-w-28 flex-none gap-1 text-sm sm:min-w-0 sm:flex-1 sm:gap-1.5 sm:text-base"
                    >
                      Scored
                      <CountBadge>{settledCount}</CountBadge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="results"
                      className="min-w-28 flex-none gap-1 text-sm sm:min-w-0 sm:flex-1 sm:gap-1.5 sm:text-base"
                    >
                      Results
                      <CountBadge>{resultsCount}</CountBadge>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

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
                    title="No scored predictions yet"
                    description="Your scored predictions will show up here after each full time."
                  />
                )}
              </TabsContent>

              <TabsContent value="results" className="mt-5 space-y-6">
                <MatchSection
                  title="Tournament results"
                  matches={results}
                  predictions={predictionsMap}
                  heldTokens={heldTokens}
                />
                {resultsCount === 0 && (
                  <EmptyState
                    icon="📜"
                    title="No tournament results yet"
                    description="Settled matches will stay visible here, even if you did not predict them."
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

interface MatchdayBriefingData {
  nextOpen: MatchBrief | null;
  bestBonus: MatchBrief | null;
  bestStreak: number;
  openCount: number;
}

interface MatchBrief {
  id: string;
  label: string;
  meta: string;
}

function buildMatchdayBriefing({
  open,
  predictions,
  heldTokens,
}: {
  open: Array<{
    id: string;
    home_team: string;
    away_team: string;
    home_token: string | null;
    away_token: string | null;
    kickoff_at: string;
    group_name: string | null;
  }>;
  predictions: Prediction[];
  heldTokens: string[];
}): MatchdayBriefingData {
  const byKickoff = [...open].sort(
    (a, b) =>
      new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime(),
  );
  const nextOpen = byKickoff[0] ? toMatchBrief(byKickoff[0]) : null;
  const bestBonusMatch = byKickoff.find(
    (match) =>
      (match.home_token !== null && heldTokens.includes(match.home_token)) ||
      (match.away_token !== null && heldTokens.includes(match.away_token)),
  );
  const bestStreak = Math.max(0, ...predictions.map((p) => p.streak_count));

  return {
    nextOpen,
    bestBonus: bestBonusMatch ? toMatchBrief(bestBonusMatch) : null,
    bestStreak,
    openCount: open.length,
  };
}

function toMatchBrief(match: {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  group_name: string | null;
}): MatchBrief {
  return {
    id: match.id,
    label: `${TEAM_FLAG[match.home_team] ?? "🏳️"} ${match.home_team} vs ${
      TEAM_FLAG[match.away_team] ?? "🏳️"
    } ${match.away_team}`,
    meta: `${formatBriefDate(match.kickoff_at)}${
      match.group_name ? ` · ${match.group_name}` : ""
    }`,
  };
}

function formatBriefDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MatchdayBriefing({ briefing }: { briefing: MatchdayBriefingData }) {
  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Matchday briefing
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fastest route back into the competition loop.
            </p>
          </div>
          <Trophy className="h-5 w-5 shrink-0 text-primary" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <BriefingTile
            icon={<CalendarClock className="h-4 w-4" />}
            label="Next up"
            value={briefing.nextOpen?.label ?? "No open matches"}
            meta={briefing.nextOpen?.meta ?? "Check Results for settled fixtures"}
            href={briefing.nextOpen ? `/arena/${briefing.nextOpen.id}` : undefined}
          />
          <BriefingTile
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Best 2x chance"
            value={briefing.bestBonus?.label ?? "No token match found"}
            meta={briefing.bestBonus?.meta ?? "Add team tokens to unlock bonuses"}
            href={
              briefing.bestBonus ? `/arena/${briefing.bestBonus.id}` : undefined
            }
          />
          <BriefingTile
            icon={<Flame className="h-4 w-4" />}
            label="Your form"
            value={`${briefing.bestStreak} streak`}
            meta={`${briefing.openCount} open ${
              briefing.openCount === 1 ? "match" : "matches"
            } available`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BriefingTile({
  icon,
  label,
  value,
  meta,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  meta: string;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-lg border border-border bg-card/70 p-3 transition hover:border-primary/35">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{meta}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
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
