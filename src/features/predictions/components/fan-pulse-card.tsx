"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  NoTokenCampTile,
  TokenCampTile,
} from "@/features/predictions/components/fan-pulse/fan-pulse-camps";
import { FanPulseHeader } from "@/features/predictions/components/fan-pulse/fan-pulse-header";
import { FanPulseSkeleton } from "@/features/predictions/components/fan-pulse/fan-pulse-skeleton";
import {
  CrowdPositionLine,
  SentimentStack,
} from "@/features/predictions/components/fan-pulse/fan-pulse-sentiment";
import { useFanPulse } from "@/features/predictions/data-access/queries/use-fan-pulse";
import {
  buildPulseSummary,
  buildPulseVerdict,
  findCamp,
  getTokenCamps,
  pickUserCamp,
} from "@/features/predictions/lib/fan-pulse-view";
import type { Match, Prediction } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FanPulseCard({
  match,
  prediction,
  heldTokenSymbols = [],
  variant = "full",
}: {
  match: Match;
  prediction?: Prediction | null;
  heldTokenSymbols?: string[];
  variant?: "full" | "compact";
}) {
  const { data, isLoading, isError } = useFanPulse(match);

  if (isLoading) {
    return <FanPulseSkeleton compact={variant === "compact"} />;
  }

  if (isError || !data) {
    return null;
  }

  const allCamp = findCamp(data.camps, "all");
  const tokenCamps = getTokenCamps(data.camps);
  const userCamp = pickUserCamp({
    camps: data.camps,
    match,
    heldTokenSymbols,
  });
  const userPick = prediction?.predicted_result ?? null;

  return (
    <Card className="overflow-hidden border border-primary/25 bg-card">
      <CardContent className="p-0">
        <FanPulseHeader
          verdict={allCamp ? buildPulseVerdict(match, allCamp) : "Fan Pulse"}
          summary={buildPulseSummary({
            match,
            userCamp,
            userPick,
            totalPicks: data.totalPicks,
          })}
          totalPicks={data.totalPicks}
        />

        <div
          className={cn("space-y-4 p-4", variant === "compact" && "space-y-3")}
        >
          {allCamp && (
            <>
              <SentimentStack
                match={match}
                camp={allCamp}
                userPick={userPick}
              />
              {userPick && (
                <CrowdPositionLine
                  match={match}
                  camp={allCamp}
                  userCamp={userCamp}
                  userPick={userPick}
                />
              )}
            </>
          )}

          {variant === "full" && tokenCamps.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {tokenCamps.map((camp) => (
                <TokenCampTile
                  key={camp.key}
                  match={match}
                  camp={camp}
                  isUserCamp={userCamp?.key === camp.key}
                />
              ))}
            </div>
          )}

          {variant === "full" && tokenCamps.length === 0 && <NoTokenCampTile />}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Locked predictions only. Reward Points settle after full time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
