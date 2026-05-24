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
  const nextRank =
    currentUserRank && currentUserRank.rank > 1
      ? rankedRows[currentUserRank.rank - 2]
      : undefined;
  const pointsToNextRank =
    currentUserRank && nextRank
      ? Math.max(
          0,
          nextRank.row.total_points - currentUserRank.row.total_points + 1,
        )
      : null;

  return (
    <div className="space-y-3">
      {currentUserRank && pointsToNextRank !== null && (
        <Card className="border border-primary/25 bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            You are {pointsToNextRank.toLocaleString()} pts from rank{" "}
            {currentUserRank.rank - 1}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Next target: {nextRank?.row.fantasy_name}
          </p>
        </Card>
      )}

      {topThree.length > 0 && (
        <div
          className={cn(
            "grid gap-2",
            topThree.length === 1 && "grid-cols-1",
            topThree.length === 2 && "grid-cols-2",
            topThree.length >= 3 && "grid-cols-3",
          )}
        >
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
        "border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
        rank === 1 && "border-tc-amber/40 bg-tc-amber/5",
        isMe && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-xl leading-none">
          {medal}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {row.fantasy_name}
          </div>
          <div className="mt-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {row.total_points.toLocaleString()} pts
          </div>
          <RowBadges row={row} compact />
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
        <RowBadges row={row} />
      </div>
      <div className="col-span-3 text-right font-semibold tabular-nums text-foreground">
        {row.total_points.toLocaleString()}
      </div>
    </div>
  );
}

function RowBadges({
  row,
  compact = false,
}: {
  row: BoardRow;
  compact?: boolean;
}) {
  const streak = row.max_streak ?? row.streak_count ?? 0;
  const predictionCount = row.count ?? null;

  if (streak < STREAK_THRESHOLD && predictionCount === null) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1",
        compact && "mt-2",
      )}
    >
      {streak >= STREAK_THRESHOLD && (
        <span
          className="rounded-full bg-tc-orange/15 px-1.5 py-0.5 text-[10px] font-semibold text-tc-orange"
          title={`${streak}-match streak qualifies for the streak multiplier`}
        >
          {streak} streak
        </span>
      )}
      {predictionCount !== null && (
        <span
          className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
          title="Settled predictions counted in this leaderboard"
        >
          {predictionCount} picks
        </span>
      )}
    </div>
  );
}
