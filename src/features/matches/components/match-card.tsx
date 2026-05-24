"use client";

import { memo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEAM_FLAG } from "@/lib/constants";
import type { Match, Prediction } from "@/lib/types";

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const canEnter = !alreadyPredicted && match.status === "upcoming";

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-3">
        {/* Teams + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="text-base font-semibold text-foreground">
              {TEAM_FLAG[match.home_team] ?? "🏳️"} {match.home_team}{" "}
              <span className="text-muted-foreground font-normal">vs</span>{" "}
              {TEAM_FLAG[match.away_team] ?? "🏳️"} {match.away_team}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatKickoff(match.kickoff_at)}
              {match.group_name && ` · ${match.group_name}`}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {match.status === "live" && (
              <Badge className="bg-tc-green/20 text-tc-green border-tc-green/30 text-sm">
                Live
              </Badge>
            )}
            {match.status === "upcoming" && (
              <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30 text-sm">
                Open
              </Badge>
            )}
            {match.status === "settled" && (
              <Badge variant="secondary" className="text-sm">
                Settled
              </Badge>
            )}
            {has2x && (
              <Badge className="bg-tc-orange/20 text-tc-orange border-tc-orange/30 text-sm">
                2× Bonus
              </Badge>
            )}
          </div>
        </div>

        {/* Final score (settled) */}
        {match.status === "settled" && match.home_score !== null && (
          <div className="text-sm text-muted-foreground">
            Final: {match.home_team} {match.home_score} – {match.away_score}{" "}
            {match.away_team}
          </div>
        )}

        {/* Existing prediction summary */}
        {prediction && (
          <PredictionSummary match={match} prediction={prediction} />
        )}

        {canEnter && (
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link href={`/arena/${match.id}`}>Enter Arena</Link>
          </Button>
        )}
        {!canEnter && match.status === "upcoming" && alreadyPredicted && (
          <Button asChild variant="outline" className="w-full">
            <Link href={`/arena/${match.id}`}>View prediction</Link>
          </Button>
        )}
        {match.status === "settled" && (
          <Button asChild variant="outline" className="w-full">
            <Link href={`/arena/${match.id}`}>View details</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Memoized so the arena hub's 70+ cards skip re-rendering on every
 * keystroke in the search input. `prediction` and `heldTokens` come
 * from useMemo'd parents, and `match` references are stable across
 * filter changes — so referential equality holds for unchanged cards.
 */
export const MatchCard = memo(MatchCardInner);

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
    <div className="rounded-lg bg-muted px-3 py-2 text-sm space-y-0.5">
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
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
