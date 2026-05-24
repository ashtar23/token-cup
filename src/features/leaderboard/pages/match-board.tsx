"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useMatches } from "@/features/matches/data-access/queries/use-matches";
import { useMatchLeaderboard } from "../data-access/queries/use-match-leaderboard";
import { LeaderboardTable, type BoardRow } from "../components/leaderboard-table";
import { TEAM_FLAG } from "@/lib/constants";

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
        <Combobox
          options={matchOptions}
          value={selectedMatchId}
          onChange={onMatchChange}
          placeholder="Select a match…"
          searchPlaceholder="Search teams or group…"
          emptyMessage="No matches found."
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="spinner" />
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
