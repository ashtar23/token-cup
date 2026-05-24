"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatches } from "@/features/matches/data-access/queries/use-matches";
import { useMatchLeaderboard } from "../data-access/queries/use-match-leaderboard";
import {
  LeaderboardTable,
  type BoardRow,
} from "../components/leaderboard-table";
import { TEAM_FLAG } from "@/lib/constants";
import type { Match } from "@/lib/types";

interface Props {
  initialMatchId?: string;
}

export function MatchBoard({ initialMatchId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: matches = [] } = useMatches();

  // Effective match: URL param > prop > first match
  const selectedMatchId =
    searchParams.get("match") || initialMatchId || matches[0]?.id || "";
  const selectedMatch = matches.find((match) => match.id === selectedMatchId);

  const { data: rows = [], isLoading } = useMatchLeaderboard(selectedMatchId);

  const onMatchChange = useCallback(
    (matchId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("match", matchId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const matchOptions: ComboboxOption[] = matches.map((m) => {
    const homeFlag = TEAM_FLAG[m.home_team] ?? "";
    const awayFlag = TEAM_FLAG[m.away_team] ?? "";
    return {
      value: m.id,
      label: `${homeFlag} ${m.home_team} vs ${awayFlag} ${m.away_team}`.trim(),
      searchHint: `${m.home_team} ${m.away_team} ${m.group_name ?? ""}`,
      suffix:
        m.status === "settled" ? (
          <span className="text-xs text-muted-foreground ml-2">Settled</span>
        ) : m.status === "live" ? (
          <span className="text-xs text-tc-green ml-2">Live</span>
        ) : null,
    };
  });

  return (
    <>
      {matches.length > 0 && (
        <MatchPicker
          options={matchOptions}
          selectedMatchId={selectedMatchId}
          selectedMatch={selectedMatch}
          onMatchChange={onMatchChange}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <LeaderboardTable
          rows={rows as BoardRow[]}
          emptyMessage="No settled predictions for this match yet."
        />
      )}
    </>
  );
}

function MatchPicker({
  options,
  selectedMatchId,
  selectedMatch,
  onMatchChange,
}: {
  options: ComboboxOption[];
  selectedMatchId: string;
  selectedMatch: Match | undefined;
  onMatchChange: (matchId: string) => void;
}) {
  return (
    <Combobox
      options={options}
      value={selectedMatchId}
      onChange={onMatchChange}
      placeholder="Select a match..."
      searchPlaceholder="Search teams or group..."
      emptyMessage="No matches found."
      itemHeight={48}
      className="h-auto min-h-[72px] rounded-xl border-border bg-card px-4 py-3 text-left"
      renderValue={() =>
        selectedMatch ? (
          <SelectedMatchValue match={selectedMatch} />
        ) : (
          "Select a match..."
        )
      }
    />
  );
}

function SelectedMatchValue({ match }: { match: Match }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate text-sm font-semibold text-foreground">
        {TEAM_FLAG[match.home_team] ?? ""} {match.home_team} vs{" "}
        {TEAM_FLAG[match.away_team] ?? ""} {match.away_team}
      </span>
      <span className="mt-1 block truncate text-xs text-muted-foreground">
        {match.group_name ?? "Knockout"} ·{" "}
        {match.status === "settled"
          ? "Final leaderboard"
          : "Waiting for settled predictions"}
      </span>
    </span>
  );
}
