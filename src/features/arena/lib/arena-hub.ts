import { TEAM_FLAG } from "@/lib/constants";
import type { Match, Prediction } from "@/lib/types";

export interface ArenaMatchGroups {
  open: Match[];
  predicted: Match[];
  settled: Match[];
  results: Match[];
  predictedLive: Match[];
  predictedUpcoming: Match[];
}

export interface MatchdayBriefingData {
  nextOpen: MatchBrief | null;
  bestBonus: MatchBrief | null;
  bestStreak: number;
  openCount: number;
}

export interface MatchBrief {
  id: string;
  label: string;
  meta: string;
}

export function getPredictionsByMatchId(
  predictions: Prediction[],
): Record<string, Prediction> {
  return Object.fromEntries(
    predictions.map((prediction) => [prediction.match_id, prediction]),
  );
}

export function getAvailableGroups(matches: Match[]): string[] {
  return Array.from(
    new Set(
      matches
        .map((match) => match.group_name)
        .filter((group): group is string => group !== null),
    ),
  ).sort();
}

export function filterArenaMatches({
  matches,
  selectedGroup,
  searchQuery,
}: {
  matches: Match[];
  selectedGroup: string | null;
  searchQuery: string;
}): Match[] {
  const query = searchQuery.trim().toLowerCase();

  return matches.filter((match) => {
    const matchesGroup =
      selectedGroup === null || match.group_name === selectedGroup;
    const matchesSearch =
      query.length === 0 ||
      `${match.home_team} ${match.away_team}`.toLowerCase().includes(query);

    return matchesGroup && matchesSearch;
  });
}

export function getArenaMatchGroups({
  matches,
  predictionsByMatchId,
}: {
  matches: Match[];
  predictionsByMatchId: Record<string, Prediction>;
}): ArenaMatchGroups {
  const predicted = matches.filter(
    (match) => match.status !== "settled" && predictionsByMatchId[match.id],
  );

  return {
    open: matches.filter(
      (match) => match.status === "upcoming" && !predictionsByMatchId[match.id],
    ),
    predicted,
    settled: matches.filter(
      (match) => match.status === "settled" && predictionsByMatchId[match.id],
    ),
    results: matches.filter((match) => match.status === "settled"),
    predictedLive: predicted.filter((match) => match.status === "live"),
    predictedUpcoming: predicted.filter((match) => match.status === "upcoming"),
  };
}

export function buildMatchdayBriefing({
  open,
  predictions,
  heldTokens,
}: {
  open: Match[];
  predictions: Prediction[];
  heldTokens: string[];
}): MatchdayBriefingData {
  const byKickoff = [...open].sort(
    (a, b) =>
      new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime(),
  );
  const bestBonusMatch = byKickoff.find((match) =>
    [match.home_token, match.away_token].some(
      (token) => token !== null && heldTokens.includes(token),
    ),
  );

  return {
    nextOpen: byKickoff[0] ? toMatchBrief(byKickoff[0]) : null,
    bestBonus: bestBonusMatch ? toMatchBrief(bestBonusMatch) : null,
    bestStreak: Math.max(0, ...predictions.map((p) => p.streak_count)),
    openCount: open.length,
  };
}

function toMatchBrief(match: Match): MatchBrief {
  return {
    id: match.id,
    label: `${TEAM_FLAG[match.home_team] ?? "🏳️"} ${match.home_team} vs ${
      TEAM_FLAG[match.away_team] ?? "🏳️"
    } ${match.away_team}`,
    meta: `${formatBriefDate(match.kickoff_at)}${
      match.group_name ? ` · ${match.group_name}` : ""
    }`,
  };
}

function formatBriefDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
