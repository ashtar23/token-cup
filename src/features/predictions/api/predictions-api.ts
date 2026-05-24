import { supabase } from "@/lib/supabase";
import type { Prediction } from "@/lib/types";

export async function fetchUserPredictions(
  userId: string,
): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data as Prediction[];
}

export async function fetchPrediction(
  userId: string,
  matchId: string,
): Promise<Prediction | null> {
  const { data } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();
  return data as Prediction | null;
}
