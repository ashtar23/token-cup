"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMatch } from "@/features/matches/data-access/queries/use-match";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import { usePrediction } from "@/features/predictions/data-access/queries/use-prediction";
import { useSubmitPrediction } from "@/features/predictions/data-access/mutations/use-submit-prediction";
import { ToggleButton } from "@/features/predictions/components/toggle-button";
import { FirstScorerPicker } from "@/features/predictions/components/first-scorer-picker";
import {
  getHeldTokenSymbols,
  getTotalStaked,
} from "@/features/user/lib/tokens";
import { TEAM_FLAG, GOALS_RANGES } from "@/lib/constants";
import type { PredictedResult, GoalsRange } from "@/lib/types";

export function PredictPage() {
  useAuthGuard();
  const router = useRouter();
  const { matchId } = useParams<{ matchId: string }>();

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const {
    data: userTokens = [],
    isLoading: tokensLoading,
    refetch: refetchTokens,
  } = useUserTokens();
  const { data: existingPrediction, isLoading: predLoading } =
    usePrediction(matchId);
  const submit = useSubmitPrediction();

  const [selectedResult, setSelectedResult] = useState<PredictedResult | null>(
    null,
  );
  const [selectedScorer, setSelectedScorer] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<GoalsRange | null>(null);

  // Sync form to the loaded prediction without an effect.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevPredictionId, setPrevPredictionId] = useState<string | null>(null);
  const currentPredictionId = existingPrediction?.id ?? null;
  if (currentPredictionId !== prevPredictionId) {
    setPrevPredictionId(currentPredictionId);
    setSelectedResult(existingPrediction?.predicted_result ?? null);
    setSelectedScorer(existingPrediction?.predicted_first_scorer ?? null);
    setSelectedGoals(existingPrediction?.predicted_goals_range ?? null);
  }

  const isLoading = matchLoading || tokensLoading || predLoading;
  if (isLoading || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  const heldTokens = getHeldTokenSymbols(userTokens);
  const totalStaked = getTotalStaked(userTokens);
  const has2x =
    (match.home_token && heldTokens.includes(match.home_token)) ||
    (match.away_token && heldTokens.includes(match.away_token));

  const isLocked = match.status !== "upcoming";
  const stakeSnapshot = existingPrediction?.stake_snapshot ?? null;
  const isStakeBelowSnapshot =
    stakeSnapshot !== null && totalStaked < stakeSnapshot;
  const stakeShortfall =
    stakeSnapshot === null ? 0 : Math.max(0, stakeSnapshot - totalStaked);

  const resultOptions: { value: PredictedResult; label: string }[] = [
    { value: "home_win", label: `${match.home_team} Win` },
    { value: "draw", label: "Draw" },
    { value: "away_win", label: `${match.away_team} Win` },
  ];

  const maxPossible = has2x ? 400 : 200;
  const selectedResultLabel =
    resultOptions.find((option) => option.value === selectedResult)?.label ??
    null;
  const selectedGoalsLabel =
    GOALS_RANGES.find((range) => range.value === selectedGoals)?.label ?? null;

  async function handleSubmit() {
    if (!selectedResult || !matchId) return;
    try {
      await submit.mutateAsync({
        matchId,
        predictedResult: selectedResult,
        predictedGoalsRange: selectedGoals,
        predictedFirstScorer: selectedScorer,
      });
      router.push(`/arena/${matchId}/confirm`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <InsetHeader
        backHref={`/arena/${matchId}/verify`}
        title="Matchday predictions"
      />

      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">
            {TEAM_FLAG[match.home_team] ?? "🏳️"} {match.home_team} vs{" "}
            {TEAM_FLAG[match.away_team] ?? "🏳️"} {match.away_team}
          </p>
          {has2x && (
            <Badge className="bg-tc-orange/20 text-tc-orange border-tc-orange/30 text-sm shrink-0">
              2× Bonus
            </Badge>
          )}
        </div>

        {isLocked ? (
          <Card className="border border-border bg-card">
            <CardContent className="p-6 text-center space-y-2">
              <span className="text-3xl" aria-hidden="true">
                🔒
              </span>
              <p className="font-medium text-foreground">Predictions locked</p>
              <p className="text-sm text-muted-foreground">
                This match has already started.
              </p>
            </CardContent>
          </Card>
        ) : isStakeBelowSnapshot ? (
          <Card className="border border-destructive/30 bg-destructive/5">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    Stake below locked snapshot
                  </p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    This prediction is locked from edits because your current
                    stake is {totalStaked.toLocaleString()} tokens. Restore{" "}
                    {stakeShortfall.toLocaleString()}{" "}
                    {stakeShortfall === 1 ? "token" : "tokens"} before full
                    time to keep it eligible for settlement.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => refetchTokens()}
              >
                <RefreshCcw className="h-4 w-4" />
                I&apos;ve staked more - refresh balance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <PredictionCard title="Match result">
              <div className="grid grid-cols-3 gap-2">
                {resultOptions.map((opt) => (
                  <ToggleButton
                    key={opt.value}
                    selected={selectedResult === opt.value}
                    onClick={() => setSelectedResult(opt.value)}
                  >
                    {opt.label}
                  </ToggleButton>
                ))}
              </div>
            </PredictionCard>

            {/* Only show the goalscorer card when we have squad data to
                back it up. Stale seed matches with no team_api_ids would
                otherwise display irrelevant fallback names (e.g. Messi
                for Canada vs France), which looks broken. */}
            {(match.home_team_api_id || match.away_team_api_id) && (
              <PredictionCard title="First goalscorer" optional>
                <FirstScorerPicker
                  homeTeamApiId={match.home_team_api_id}
                  awayTeamApiId={match.away_team_api_id}
                  homeTeamName={match.home_team}
                  awayTeamName={match.away_team}
                  value={selectedScorer}
                  onChange={setSelectedScorer}
                />
              </PredictionCard>
            )}

            <PredictionCard title="Total goals" optional>
              <div className="grid grid-cols-3 gap-2">
                {GOALS_RANGES.map((range) => (
                  <ToggleButton
                    key={range.value}
                    selected={selectedGoals === range.value}
                    onClick={() => setSelectedGoals(range.value as GoalsRange)}
                  >
                    {range.label}
                  </ToggleButton>
                ))}
              </div>
            </PredictionCard>

            <PredictionSlip
              selectedResult={selectedResultLabel}
              selectedGoals={selectedGoalsLabel}
              selectedScorer={selectedScorer}
              has2x={Boolean(has2x)}
              maxPossible={maxPossible}
            />

            <div className="flex items-start gap-3 rounded-xl border border-tc-amber/30 bg-tc-amber/5 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tc-amber" />
              <p className="text-sm text-tc-amber">
                Keep tokens staked until full time. Unstaking before settlement
                voids your predictions.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedResult || submit.isPending}
              className="w-full bg-tc-orange hover:bg-tc-orange/90 text-white font-semibold h-12"
            >
              {submit.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Locking…
                </>
              ) : (
                selectedResult
                  ? "Submit predictions"
                  : "Choose a match result to submit"
              )}
            </Button>
          </>
        )}
      </div>
    </>
  );
}

