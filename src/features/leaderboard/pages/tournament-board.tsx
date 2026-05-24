"use client";

import { useTournamentLeaderboard } from "../data-access/queries/use-tournament-leaderboard";
import { LeaderboardTable, type BoardRow } from "../components/leaderboard-table";

export function TournamentBoard() {
  const { data = [] } = useTournamentLeaderboard();
  return (
    <LeaderboardTable
      rows={data as BoardRow[]}
      emptyMessage="No settled predictions yet. Leaderboard updates after each match."
    />
  );
}
