import type { UserToken } from "@/lib/types";

export function getTotalStaked(tokens: UserToken[]): number {
  return tokens.reduce((sum, t) => sum + t.staked_amount, 0);
}

export function getHeldTokenSymbols(tokens: UserToken[]): string[] {
  return tokens.filter((t) => t.staked_amount > 0).map((t) => t.token_symbol);
}
