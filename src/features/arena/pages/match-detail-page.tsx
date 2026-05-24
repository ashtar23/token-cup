"use client";

import { useParams } from "next/navigation";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionRow } from "@/features/arena/components/match-detail/action-row";
import { MatchHero } from "@/features/arena/components/match-detail/match-hero";
import { MatchInfo } from "@/features/arena/components/match-detail/match-info";
import { PredictionRecap } from "@/features/arena/components/match-detail/prediction-recap";
import { SquadsSection } from "@/features/arena/components/match-detail/squads-section";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMatch } from "@/features/matches/data-access/queries/use-match";
import { usePrediction } from "@/features/predictions/data-access/queries/use-prediction";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import {
  getHeldTokenSymbols,
  getTotalStaked,
} from "@/features/user/lib/tokens";

export function MatchDetailPage() {
  useAuthGuard();
  const { matchId } = useParams<{ matchId: string }>();

  const { data: match, isLoading } = useMatch(matchId);
  const { data: prediction } = usePrediction(matchId);
  const { data: userTokens = [] } = useUserTokens();

  if (isLoading || !match) {
    return <MatchDetailSkeleton />;
  }

  const heldTokens = getHeldTokenSymbols(userTokens);
  const totalStaked = getTotalStaked(userTokens);
  const has2x =
    (match.home_token !== null && heldTokens.includes(match.home_token)) ||
    (match.away_token !== null && heldTokens.includes(match.away_token));

  return (
    <>
      <InsetHeader backHref="/arena" title="Match details" />
      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-5">
        <MatchHero
          match={match}
          has2x={has2x}
          totalStaked={totalStaked}
          stakeSnapshot={prediction?.stake_snapshot ?? null}
        />
        <MatchInfo match={match} />
        {prediction && (
          <PredictionRecap match={match} prediction={prediction} />
        )}
        <SquadsSection match={match} />
        <ActionRow
          match={match}
          prediction={prediction ?? null}
          has2x={has2x}
        />
      </div>
    </>
  );
}

function MatchDetailSkeleton() {
  return (
    <>
      <InsetHeader backHref="/arena" title="Match" />
      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </>
  );
}
