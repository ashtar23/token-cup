import { supabase } from "@/lib/supabase";
import { fakeWalletFromUserId } from "@/lib/user-session";
import type { User, UserMatchEntry, UserToken } from "@/lib/types";

export async function fetchUser(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as User | null;
}

/**
 * Ensure a `users` row exists for this UUID. Called from the /connecting
 * page on first connect. Idempotent — re-connecting with the same UUID
 * is a no-op that returns the existing row.
 */
export async function upsertUser(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: userId,
        wallet_address: fakeWalletFromUserId(userId),
      },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as User;
}

export async function fetchUserTokens(userId: string): Promise<UserToken[]> {
  const { data, error } = await supabase
    .from("user_tokens")
    .select("*")
    .eq("user_id", userId)
    .order("staked_amount", { ascending: false });
  if (error) throw error;
  return data as UserToken[];
}

export async function fetchLastMatchEntry(
  userId: string,
): Promise<UserMatchEntry | null> {
  const { data } = await supabase
    .from("user_match_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entered_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as UserMatchEntry | null;
}

export async function fetchMatchEntry(
  userId: string,
  matchId: string,
): Promise<UserMatchEntry | null> {
  const { data } = await supabase
    .from("user_match_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();
  return data as UserMatchEntry | null;
}
