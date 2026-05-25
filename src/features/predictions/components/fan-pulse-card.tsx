"use client";

import { Activity, Shield, ShieldOff, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFanPulse } from "@/features/predictions/data-access/queries/use-fan-pulse";
import { cn } from "@/lib/utils";
import type {
  FanPulseCamp,
  FanPulseSegment,
} from "@/features/predictions/api/fan-pulse-api";
import type { Match, Prediction, PredictedResult } from "@/lib/types";

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

  const allCamp = data.camps.find((camp) => camp.key === "all");
  const tokenCamps = data.camps.filter(
    (camp) => camp.key === "home" || camp.key === "away",
  );
  const userCamp = pickUserCamp(data.camps, match, heldTokenSymbols);
  const userPick = prediction?.predicted_result ?? null;

  return (
    <Card className="overflow-hidden border border-primary/25 bg-card">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Fan Pulse
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {buildPulseSummary(match, userCamp, userPick, data.totalPicks)}
              </p>
            </div>
          </div>
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            {data.totalPicks} {data.totalPicks === 1 ? "pick" : "picks"}
          </Badge>
        </div>

        <div
          className={cn("space-y-4 p-4", variant === "compact" && "space-y-3")}
        >
          {allCamp && (
            <PulseBars match={match} camp={allCamp} userPick={userPick} />
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

          {variant === "compact" && userCamp && (
            <CompactCampLine
              match={match}
              camp={userCamp}
              userPick={userPick}
            />
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Locked predictions only. Reward Points settle after full time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FanPulseSkeleton({ compact }: { compact: boolean }) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className={compact ? "space-y-3 p-4" : "space-y-4 p-4"}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function PulseBars({
  match,
  camp,
  userPick,
}: {
  match: Match;
  camp: FanPulseCamp;
  userPick: PredictedResult | null;
}) {
  return (
    <div className="space-y-2">
      {camp.segments.map((segment) => (
        <PulseBar
          key={segment.result}
          match={match}
          segment={segment}
          active={segment.result === userPick}
        />
      ))}
    </div>
  );
}

function PulseBar({
  match,
  segment,
  active,
}: {
  match: Match;
  segment: FanPulseSegment;
  active: boolean;
}) {
  const width = segment.count === 0 ? 0 : Math.max(segment.percentage, 6);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span
          className={cn(
            "truncate font-medium",
            active ? "text-primary" : "text-foreground",
          )}
        >
          {formatResult(segment.result, match)}
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {segment.percentage}% · {segment.count}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            active ? "bg-primary" : "bg-primary/45",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function TokenCampTile({
  match,
  camp,
  isUserCamp,
}: {
  match: Match;
  camp: FanPulseCamp;
  isUserCamp: boolean;
}) {
  const leadingLabel = camp.leadingResult
    ? formatResult(camp.leadingResult, match)
    : "Signal forming";

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        isUserCamp
          ? "border-primary/35 bg-primary/10"
          : "border-border bg-background/35",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">{camp.label}</p>
        </div>
        {isUserCamp && (
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            yours
          </Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {camp.totalPicks > 0
          ? `${camp.leadingPercentage}% backing ${leadingLabel}`
          : "Waiting for token-holder picks"}
      </p>
    </div>
  );
}

function NoTokenCampTile() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/35 px-3 py-3">
      <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-sm font-semibold text-foreground">
          No team-token camp
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This fixture has no Socios Fan Token mapped yet, so Fan Pulse shows
          the overall locked-pick signal.
        </p>
      </div>
    </div>
  );
}

function CompactCampLine({
  match,
  camp,
  userPick,
}: {
  match: Match;
  camp: FanPulseCamp;
  userPick: PredictedResult | null;
}) {
  if (!userPick) return null;

  const campIsWithUser =
    camp.leadingResult !== null && camp.leadingResult === userPick;

  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-background/35 px-3 py-2 text-sm">
      <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-muted-foreground">
        {campIsWithUser
          ? "Your camp is with you on "
          : "Your camp is leaning away from "}
        <span className="font-medium text-foreground">
          {formatResult(userPick, match)}
        </span>
        .
      </p>
    </div>
  );
}

function buildPulseSummary(
  match: Match,
  userCamp: FanPulseCamp | null,
  userPick: PredictedResult | null,
  totalPicks: number,
): string {
  if (totalPicks === 0) {
    return "No locked picks yet. The first fans will shape the match signal.";
  }

  if (!userPick) {
    return "See how token holders are lining up before kickoff.";
  }

  if (!userCamp || userCamp.key === "all") {
    return `Your pick is locked on ${formatResult(userPick, match)}.`;
  }

  if (userCamp.leadingResult === userPick) {
    return `You're with the ${userCamp.label} on ${formatResult(userPick, match)}.`;
  }

  return `You're going against the ${userCamp.label} with ${formatResult(
    userPick,
    match,
  )}.`;
}

function pickUserCamp(
  camps: FanPulseCamp[],
  match: Match,
  heldTokenSymbols: string[],
): FanPulseCamp | null {
  const homeCamp = camps.find((camp) => camp.key === "home");
  const awayCamp = camps.find((camp) => camp.key === "away");

  if (
    homeCamp &&
    match.home_token !== null &&
    heldTokenSymbols.includes(match.home_token)
  ) {
    return homeCamp;
  }
  if (
    awayCamp &&
    match.away_token !== null &&
    heldTokenSymbols.includes(match.away_token)
  ) {
    return awayCamp;
  }

  return null;
}

function formatResult(result: PredictedResult, match: Match): string {
  const labels = {
    home_win: `${match.home_team} win`,
    draw: "Draw",
    away_win: `${match.away_team} win`,
  } satisfies Record<PredictedResult, string>;

  return labels[result];
}
