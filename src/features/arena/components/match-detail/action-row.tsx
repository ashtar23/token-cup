import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Lock,
  Sparkles,
} from "lucide-react";
import { match as patternMatch } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Match, Prediction } from "@/lib/types";
import type { ReactNode } from "react";

export function ActionRow({
  match,
  prediction,
  has2x,
}: {
  match: Match;
  prediction: Prediction | null;
  has2x: boolean;
}) {
  const state = {
    status: match.status,
    hasPrediction: prediction !== null,
    isVoided: prediction?.is_voided ?? false,
    isScored: prediction?.points_earned !== null && prediction !== null,
    has2x,
  };

  return patternMatch(state)
    .with({ status: "settled", isVoided: true }, () => (
      <ActionCard
        icon={<CircleAlert className="h-4 w-4 text-destructive" />}
        title="Prediction voided"
        body="Your stake dropped below the locked snapshot, so this entry did not score."
        actionHref={`/leaderboard/match?match=${match.id}`}
        actionLabel="View match leaderboard"
      />
    ))
    .with({ status: "settled", isScored: true }, () => (
      <ActionCard
        icon={<CheckCircle2 className="h-4 w-4 text-tc-green" />}
        title="Match settled"
        body="Points are final for this fixture. Check how this result moved the table."
        actionHref={`/leaderboard/match?match=${match.id}`}
        actionLabel="View match leaderboard"
      />
    ))
    .with({ status: "settled" }, () => (
      <ActionCard
        icon={<Lock className="h-4 w-4 text-muted-foreground" />}
        title="Predictions closed"
        body="This match is already settled, so new predictions are no longer accepted."
        actionHref={`/leaderboard/match?match=${match.id}`}
        actionLabel="View match leaderboard"
      />
    ))
    .with({ status: "live" }, () => (
      <ActionCard
        icon={<Lock className="h-4 w-4 text-tc-green" />}
        title="Match is live"
        body="Predictions are locked until full time. Settlement will run once the final score is available."
        actionHref={`/leaderboard/match?match=${match.id}`}
        actionLabel="Watch leaderboard"
      />
    ))
    .with({ status: "upcoming", hasPrediction: true, has2x: true }, () => (
      <ActionCard
        icon={<Sparkles className="h-4 w-4 text-tc-orange" />}
        title="Prediction locked with 2x eligibility"
        body="You can still edit before kickoff. Your Fan Token bonus is ready if your stake holds through snapshot."
        actionHref={`/arena/${match.id}/predict`}
        actionLabel="Edit prediction"
      />
    ))
    .with({ status: "upcoming", hasPrediction: true }, () => (
      <ActionCard
        icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
        title="Prediction locked"
        body="You can still edit before kickoff. Add the matching Fan Token before snapshot to unlock the 2x bonus."
        actionHref={`/arena/${match.id}/predict`}
        actionLabel="Edit prediction"
      />
    ))
    .with({ status: "upcoming", has2x: true }, () => (
      <ActionCard
        icon={<Sparkles className="h-4 w-4 text-tc-orange" />}
        title="2x bonus available"
        body="You hold a team Fan Token for this match. Submit before kickoff to lock your prediction."
        actionHref={`/arena/${match.id}/verify`}
        actionLabel="Predict this match"
        primary
      />
    ))
    .otherwise(() => (
      <ActionCard
        icon={<ArrowRight className="h-4 w-4 text-primary" />}
        title="Ready to predict"
        body="Pick the result, total goals range, and optional first scorer before kickoff."
        actionHref={`/arena/${match.id}/verify`}
        actionLabel="Predict this match"
        primary
      />
    ));
}

function ActionCard({
  icon,
  title,
  body,
  actionHref,
  actionLabel,
  primary = false,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
  primary?: boolean;
}) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="space-y-4 p-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {body}
            </p>
          </div>
        </div>
        <Button
          asChild
          variant={primary ? "default" : "outline"}
          className="h-12 w-full font-semibold"
        >
          <Link href={actionHref}>
            {actionLabel} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
