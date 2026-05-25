"use client";

import { Shield, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FanPulseCamp } from "@/features/predictions/api/fan-pulse-api";
import { formatResult } from "@/features/predictions/lib/fan-pulse-view";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TokenCampTile({
  match,
  camp,
  isUserCamp,
}: {
  match: Match;
  camp: FanPulseCamp;
  isUserCamp: boolean;
}) {
  const leadingLabel = camp.leadingResult
    ? formatResult(camp.leadingResult, match)
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        isUserCamp
          ? "border-primary/35 bg-primary/10"
          : "border-border bg-background/35",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">{camp.label}</p>
        </div>
        {isUserCamp && (
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            yours
          </Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {camp.totalPicks > 0 && leadingLabel
          ? `${camp.totalPicks} ${
              camp.totalPicks === 1 ? "pick" : "picks"
            } · ${camp.leadingPercentage}% backing ${leadingLabel}`
          : `${camp.label} forming · no token-holder picks yet`}
      </p>
    </div>
  );
}

export function NoTokenCampTile() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/35 px-3 py-3">
      <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-sm font-semibold text-foreground">
          No team-token camp
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This fixture has no Socios Fan Token mapped yet, so Fan Pulse shows
          the overall locked-pick signal.
        </p>
      </div>
    </div>
  );
}
