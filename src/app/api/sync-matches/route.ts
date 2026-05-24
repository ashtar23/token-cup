import { NextRequest, NextResponse } from "next/server";
import { TEAM_TOKEN_MAP, TLA_TOKEN_MAP } from "@/lib/constants";
import { requireDemoAdmin } from "@/lib/demo-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { MatchStage } from "@/lib/types";

const STAGE_MAP: Record<string, MatchStage> = {
  GROUP_STAGE: "group",
  LAST_32: "round_of_32", // WC 2026 Round of 32
  LAST_16: "round_of_16",
  ROUND_OF_16: "round_of_16",
  QUARTER_FINALS: "quarter_final",
  QUARTER_FINAL: "quarter_final",
  SEMI_FINALS: "semi_final",
  SEMI_FINAL: "semi_final",
  THIRD_PLACE: "semi_final",
  FINAL: "final",
};

function resolveToken(name: string, tla: string): string | null {
  return TEAM_TOKEN_MAP[name] ?? TLA_TOKEN_MAP[tla] ?? null;
}

export async function GET(req: NextRequest) {
  const adminError = requireDemoAdmin(req);
  if (adminError) return adminError;

  const supabase = createServerSupabaseClient();

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FOOTBALL_DATA_API_KEY not set" },
      { status: 500 },
    );
  }

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches",
    {
      headers: { "X-Auth-Token": apiKey },
      // Don't cache in the API route — we want fresh data on each sync call
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `football-data.org error: ${res.status} — ${text}` },
      { status: 502 },
    );
  }

  const json = await res.json();
  const matches: unknown[] = json.matches ?? [];

  let upserted = 0;
  const errors: string[] = [];

  for (const raw of matches) {
    const m = raw as Record<string, unknown>;

    const homeTeam = m.homeTeam as Record<string, string> | undefined;
    const awayTeam = m.awayTeam as Record<string, string> | undefined;
    const score = m.score as Record<string, unknown> | undefined;
    const fullTime = score?.fullTime as
      | Record<string, number | null>
      | undefined;

    const homeName = homeTeam?.name ?? "";
    const awayName = awayTeam?.name ?? "";
    const homeTla = homeTeam?.tla ?? "";
    const awayTla = awayTeam?.tla ?? "";

    // Skip TBD knockout matches — API returns empty names for unresolved slots
    if (!homeName.trim() || !awayName.trim()) continue;

    const apiStage = (m.stage as string | undefined) ?? "";
    const stage: MatchStage = STAGE_MAP[apiStage] ?? "group";

    // group comes back as "GROUP_A", "GROUP_B", etc. — store it as-is or prettify
    const rawGroup = m.group as string | undefined;
    const groupName = rawGroup
      ? rawGroup.replace("GROUP_", "Group ") // "GROUP_A" → "Group A"
      : null;

    const apiStatus = m.status as string;
    const status =
      apiStatus === "FINISHED"
        ? "settled"
        : apiStatus === "IN_PLAY" || apiStatus === "PAUSED"
          ? "live"
          : "upcoming"; // covers SCHEDULED, TIMED, POSTPONED, etc.

    const { error } = await supabase.from("matches").upsert(
      {
        api_match_id: m.id,
        home_team: homeName,
        away_team: awayName,
        home_team_api_id: homeTeam?.id ? Number(homeTeam.id) : null,
        away_team_api_id: awayTeam?.id ? Number(awayTeam.id) : null,
        home_token: resolveToken(homeName, homeTla),
        away_token: resolveToken(awayName, awayTla),
        kickoff_at: m.utcDate,
        status,
        stage,
        group_name: groupName,
        home_score: fullTime?.home ?? null,
        away_score: fullTime?.away ?? null,
      },
      { onConflict: "api_match_id" },
    );

    if (error) {
      errors.push(`Match ${m.id}: ${error.message}`);
    } else {
      upserted++;
    }
  }

  return NextResponse.json({
    total: matches.length,
    upserted,
    ...(errors.length > 0 && { errors }),
  });
}
