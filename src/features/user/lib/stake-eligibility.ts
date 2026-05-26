import type { UserMatchEntry } from "@/lib/types";

export interface StakeEligibility {
  eligible: boolean;
  previousStake: number | null;
  requiredStake: number;
  existingStakeSnapshot: number | null;
}

export function getStakeEligibility({
  currentEntry,
  previousEntry,
  totalStaked,
}: {
  currentEntry: Pick<UserMatchEntry, "total_staked_snapshot"> | null;
  previousEntry: Pick<UserMatchEntry, "total_staked_snapshot"> | null;
  totalStaked: number;
}): StakeEligibility {
  const previousStake = previousEntry?.total_staked_snapshot ?? null;
  const existingStakeSnapshot = currentEntry?.total_staked_snapshot ?? null;
  const requiredStake =
    existingStakeSnapshot ?? (previousStake === null ? 1 : previousStake + 1);

  return {
    eligible: totalStaked >= requiredStake,
    previousStake,
    requiredStake,
    existingStakeSnapshot,
  };
}
