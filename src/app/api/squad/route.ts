import { NextRequest, NextResponse } from "next/server";

export type SquadPosition = "Goalkeeper" | "Defence" | "Midfield" | "Offence";

export interface SquadPlayer {
  id: number;
  name: string;
  position: SquadPosition | null;
}

export interface SquadResponse {
  teamId: number;
  teamName: string;
  tla: string;
  players: SquadPlayer[];
}

interface ApiSquadEntry {
  id: number;
  name: string;
  position?: SquadPosition | null;
}

interface ApiTeam {
  id: number;
  name: string;
  tla: string;
  squad?: ApiSquadEntry[];
}

/**
 * Proxies football-data.org /v4/teams/{id} so the API key stays server-side.
 * Edge-cached for 30 minutes — squads rarely change.
 */
export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get("teamId");
  if (!teamId || !/^\d+$/.test(teamId)) {
    return NextResponse.json({ error: "Invalid teamId" }, { status: 400 });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FOOTBALL_DATA_API_KEY not set" },
      { status: 500 },
    );
  }

  const res = await fetch(`https://api.football-data.org/v4/teams/${teamId}`, {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate: 1800 }, // 30 min edge cache
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `football-data.org: ${res.status} ${text}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as ApiTeam;
  const players: SquadPlayer[] = (data.squad ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position ?? null,
  }));

  const payload: SquadResponse = {
    teamId: data.id,
    teamName: data.name,
    tla: data.tla,
    players,
  };

  return NextResponse.json(payload);
}
