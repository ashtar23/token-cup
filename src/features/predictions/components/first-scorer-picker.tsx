"use client";

import { ToggleButton } from "./toggle-button";
import { Skeleton } from "@/components/ui/skeleton";
import { TEAM_FLAG } from "@/lib/constants";
import { useSquads } from "@/features/teams/data-access/queries/use-squad";
import type { SquadPlayer } from "@/features/teams/api/teams-api";

interface FirstScorerPickerProps {
  homeTeamApiId: number | null;
  awayTeamApiId: number | null;
  homeTeamName: string;
  awayTeamName: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

export function FirstScorerPicker({
  homeTeamApiId,
  awayTeamApiId,
  homeTeamName,
  awayTeamName,
  value,
  onChange,
}: FirstScorerPickerProps) {
  const [homeSquad, awaySquad] = useSquads([homeTeamApiId, awayTeamApiId]);

  // Defence in depth — the parent page already hides this picker when
  // neither team has an api_id. If it sneaks through anyway, render
  // nothing rather than show irrelevant fallback names.
  if (!homeTeamApiId && !awayTeamApiId) return null;

  const homeLoading = !!homeTeamApiId && homeSquad.isLoading;
  const awayLoading = !!awayTeamApiId && awaySquad.isLoading;

  // First paint: skeleton groups so the user sees the structure that's coming
  if (homeLoading || awayLoading) {
    return (
      <div className="space-y-3">
        {!!homeTeamApiId && <SkeletonGroup teamName={homeTeamName} count={8} />}
        {!!awayTeamApiId && <SkeletonGroup teamName={awayTeamName} count={8} />}
      </div>
    );
  }

  const homeAttackers = pickAttackers(homeSquad.data?.players);
  const awayAttackers = pickAttackers(awaySquad.data?.players);

  // Both squads returned but neither had usable players — most likely
  // the API hasn't published WC 2026 rosters for these teams yet.
  if (homeAttackers.length === 0 && awayAttackers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">
        Squads haven&apos;t been published yet for these teams. You can still
        predict the result and goals range.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {homeAttackers.length > 0 && (
        <TeamGroup
          teamName={homeTeamName}
          players={homeAttackers}
          value={value}
          onChange={onChange}
        />
      )}
      {awayAttackers.length > 0 && (
        <TeamGroup
          teamName={awayTeamName}
          players={awayAttackers}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function pickAttackers(players: SquadPlayer[] | undefined): SquadPlayer[] {
  return (players ?? []).filter(
    (p) => p.position === "Offence" || p.position === "Midfield",
  );
}

function TeamGroup({
  teamName,
  players,
  value,
  onChange,
}: {
  teamName: string;
  players: SquadPlayer[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <span className="text-base leading-none">
          {TEAM_FLAG[teamName] ?? "🏳️"}
        </span>
        {teamName}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {players.map((p) => (
          <ToggleButton
            key={p.id}
            selected={value === p.name}
            onClick={() => onChange(value === p.name ? null : p.name)}
            className="text-sm px-3 py-1.5"
          >
            {p.name}
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}

function SkeletonGroup({ teamName, count }: { teamName: string; count: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <span className="text-base leading-none">
          {TEAM_FLAG[teamName] ?? "🏳️"}
        </span>
        {teamName}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            // Vary widths a bit so it doesn't look mechanical
            className={`h-9 rounded-lg ${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}`}
          />
        ))}
      </div>
    </div>
  );
}

const SKELETON_WIDTHS = ["w-20", "w-24", "w-28", "w-16", "w-24", "w-20", "w-32", "w-20"];
