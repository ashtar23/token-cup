"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { userTokensQueryKey } from "../keys";
import { useCurrentUserId } from "@/providers/UserSessionProvider";
import type { UserToken } from "@/lib/types";

interface UpsertTokenInput {
  symbol: string;
  amount: number;
}

interface MutationContext {
  prev: UserToken[] | undefined;
}

export function useUpsertUserToken() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  return useMutation<unknown, Error, UpsertTokenInput, MutationContext>({
    mutationFn: async ({ symbol, amount }) => {
      if (!userId) throw new Error("Not connected");
      const { error } = await supabase
        .from("user_tokens")
        .upsert(
          { user_id: userId, token_symbol: symbol, staked_amount: amount },
          { onConflict: "user_id,token_symbol" },
        );
      if (error) throw error;
      return { symbol, amount };
    },
    onMutate: async ({ symbol, amount }) => {
      if (!userId) return { prev: undefined };
      const key = userTokensQueryKey(userId);

      // Cancel any in-flight refetches so they don't clobber our optimistic patch
      await queryClient.cancelQueries({ queryKey: key });

      const prev = queryClient.getQueryData<UserToken[]>(key);
      queryClient.setQueryData<UserToken[]>(key, (old) => {
        const others = (old ?? []).filter((t) => t.token_symbol !== symbol);
        const optimistic: UserToken = {
          // Use a stable optimistic id so React keys don't churn; the real
          // row arrives on invalidation with a real UUID
          id: `optimistic-${symbol}`,
          user_id: userId,
          token_symbol: symbol,
          staked_amount: amount,
          updated_at: new Date().toISOString(),
        };
        return [...others, optimistic].sort(
          (a, b) => b.staked_amount - a.staked_amount,
        );
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (!userId || !context) return;
      queryClient.setQueryData(userTokensQueryKey(userId), context.prev);
    },
    onSettled: () => {
      if (userId)
        queryClient.invalidateQueries({
          queryKey: userTokensQueryKey(userId),
        });
    },
  });
}

export function useDeleteUserToken() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  return useMutation<unknown, Error, string, MutationContext>({
    mutationFn: async (symbol) => {
      if (!userId) throw new Error("Not connected");
      const { error } = await supabase
        .from("user_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("token_symbol", symbol);
      if (error) throw error;
      return symbol;
    },
    onMutate: async (symbol) => {
      if (!userId) return { prev: undefined };
      const key = userTokensQueryKey(userId);
      await queryClient.cancelQueries({ queryKey: key });

      const prev = queryClient.getQueryData<UserToken[]>(key);
      queryClient.setQueryData<UserToken[]>(key, (old) =>
        (old ?? []).filter((t) => t.token_symbol !== symbol),
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (!userId || !context) return;
      queryClient.setQueryData(userTokensQueryKey(userId), context.prev);
    },
    onSettled: () => {
      if (userId)
        queryClient.invalidateQueries({
          queryKey: userTokensQueryKey(userId),
        });
    },
  });
}
