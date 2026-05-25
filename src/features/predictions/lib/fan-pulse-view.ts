import type {
  FanPulseCamp,
  FanPulseCampKey,
} from "@/features/predictions/api/fan-pulse-api";
import type { Match, PredictedResult } from "@/lib/types";

export function buildPulseVerdict(match: Match, camp: FanPulseCamp): string {
  if (camp.totalPicks === 0 || camp.leadingResult === null) {
    return "Crowd signal forming";
  }

  return `Crowd leaning: ${formatResult(camp.leadingResult, match)} · ${
    camp.leadingPercentage
  }%`;
}

export function buildPulseSummary({
  match,
  userCamp,
  userPick,
  totalPicks,
}: {
  match: Match;
  userCamp: FanPulseCamp | null;
  userPick: PredictedResult | null;
  totalPicks: number;
}): string {
  if (totalPicks === 0) {
    return "No locked picks yet. The first fans will shape the match signal.";
  }

  if (!userPick) {
    return "See how token holders are lining up before kickoff.";
  }

  if (!userCamp || userCamp.key === "all") {
    return `Your pick is locked on ${formatResult(userPick, match)}.`;
  }

  if (userCamp.leadingResult === userPick) {
    return `You're with the ${userCamp.label} on ${formatResult(
      userPick,
      match,
    )}.`;
  }

  return `You're going against the ${userCamp.label} with ${formatResult(
    userPick,
    match,
  )}.`;
}

export function pickUserCamp({
  camps,
  match,
  heldTokenSymbols,
}: {
  camps: FanPulseCamp[];
  match: Match;
  heldTokenSymbols: string[];
}): FanPulseCamp | null {
  const homeCamp = findCamp(camps, "home");
  const awayCamp = findCamp(camps, "away");

  if (
    homeCamp &&
    match.home_token !== null &&
    heldTokenSymbols.includes(match.home_token)
  ) {
    return homeCamp;
  }

  if (
    awayCamp &&
    match.away_token !== null &&
    heldTokenSymbols.includes(match.away_token)
  ) {
    return awayCamp;
  }

  return null;
}

export function findCamp(
  camps: FanPulseCamp[],
  key: FanPulseCampKey,
): FanPulseCamp | null {
  return camps.find((camp) => camp.key === key) ?? null;
}

export function getTokenCamps(camps: FanPulseCamp[]): FanPulseCamp[] {
  return camps.filter((camp) => camp.key === "home" || camp.key === "away");
}

export function formatResult(result: PredictedResult, match: Match): string {
  const labels = {
    home_win: `${match.home_team} win`,
    draw: "Draw",
    away_win: `${match.away_team} win`,
  } satisfies Record<PredictedResult, string>;

  return labels[result];
}
