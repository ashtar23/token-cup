import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSquads } from "@/features/teams/data-access/queries/use-squad";
import type { SquadPlayer } from "@/features/teams/api/teams-api";
import { TEAM_FLAG } from "@/lib/constants";
import type { Match } from "@/lib/types";

export function SquadsSection({ match }: { match: Match }) {
  const [home, away] = useSquads([
    match.home_team_api_id,
    match.away_team_api_id,
  ]);

  if (!match.home_team_api_id && !match.away_team_api_id) return null;

  if (home.isLoading || away.isLoading) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Key players
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const homeAttackers = pickAttackers(home.data?.players);
  const awayAttackers = pickAttackers(away.data?.players);

  if (homeAttackers.length === 0 && awayAttackers.length === 0) return null;

  return (
    <Card className="border border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Key players
        </p>
        <div className="grid grid-cols-2 gap-4">
          <SquadColumn teamName={match.home_team} players={homeAttackers} />
          <SquadColumn teamName={match.away_team} players={awayAttackers} />
        </div>
      </CardContent>
    </Card>
  );
}

function pickAttackers(players?: SquadPlayer[]): SquadPlayer[] {
  return (players ?? [])
    .filter(
      (player) =>
        player.position === "Offence" || player.position === "Midfield",
    )
    .slice(0, 6);
}

function SquadColumn({
  teamName,
  players,
}: {
  teamName: string;
  players: SquadPlayer[];
}) {
  return (
    <div className="space-y-2.5">
      <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-xl leading-none">
          {TEAM_FLAG[teamName] ?? "🏳️"}
        </span>
        {teamName}
      </p>
      {players.length === 0 ? (
        <p className="text-base italic text-muted-foreground">Squad TBD</p>
      ) : (
        <ul className="space-y-1.5 text-base text-muted-foreground">
          {players.map((player) => (
            <li key={player.id} className="truncate">
              {player.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
