import { supabase } from "@/lib/supabase";
import type { Match } from "@/lib/types";

export interface FetchMatchesParams {
  /** Filter by group_name (e.g. "Group A"). */
  group?: string;
  /** Substring match against home_team + away_team. */
  search?: string;
}

/**
 * Fetch all valid matches, optionally filtered by group or team search.
 * The filters here exist for future BE-side narrowing; current callers
 * filter client-side over the whole list for snappier UX.
 */
export async function fetchMatches(params: FetchMatchesParams = {}): Promise<Match[]> {
  let query = supabase
    .from("matches")
    .select("*")
    .not("home_team", "is", null)
    .not("away_team", "is", null)
    .neq("home_team", "")
    .neq("away_team", "")
    .order("kickoff_at", { ascending: true });

  if (params.group) {
    query = query.eq("group_name", params.group);
  }
  if (params.search?.trim()) {
    const q = params.search.trim();
    query = query.or(`home_team.ilike.%${q}%,away_team.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Match[];
}

export async function fetchMatch(matchId: string): Promise<Match> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (error) throw error;
  return data as Match;
}
