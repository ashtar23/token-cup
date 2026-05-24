"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { userQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";

/** Thrown when the chosen fantasy name is already in use by another user. */
export class FantasyNameTakenError extends Error {
  constructor() {
    super("That name is already taken");
    this.name = "FantasyNameTakenError";
  }
}

const PG_UNIQUE_VIOLATION = "23505";

export function useSetFantasyName() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  return useMutation({
    mutationFn: async (fantasyName: string) => {
      if (!userId) throw new Error("Not connected");
      const { error } = await supabase
        .from("users")
        .update({ fantasy_name: fantasyName })
        .eq("id", userId);
      if (!error) return;

      // Surface the unique-violation case distinctly so the UI can show
      // a precise error. Everything else propagates as-is.
      const code = (error as { code?: string }).code;
      if (code === PG_UNIQUE_VIOLATION) throw new FantasyNameTakenError();
      throw error;
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: userQueryKey(userId) });
    },
  });
}
