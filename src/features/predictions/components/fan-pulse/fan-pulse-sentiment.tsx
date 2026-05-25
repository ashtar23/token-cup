"use client";

import { cva } from "class-variance-authority";
import { Users } from "lucide-react";
import type {
  FanPulseCamp,
  FanPulseSegment,
} from "@/features/predictions/api/fan-pulse-api";
import { formatResult } from "@/features/predictions/lib/fan-pulse-view";
import type { Match, PredictedResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const sentimentColorVariants = cva("", {
  variants: {
    result: {
      home_win: "bg-primary",
      draw: "bg-tc-orange",
      away_win: "bg-tc-green",
    },
  },
});

export function SentimentStack({
  match,
  camp,
  userPick,
}: {
  match: Match;
  camp: FanPulseCamp;
  userPick: PredictedResult | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {camp.segments.map((segment) => (
          <SentimentSegment key={segment.result} segment={segment} />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {camp.segments.map((segment) => (
          <SentimentLabel
            key={segment.result}
            match={match}
            segment={segment}
            active={segment.result === userPick}
          />
        ))}
      </div>
    </div>
  );
}

function SentimentSegment({ segment }: { segment: FanPulseSegment }) {
  if (segment.count === 0) return null;

  return (
    <div
      className={cn(
        "h-full",
        sentimentColorVariants({ result: segment.result }),
      )}
      style={{ width: `${segment.percentage}%` }}
    />
  );
}

function SentimentLabel({
  match,
  segment,
  active,
}: {
  match: Match;
  segment: FanPulseSegment;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        active ? "border-primary/35 bg-primary/10" : "border-border bg-card/60",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            sentimentColorVariants({ result: segment.result }),
          )}
        />
        <span className="truncate text-xs font-medium text-foreground">
          {formatResult(segment.result, match)}
        </span>
      </div>
      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
        {segment.percentage}% · {segment.count}{" "}
        {segment.count === 1 ? "pick" : "picks"}
      </p>
    </div>
  );
}

export function CrowdPositionLine({
  match,
  camp,
  userCamp,
  userPick,
}: {
  match: Match;
  camp: FanPulseCamp;
  userCamp: FanPulseCamp | null;
  userPick: PredictedResult;
}) {
  const crowdAgrees = camp.leadingResult === userPick;
  const campAgrees = userCamp?.leadingResult === userPick;
  const hasCampSignal = userCamp !== null && userCamp.totalPicks > 0;

  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-background/35 px-3 py-2 text-sm">
      <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-muted-foreground">
        {crowdAgrees
          ? "You are with the crowd on "
          : "You are going against the crowd with "}
        <span className="font-medium text-foreground">
          {formatResult(userPick, match)}
        </span>
        {hasCampSignal && (
          <>
            {" "}
            ·{" "}
            {campAgrees
              ? "your token camp agrees"
              : "your token camp leans elsewhere"}
          </>
        )}
        .
      </p>
    </div>
  );
}
