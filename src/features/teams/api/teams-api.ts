export type SquadPosition = "Goalkeeper" | "Defence" | "Midfield" | "Offence";

export interface SquadPlayer {
  id: number;
  name: string;
  position: SquadPosition | null;
}

export interface Squad {
  teamId: number;
  teamName: string;
  tla: string;
  players: SquadPlayer[];
}

export async function fetchSquad(teamApiId: number): Promise<Squad> {
  const res = await fetch(`/api/squad?teamId=${teamApiId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Squad fetch failed (${res.status})`);
  }
  return res.json() as Promise<Squad>;
}
