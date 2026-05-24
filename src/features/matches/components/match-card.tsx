"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TEAM_FLAG } from "@/lib/constants";
import type { Match, Prediction } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getKickoffDistance(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "soon";

  const days = Math.floor(diff / 86_400_000);
  if (days > 1) return `in ${days}d`;
  if (days === 1) return "tomorrow";

  const hours = Math.floor(diff / 3_600_000);
  if (hours > 0) return `in ${hours}h`;

  const minutes = Math.max(1, Math.floor(diff / 60_000));
  return `in ${minutes}m`;
}

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  heldTokens: string[];
}

function MatchCardInner({ match, prediction, heldTokens }: MatchCardProps) {
  const has2x =
    (match.home_token && heldTokens.includes(match.home_token)) ||
    (match.away_token && heldTokens.includes(match.away_token));

  const alreadyPredicted = !!prediction;
  const href = `/arena/${match.id}`;
  const actionLabel = alreadyPredicted
    ? "View prediction"
    : match.status === "settled"
      ? "View details"
      : "Enter arena";

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-xl border border-border bg-card p-3 transition",
        "hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md",
        alreadyPredicted && "border-primary/30 bg-primary/5",
        has2x && !alreadyPredicted && "border-tc-orange/25",
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex min-w-0 items-center gap-1 text-base font-semibold text-foreground">
              <span className="truncate">
                {TEAM_FLAG[match.home_team] ?? "🏳️"} {match.home_team}
              </span>
              <span className="shrink-0 text-sm font-normal text-muted-foreground">
                vs
              </span>
              <span className="truncate">
                {TEAM_FLAG[match.away_team] ?? "🏳️"} {match.away_team}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>{formatKickoff(match.kickoff_at)}</span>
              {match.group_name && <span>{match.group_name}</span>}
              {match.status === "upcoming" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Clock3 className="h-3 w-3" />
                  {getKickoffDistance(match.kickoff_at)}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadges
              status={match.status}
              has2x={Boolean(has2x)}
              alreadyPredicted={alreadyPredicted}
            />
          </div>
        </div>

        {prediction && (
          <PredictionSummary match={match} prediction={prediction} />
        )}

        {match.status === "settled" && match.home_score !== null && (
          <div className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            Final:{" "}
            <span className="font-semibold text-foreground">
              {match.home_score} - {match.away_score}
            </span>
          </div>
        )}

        <div
          className={cn(
            "flex h-10 items-center justify-between rounded-lg px-3 text-sm font-semibold transition",
            alreadyPredicted || match.status === "settled"
              ? "border border-border bg-background text-foreground group-hover:border-primary/50 group-hover:text-primary"
              : "bg-primary text-primary-foreground group-hover:bg-primary/90",
          )}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

/**
 * Memoized so the arena hub's 70+ cards skip re-rendering on every
 * keystroke in the search input. `prediction` and `heldTokens` come
 * from useMemo'd parents, and `match` references are stable across
 * filter changes — so referential equality holds for unchanged cards.
 */
export const MatchCard = memo(MatchCardInner);

function StatusBadges({
  status,
  has2x,
  alreadyPredicted,
}: {
  status: Match["status"];
  has2x: boolean;
  alreadyPredicted: boolean;
}) {
  return (
    <>
      {alreadyPredicted && (
        <Badge className="border-primary/25 bg-primary/15 text-xs text-primary">
          Predicted
        </Badge>
      )}
      {status === "live" && (
        <Badge className="border-tc-green/30 bg-tc-green/20 text-xs text-tc-green">
          Live
        </Badge>
      )}
      {status === "settled" && (
        <Badge variant="secondary" className="text-xs">
          Settled
        </Badge>
      )}
      {has2x && (
        <Badge className="border-tc-orange/30 bg-tc-orange/20 text-xs text-tc-orange">
          2x
        </Badge>
      )}
    </>
  );
}

function PredictionSummary({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction;
}) {
  const resultLabel =
    prediction.predicted_result === "home_win"
      ? `${match.home_team} Win`
      : prediction.predicted_result === "away_win"
        ? `${match.away_team} Win`
        : "Draw";

  return (
    <div className="space-y-0.5 rounded-lg bg-muted/70 px-3 py-2 text-sm">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Your prediction
      </div>
      <div className="text-foreground">
        Result: <span className="font-medium">{resultLabel}</span>
      </div>
      {prediction.predicted_goals_range && (
        <div className="text-foreground">
          Goals:{" "}
          <span className="font-medium">
            {prediction.predicted_goals_range}
          </span>
        </div>
      )}
      {prediction.points_earned !== null && !prediction.is_voided && (
        <div className="text-tc-green font-semibold">
          +{prediction.points_earned} pts
        </div>
      )}
      {prediction.is_voided && (
        <div className="text-destructive text-xs">
          Voided — stake dropped before settlement
        </div>
      )}
    </div>
  );
}
