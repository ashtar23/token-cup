"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FanPulseSkeleton({ compact }: { compact: boolean }) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className={compact ? "space-y-3 p-4" : "space-y-4 p-4"}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
