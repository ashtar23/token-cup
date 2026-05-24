import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BASE_POINTS } from "@/lib/constants";
import type { Match, Prediction } from "@/lib/types";
import { formatResult, getPredictionOutcome } from "./match-detail-utils";

export function PredictionRecap({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction;
}) {
  if (prediction.points_earned !== null) {
    return <SettlementReveal match={match} prediction={prediction} />;
  }

  return (
    <Card className="border border-primary/30 bg-primary/5">
      <CardContent className="space-y-2 p-4 text-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Your prediction
        </p>
        <PredictionRow
          label="Result"
          value={formatResult(prediction.predicted_result, match)}
        />
        {prediction.predicted_goals_range && (
          <PredictionRow
            label="Goals range"
            value={prediction.predicted_goals_range}
          />
        )}
        {prediction.predicted_first_scorer && (
          <PredictionRow
            label="First scorer"
            value={prediction.predicted_first_scorer}
          />
        )}
      </CardContent>
    </Card>
  );
}

function PredictionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

function SettlementReveal({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction;
}) {
  const { actualResult, actualGoals, resultHit, goalsHit } =
    getPredictionOutcome(match, prediction);

  return (
    <Card className="overflow-hidden border border-tc-green/25 bg-tc-green/5">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-tc-green/20 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-tc-green">
              Result reveal
            </p>
            <p className="text-sm text-muted-foreground">
              Your picks vs full time
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tabular-nums text-foreground">
              {prediction.is_voided ? "0" : `+${prediction.points_earned ?? 0}`}
            </p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>

        <div className="space-y-2 p-4 text-sm">
          <RevealRow
            label="Result"
            pick={formatResult(prediction.predicted_result, match)}
            actual={
              actualResult ? formatResult(actualResult, match) : "Pending"
            }
            hit={resultHit}
          />
          {prediction.predicted_goals_range && (
            <RevealRow
              label="Goals"
              pick={prediction.predicted_goals_range}
              actual={actualGoals ?? "Pending"}
              hit={goalsHit}
            />
          )}
          <div className="flex items-center justify-between gap-3 border-t border-tc-green/20 pt-2">
            <span className="text-muted-foreground">Multipliers</span>
            <span className="text-right font-medium text-foreground">
              {prediction.has_2x_bonus ? "2x token bonus" : "1x base"}
              {prediction.streak_count > 0 &&
                ` · ${prediction.streak_count} streak`}
            </span>
          </div>
          {prediction.is_voided && (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              Prediction voided because stake dropped below the locked snapshot.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RevealRow({
  label,
  pick,
  actual,
  hit,
}: {
  label: string;
  pick: string;
  actual: string;
  hit: boolean;
}) {
  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-center gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{pick}</span>
      <Badge
        className={
          hit
            ? "border-tc-green/30 bg-tc-green/15 text-tc-green"
            : "border-border bg-muted text-muted-foreground"
        }
      >
        {hit ? `+${BASE_POINTS}` : actual}
      </Badge>
    </div>
  );
}
