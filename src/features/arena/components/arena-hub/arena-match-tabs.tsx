import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchSection } from "@/features/matches/components/match-section";
import type { Prediction } from "@/lib/types";
import type { ArenaMatchGroups } from "../../lib/arena-hub";
import type { ReactNode } from "react";

export function ArenaMatchTabs({
  heldTokens,
  matchGroups,
  predictionsByMatchId,
}: {
  heldTokens: string[];
  matchGroups: ArenaMatchGroups;
  predictionsByMatchId: Record<string, Prediction>;
}) {
  const counts = {
    open: matchGroups.open.length,
    predicted: matchGroups.predicted.length,
    settled: matchGroups.settled.length,
    results: matchGroups.results.length,
  };

  return (
    <Tabs defaultValue="open">
      <div className="w-full overflow-hidden rounded-xl bg-muted p-1">
        <div className="overflow-x-auto">
          <TabsList className="w-max min-w-full bg-transparent p-0">
            <ArenaTabTrigger value="open" count={counts.open}>
              Open
            </ArenaTabTrigger>
            <ArenaTabTrigger value="predicted" count={counts.predicted} wide>
              Predicted
            </ArenaTabTrigger>
            <ArenaTabTrigger value="settled" count={counts.settled}>
              Scored
            </ArenaTabTrigger>
            <ArenaTabTrigger value="results" count={counts.results}>
              Results
            </ArenaTabTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="open" className="mt-5 space-y-6">
        <MatchSection
          title="Open"
          matches={matchGroups.open}
          predictions={predictionsByMatchId}
          heldTokens={heldTokens}
        />
        {counts.open === 0 && (
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
          matches={matchGroups.predictedLive}
          predictions={predictionsByMatchId}
          heldTokens={heldTokens}
        />
        <MatchSection
          title="Upcoming"
          matches={matchGroups.predictedUpcoming}
          predictions={predictionsByMatchId}
          heldTokens={heldTokens}
        />
        {counts.predicted === 0 && (
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
          matches={matchGroups.settled}
          predictions={predictionsByMatchId}
          heldTokens={heldTokens}
        />
        {counts.settled === 0 && (
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
          matches={matchGroups.results}
          predictions={predictionsByMatchId}
          heldTokens={heldTokens}
        />
        {counts.results === 0 && (
          <EmptyState
            icon="📜"
            title="No tournament results yet"
            description="Settled matches will stay visible here, even if you did not predict them."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

function ArenaTabTrigger({
  children,
  count,
  value,
  wide = false,
}: {
  children: ReactNode;
  count: number;
  value: string;
  wide?: boolean;
}) {
  return (
    <TabsTrigger
      value={value}
      className={`${wide ? "min-w-32" : "min-w-28"} flex-none gap-1 text-sm sm:min-w-0 sm:flex-1 sm:gap-1.5 sm:text-base`}
    >
      {children}
      <CountBadge>{count}</CountBadge>
    </TabsTrigger>
  );
}

function CountBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums">
      {children}
    </span>
  );
}
