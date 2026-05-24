import type { UserMatchEntry } from "@/lib/types";

export interface StakeEligibility {
  eligible: boolean;
  previousStake: number | null;
  requiredStake: number;
}

export function getStakeEligibility({
  alreadyEntered,
  previousEntry,
  totalStaked,
}: {
  alreadyEntered: boolean;
  previousEntry: Pick<UserMatchEntry, "total_staked_snapshot"> | null;
  totalStaked: number;
}): StakeEligibility {
  const previousStake = previousEntry?.total_staked_snapshot ?? null;
  const requiredStake = previousStake === null ? 1 : previousStake + 1;

  return {
    eligible: alreadyEntered || totalStaked >= requiredStake,
    previousStake,
    requiredStake,
  };
}
