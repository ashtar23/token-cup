"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in dev so you can spot it; real telemetry would go here
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[app/error]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4">
      <Card className="max-w-md w-full border border-destructive/30">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60 font-mono">
                {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} className="w-full">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
