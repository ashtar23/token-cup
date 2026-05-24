"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STREAK_THRESHOLD } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

export interface BoardRow {
  user_id: string;
  fantasy_name: string;
  total_points: number;
  max_streak?: number;
  streak_count?: number;
  count?: number;
}

function rankBadge(i: number): string {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return String(i + 1);
}

export function LeaderboardTable({
  rows,
  emptyMessage,
}: {
  rows: BoardRow[];
  emptyMessage: string;
}) {
  const currentUserId = useCurrentUserId();

  if (rows.length === 0) {
    return <EmptyState icon="🏆" title="Nothing here yet" description={emptyMessage} />;
  }

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
        <div className="col-span-1">#</div>
        <div className="col-span-8">Player</div>
        <div className="col-span-3 text-right">Points</div>
      </div>
      {rows.map((row, i) => {
        const isMe = !!currentUserId && row.user_id === currentUserId;
        const streak = row.max_streak ?? row.streak_count ?? 0;
        return (
          <div
            key={row.user_id}
            className={cn(
              "grid grid-cols-12 gap-2 px-4 py-3 text-base items-center border-b border-border last:border-0",
              isMe && "bg-primary/10 border border-primary/20",
            )}
          >
            <div className="col-span-1 text-muted-foreground font-medium">
              {rankBadge(i)}
            </div>
            <div className="col-span-8 flex items-center gap-1.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {row.fantasy_name.slice(0, 2).toUpperCase()}
              </div>
              <span
                className={cn(
                  "font-medium truncate",
                  isMe && "text-primary font-semibold",
                )}
              >
                {row.fantasy_name}
              </span>
              {isMe && (
                <span className="text-xs text-primary shrink-0">(you)</span>
              )}
              {streak >= STREAK_THRESHOLD && (
                <span
                  className="text-xs shrink-0"
                  title={`${streak}-match streak`}
                  aria-label="On streak"
                >
                  🔥
                </span>
              )}
            </div>
            <div className="col-span-3 text-right font-semibold tabular-nums text-foreground">
              {row.total_points.toLocaleString()}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
