"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Calendar, Trophy } from "lucide-react";
import { InsetHeader } from "@/components/layout/InsetHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMatch } from "@/features/matches/data-access/queries/use-match";
import { usePrediction } from "@/features/predictions/data-access/queries/use-prediction";
import { useUserTokens } from "@/features/user/data-access/queries/use-user-tokens";
import { useSquads } from "@/features/teams/data-access/queries/use-squad";
import { getHeldTokenSymbols } from "@/features/user/lib/tokens";
import { TEAM_FLAG } from "@/lib/constants";
import type { Match, Prediction } from "@/lib/types";
import type { SquadPlayer } from "@/features/teams/api/teams-api";

export function MatchDetailPage() {
  useAuthGuard();
  const { matchId } = useParams<{ matchId: string }>();

  const { data: match, isLoading } = useMatch(matchId);
  const { data: prediction } = usePrediction(matchId);
  const { data: userTokens = [] } = useUserTokens();

  if (isLoading || !match) {
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

  const heldTokens = getHeldTokenSymbols(userTokens);
  const has2x =
    (match.home_token && heldTokens.includes(match.home_token)) ||
    (match.away_token && heldTokens.includes(match.away_token));

  return (
    <>
      <InsetHeader backHref="/arena" title="Match details" />
      <div className="mx-auto max-w-3xl w-full px-4 py-6 space-y-5">
        <MatchHero match={match} has2x={!!has2x} />
        <MatchInfo match={match} />
        {prediction && <PredictionRecap match={match} prediction={prediction} />}
        <SquadsSection match={match} />
        <ActionRow match={match} prediction={prediction ?? null} />
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function MatchHero({ match, has2x }: { match: Match; has2x: boolean }) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-5 space-y-3">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="text-2xl font-bold text-foreground">
            <span className="text-3xl mr-1">
              {TEAM_FLAG[match.home_team] ?? "🏳️"}
            </span>
            {match.home_team}
            <span className="mx-3 text-muted-foreground font-normal">vs</span>
            {match.away_team}
            <span className="text-3xl ml-1">
              {TEAM_FLAG[match.away_team] ?? "🏳️"}
            </span>
          </div>

          {match.status === "settled" && match.home_score !== null && (
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {match.home_score} – {match.away_score}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <StatusBadge status={match.status} />
            {has2x && (
              <Badge className="bg-tc-orange/20 text-tc-orange border-tc-orange/30 text-xs">
                2× Bonus available
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "live")
    return (
      <Badge className="bg-tc-green/20 text-tc-green border-tc-green/30 text-sm px-3 py-1">
        Live
      </Badge>
    );
  if (status === "upcoming")
    return (
      <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30 text-sm px-3 py-1">
        Open for predictions
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-sm px-3 py-1">
      Settled
    </Badge>
  );
}

function MatchInfo({ match }: { match: Match }) {
  const kickoff = new Date(match.kickoff_at);
  const kickoffStr = kickoff.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      <InfoCard icon={<Calendar className="h-4 w-4" />} label="Kickoff">
        {kickoffStr}
      </InfoCard>
      <InfoCard icon={<Trophy className="h-4 w-4" />} label="Stage">
        {match.group_name ?? formatStage(match.stage)}
      </InfoCard>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="text-lg font-semibold text-foreground">{children}</p>
      </CardContent>
    </Card>
  );
}

function formatStage(stage: Match["stage"]): string {
  if (!stage) return "—";
  return stage
    .split("_")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

function PredictionRecap({
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
    <Card className="border border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-2 text-base">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
          Your prediction
        </p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Result</span>
          <span className="font-medium text-foreground">{resultLabel}</span>
        </div>
        {prediction.predicted_goals_range && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Goals range</span>
            <span className="font-medium text-foreground">
              {prediction.predicted_goals_range}
            </span>
          </div>
        )}
        {prediction.predicted_first_scorer && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">First scorer</span>
            <span className="font-medium text-foreground">
              {prediction.predicted_first_scorer}
            </span>
          </div>
        )}
        {prediction.points_earned !== null && (
          <div className="flex justify-between pt-2 border-t border-primary/20">
            <span className="text-muted-foreground">Points earned</span>
            <span
              className={`font-semibold ${
                prediction.is_voided
                  ? "text-destructive"
                  : (prediction.points_earned ?? 0) > 0
                    ? "text-tc-green"
                    : "text-muted-foreground"
              }`}
            >
              {prediction.is_voided
                ? "Voided"
                : `+${prediction.points_earned} pts`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SquadsSection({ match }: { match: Match }) {
  const [home, away] = useSquads([
    match.home_team_api_id,
    match.away_team_api_id,
  ]);

  if (!match.home_team_api_id && !match.away_team_api_id) {
    return null;
  }

  if (home.isLoading || away.isLoading) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-4 space-y-3">
          <p className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
            Key players
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const homeAttackers = pickAttackers(home.data?.players);
  const awayAttackers = pickAttackers(away.data?.players);

  if (homeAttackers.length === 0 && awayAttackers.length === 0) return null;

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Key players
        </p>
        <div className="grid grid-cols-2 gap-4">
          <SquadColumn teamName={match.home_team} players={homeAttackers} />
          <SquadColumn teamName={match.away_team} players={awayAttackers} />
        </div>
      </CardContent>
    </Card>
  );
}

function pickAttackers(players?: SquadPlayer[]): SquadPlayer[] {
  return (players ?? [])
    .filter((p) => p.position === "Offence" || p.position === "Midfield")
    .slice(0, 6);
}

function SquadColumn({
  teamName,
  players,
}: {
  teamName: string;
  players: SquadPlayer[];
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="text-xl leading-none">
          {TEAM_FLAG[teamName] ?? "🏳️"}
        </span>
        {teamName}
      </p>
      {players.length === 0 ? (
        <p className="text-base text-muted-foreground italic">Squad TBD</p>
      ) : (
        <ul className="text-base text-muted-foreground space-y-1.5">
          {players.map((p) => (
            <li key={p.id} className="truncate">
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActionRow({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction | null;
}) {
  if (match.status === "settled") {
    return (
      <Button asChild variant="outline" className="w-full h-12">
        <Link href="/leaderboard/match">View leaderboard for this match</Link>
      </Button>
    );
  }

  if (match.status === "live") {
    return (
      <Card className="border border-tc-green/30 bg-tc-green/5">
        <CardContent className="p-4 text-sm text-center text-foreground">
          🟢 Match is live — predictions are locked until full time.
        </CardContent>
      </Card>
    );
  }

  if (prediction) {
    return (
      <Button asChild variant="outline" className="w-full h-12">
        <Link href={`/arena/${match.id}/predict`}>
          Edit your prediction <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
    >
      <Link href={`/arena/${match.id}/verify`}>
        Predict this match <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}
