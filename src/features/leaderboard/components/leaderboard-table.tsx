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
    return (
      <EmptyState
        icon="🏆"
        title="Nothing here yet"
        description={emptyMessage}
      />
    );
  }

  const rankedRows = rows.map((row, index) => ({ row, rank: index + 1 }));
  const topThree = rankedRows.slice(0, 3);
  const tableRows = rankedRows.slice(3);
  const currentUserRank = currentUserId
    ? rankedRows.find((item) => item.row.user_id === currentUserId)
    : undefined;
  const showPinnedUser = !!currentUserRank && currentUserRank.rank > 10;

  return (
    <div className="space-y-3">
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {topThree.map(({ row, rank }) => (
            <PodiumCard
              key={row.user_id}
              row={row}
              rank={rank}
              isMe={row.user_id === currentUserId}
            />
          ))}
        </div>
      )}

      {showPinnedUser && currentUserRank && (
        <Card className="border border-primary/30 bg-primary/5">
          <LeaderboardRow
            row={currentUserRank.row}
            rank={currentUserRank.rank}
            isMe
            pinned
          />
        </Card>
      )}

      {tableRows.length > 0 && (
        <Card className="border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
            <div className="col-span-1">#</div>
            <div className="col-span-8">Player</div>
            <div className="col-span-3 text-right">Points</div>
          </div>
          {tableRows.map(({ row, rank }) => (
            <LeaderboardRow
              key={row.user_id}
              row={row}
              rank={rank}
              isMe={!!currentUserId && row.user_id === currentUserId}
            />
          ))}
        </Card>
      )}
    </div>
  );
}

function PodiumCard({
  row,
  rank,
  isMe,
}: {
  row: BoardRow;
  rank: number;
  isMe: boolean;
}) {
  const medal = rankBadge(rank - 1);
  return (
    <Card
      className={cn(
        "border border-border bg-card",
        rank === 1 && "border-tc-amber/40 bg-tc-amber/5",
        isMe && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="p-3 text-center">
        <div className="text-2xl leading-none">{medal}</div>
        <div className="mt-2 truncate text-sm font-semibold text-foreground">
          {row.fantasy_name}
        </div>
        <div className="mt-1 text-xs font-semibold tabular-nums text-muted-foreground">
          {row.total_points.toLocaleString()} pts
        </div>
      </div>
    </Card>
  );
}

function LeaderboardRow({
  row,
  rank,
  isMe,
  pinned = false,
}: {
  row: BoardRow;
  rank: number;
  isMe: boolean;
  pinned?: boolean;
}) {
  const streak = row.max_streak ?? row.streak_count ?? 0;
  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center border-b border-border last:border-0",
        isMe && "bg-primary/10",
        pinned && "border-b-0",
      )}
    >
      <div className="col-span-1 text-muted-foreground font-medium">
        {rankBadge(rank - 1)}
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
        {isMe && <span className="text-xs text-primary shrink-0">(you)</span>}
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
}
