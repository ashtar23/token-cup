import { Clock3, Coins, Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TEAM_FLAG } from "@/lib/constants";
import type { Match } from "@/lib/types";
import type { ReactNode } from "react";
import { StatusBadge } from "./status-badge";
import { getKickoffLabel } from "./match-detail-utils";

interface MatchHeroProps {
  match: Match;
  has2x: boolean;
  totalStaked: number;
  stakeSnapshot: number | null;
}

export function MatchHero({
  match,
  has2x,
  totalStaked,
  stakeSnapshot,
}: MatchHeroProps) {
  const kickoffLabel = getKickoffLabel(match);

  return (
    <Card className="overflow-hidden border border-primary/20 bg-card">
      <CardContent className="p-0">
        <div className="border-b border-border bg-primary/5 px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Match arena
            </div>
            <StatusBadge status={match.status} />
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-xl font-bold text-foreground">
              <span className="mr-1 text-2xl">
                {TEAM_FLAG[match.home_team] ?? "🏳️"}
              </span>
              {match.home_team}
              <span className="mx-3 font-normal text-muted-foreground">vs</span>
              {match.away_team}
              <span className="ml-1 text-2xl">
                {TEAM_FLAG[match.away_team] ?? "🏳️"}
              </span>
            </div>

            {match.status === "settled" && match.home_score !== null && (
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {match.home_score} - {match.away_score}
              </p>
            )}

            {has2x && (
              <Badge className="border-tc-orange/30 bg-tc-orange/20 text-xs text-tc-orange">
                2x token bonus active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <TicketStat
              icon={<Clock3 className="h-3.5 w-3.5" />}
              label={match.status === "upcoming" ? "Kickoff" : "Status"}
              value={kickoffLabel}
            />
            <TicketStat
              icon={<Coins className="h-3.5 w-3.5" />}
              label="Staked now"
              value={totalStaked.toLocaleString()}
            />
            <TicketStat
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Snapshot"
              value={
                stakeSnapshot === null
                  ? "Not locked"
                  : stakeSnapshot.toLocaleString()
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