function PredictionCard({
  title,
  optional = false,
  children,
}: {
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
          {optional && (
            <span className="text-xs font-medium text-muted-foreground">
              Optional
            </span>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function PredictionSlip({
  selectedResult,
  selectedGoals,
  selectedScorer,
  has2x,
  maxPossible,
}: {
  selectedResult: string | null;
  selectedGoals: string | null;
  selectedScorer: string | null;
  has2x: boolean;
  maxPossible: number;
}) {
  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Prediction slip
            </p>
            <p className="text-xs text-muted-foreground">
              Result is required. Goals and scorer can boost the upside.
            </p>
          </div>
          {selectedResult ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-tc-green" />
          ) : (
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              Missing result
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Result" value={selectedResult ?? "Choose one"} />
          <Row label="Goals range" value={selectedGoals ?? "Optional"} />
          <Row label="First scorer" value={selectedScorer ?? "Optional"} />
          {has2x && (
            <Row label="Team token bonus" value="2x active" accent="orange" />
          )}
        </div>

        <div className="flex justify-between border-t border-primary/15 pt-2 text-sm text-muted-foreground">
          <span>Max possible this match</span>
          <span>{maxPossible} pts</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "orange";
}) {
  return (
    <div
      className={
        accent === "orange"
          ? "flex justify-between text-tc-orange"
          : "flex justify-between text-foreground"
      }
    >
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
