"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-12">
      <div className="flex flex-col items-center text-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Couldn&apos;t load the leaderboard
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || "Unexpected error."}
          </p>
        </div>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
