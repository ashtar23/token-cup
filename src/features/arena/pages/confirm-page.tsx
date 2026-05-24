"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMatch } from "@/features/matches/data-access/queries/use-match";
import { usePrediction } from "@/features/predictions/data-access/queries/use-prediction";
import { STREAK_THRESHOLD, MATCH_WIN_POINTS, TEAM_FLAG } from "@/lib/constants";
import type { Prediction, Match } from "@/lib/types";

export function ConfirmPage() {
  useAuthGuard();
  const { matchId } = useParams<{ matchId: string }>();

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const { data: prediction, isLoading: predLoading } = usePrediction(matchId);

  if (matchLoading || predLoading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-muted-foreground text-sm">
          No prediction found for this match.
        </p>
        <Button asChild variant="outline">
          <Link href={`/arena/${matchId}/predict`}>Go back to predictions</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <InsetHeader title="Predictions locked" backHref="/arena">
        <Button asChild variant="outline" size="sm">
          <Link href="/arena">Back to Hub</Link>
        </Button>
      </InsetHeader>

      <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
        <Hero match={match} />
        <StatsGrid prediction={prediction} />
        <SummaryCard match={match} prediction={prediction} />
        <StakeWarning />
        <PrizeRow />
        <Actions />
      </div>
    </>
  );
}

function Hero({ match }: { match: Match }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-tc-green/10 border-2 border-tc-green">
        <span className="text-3xl" aria-hidden="true">✓</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Predictions locked!</h1>
      <p className="text-sm text-muted-foreground">
        {TEAM_FLAG[match.home_team] ?? "🏳️"} {match.home_team} vs{" "}
        {TEAM_FLAG[match.away_team] ?? "🏳️"} {match.away_team} · Good luck!
      </p>
    </div>
  );
}

function StatsGrid({ prediction }: { prediction: Prediction }) {
  const predictionsCount = [
    prediction.predicted_result,
    prediction.predicted_goals_range,
    prediction.predicted_first_scorer,
  ].filter(Boolean).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Predictions" value={predictionsCount} />
      <StatCard label="Multiplier" value={prediction.has_2x_bonus ? "2×" : "1×"} />
      <StatCard label="Streak" value={prediction.streak_count} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-3 text-center space-y-1">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
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

  const onStreak = prediction.streak_count >= STREAK_THRESHOLD;
  const multiplierParts: string[] = [];
  if (prediction.has_2x_bonus) multiplierParts.push("2× token");
  if (onStreak) multiplierParts.push("1.5× streak");
  const multiplierLabel =
    multiplierParts.length > 0 ? multiplierParts.join(" · ") : "1×";

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-2 text-sm">
        <SummaryRow label="Result prediction" value={resultLabel} bordered />
        {prediction.predicted_goals_range && (
          <SummaryRow
            label="Goals range"
            value={prediction.predicted_goals_range}
            bordered
          />
        )}
        {prediction.predicted_first_scorer && (
          <SummaryRow
            label="First scorer"
            value={prediction.predicted_first_scorer}
            bordered
          />
        )}
        <SummaryRow label="Multipliers" value={multiplierLabel} />
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={
        bordered
          ? "flex justify-between py-1.5 border-b border-border"
          : "flex justify-between py-1.5"
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function StakeWarning() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-tc-amber/30 bg-tc-amber/5 px-4 py-3">
      <span className="text-lg shrink-0" aria-hidden="true">⚠️</span>
      <p className="text-sm text-tc-amber">
        Keep tokens staked until full time. Unstaking before settlement voids
        your predictions.
      </p>
    </div>
  );
}

function PrizeRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-2xl shrink-0" aria-hidden="true">🏆</span>
      <div>
        <p className="text-sm font-semibold text-foreground">
          Match winner prize
        </p>
        <p className="text-xs text-muted-foreground">
          Top earns {MATCH_WIN_POINTS.toLocaleString()} reward points
        </p>
      </div>
    </div>
  );
}

function Actions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        asChild
        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
      >
        <Link href="/leaderboard">View leaderboard</Link>
      </Button>
      <Button asChild variant="outline" className="flex-1 h-12">
        <Link href="/arena">Back to hub</Link>
      </Button>
    </div>
  );
}
