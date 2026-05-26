"use client";

import { useMemo } from "react";
import { getHeldTokenSymbols } from "@/features/user/lib/tokens";
import type { Match, Prediction, UserToken } from "@/lib/types";
import {
  buildMatchdayBriefing,
  filterArenaMatches,
  getArenaMatchGroups,
  getAvailableGroups,
  getPredictionsByMatchId,
} from "../lib/arena-hub";

export function useArenaHubState({
  matches,
  predictions,
  selectedGroup,
  searchQuery,
  userTokens,
}: {
  matches: Match[];
  predictions: Prediction[];
  selectedGroup: string | null;
  searchQuery: string;
  userTokens: UserToken[];
}) {
  const predictionsByMatchId = useMemo(
    () => getPredictionsByMatchId(predictions),
    [predictions],
  );

  const heldTokens = useMemo(
    () => getHeldTokenSymbols(userTokens),
    [userTokens],
  );

  const availableGroups = useMemo(() => getAvailableGroups(matches), [matches]);

  const filteredMatches = useMemo(
    () => filterArenaMatches({ matches, selectedGroup, searchQuery }),
    [matches, searchQuery, selectedGroup],
  );

  const matchGroups = useMemo(
    () =>
      getArenaMatchGroups({
        matches: filteredMatches,
        predictionsByMatchId,
      }),
    [filteredMatches, predictionsByMatchId],
  );

  const briefing = useMemo(
    () =>
      buildMatchdayBriefing({
        open: matchGroups.open,
        predictions,
        heldTokens,
      }),
    [heldTokens, matchGroups.open, predictions],
  );

  return {
    availableGroups,
    briefing,
    heldTokens,
    matchGroups,
    predictionsByMatchId,
  };
}
