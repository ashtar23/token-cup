import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Match, Prediction } from "@/lib/types";
import type { ReactNode } from "react";

export function ActionRow({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction | null;
}) {
  const content = {
    settled: (
      <Button asChild variant="outline" className="w-full h-12">
        <Link href="/leaderboard/match">View leaderboard for this match</Link>
      </Button>
    ),
    live: (
      <Card className="border border-tc-green/30 bg-tc-green/5">
        <CardContent className="p-4 text-center text-sm text-foreground">
          Match is live - predictions are locked until full time.
        </CardContent>
      </Card>
    ),
    upcoming: prediction ? (
      <Button asChild variant="outline" className="w-full h-12">
        <Link href={`/arena/${match.id}/predict`}>
          Edit your prediction <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    ) : (
      <Button
        asChild
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
      >
        <Link href={`/arena/${match.id}/verify`}>
          Predict this match <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    ),
  } satisfies Record<Match["status"], ReactNode>;

  return content[match.status];
}
