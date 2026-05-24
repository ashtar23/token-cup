import { supabase } from "@/lib/supabase";

export interface TournamentLeaderboardRow {
  user_id: string;
  fantasy_name: string;
  total_points: number;
  max_streak: number;
  count: number;
}

export interface MatchLeaderboardRow {
  user_id: string;
  fantasy_name: string;
  total_points: number;
  streak_count: number;
}

/**
 * Tournament-wide leaderboard. Aggregation happens in Postgres via the
 * `tournament_leaderboard_view` view — no JS-side reducer needed.
 */
export async function fetchTournamentLeaderboard(): Promise<
  TournamentLeaderboardRow[]
> {
  const { data, error } = await supabase
    .from("tournament_leaderboard_view")
    .select("*")
    .order("total_points", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TournamentLeaderboardRow[];
}

/**
 * Per-match leaderboard. Same idea — DB does the join, we just order.
 */
export async function fetchMatchLeaderboard(
  matchId: string,
): Promise<MatchLeaderboardRow[]> {
  const { data, error } = await supabase
    .from("match_leaderboard_view")
    .select("user_id, fantasy_name, total_points, streak_count")
    .eq("match_id", matchId)
    .order("total_points", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MatchLeaderboardRow[];
}
