"use client";

import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FanPulseHeader({
  verdict,
  summary,
  totalPicks,
}: {
  verdict: string;
  summary: string;
  totalPicks: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Fan Pulse
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {verdict}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>
      <Badge className="border-primary/20 bg-primary/10 text-primary">
        {totalPicks} {totalPicks === 1 ? "pick" : "picks"}
      </Badge>
    </div>
  );
}
