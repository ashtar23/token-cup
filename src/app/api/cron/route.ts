import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { TEAM_TOKEN_MAP, TLA_TOKEN_MAP } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { settleMatchService } from "@/features/predictions/lib/settle";
import type { MatchStage } from "@/lib/types";

/** Mirrors the schedule in `vercel.json` (every 15 minutes). */
const STAGE_MAP: Record<string, MatchStage> = {
  GROUP_STAGE: "group",
  LAST_32: "round_of_32",
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

interface FinishedFromApi {
  apiMatchId: number;
  homeScore: number;
  awayScore: number;
}

export async function GET(req: NextRequest) {
  // Protect the endpoint — Vercel sends Bearer <CRON_SECRET> automatically
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production" && !cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is required in production" },
      { status: 500 },
    );
  }
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FOOTBALL_DATA_API_KEY not set" },
      { status: 500 },
    );
  }

  const supabase = createServerSupabaseClient();

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches",
    { headers: { "X-Auth-Token": apiKey }, cache: "no-store" },
  );
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `football-data.org: ${res.status} ${text}` },
      { status: 502 },
    );
  }

  const json = await res.json();
  const matches: unknown[] = json.matches ?? [];

  let upserted = 0;
  let skipped = 0;
  // Collect every match the API now reports as FINISHED with both scores
  // present. We'll attempt settlement for each after the upsert pass.
  const finished: FinishedFromApi[] = [];

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

    if (!homeName.trim() || !awayName.trim()) {
      skipped++;
      continue;
    }

    const apiStage = (m.stage as string | undefined) ?? "";
    const stage: MatchStage = STAGE_MAP[apiStage] ?? "group";
    const rawGroup = m.group as string | undefined;
    const groupName = rawGroup ? rawGroup.replace("GROUP_", "Group ") : null;

    const apiStatus = m.status as string;
    const status =
      apiStatus === "FINISHED"
        ? "settled"
        : apiStatus === "IN_PLAY" || apiStatus === "PAUSED"
          ? "live"
          : "upcoming";

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

    if (!error) upserted++;

    if (
      apiStatus === "FINISHED" &&
      typeof fullTime?.home === "number" &&
      typeof fullTime?.away === "number"
    ) {
      finished.push({
        apiMatchId: Number(m.id),
        homeScore: fullTime.home,
        awayScore: fullTime.away,
      });
    }
  }

  // Auto-settle: for every match the API reports as FINISHED, look up our
  // internal UUID and call the shared settle service. The service is
  // idempotent — re-running on an already-settled match is a no-op.
  let autoSettledMatches = 0;
  let autoSettledPredictions = 0;
  if (finished.length > 0) {
    const apiIds = finished.map((f) => f.apiMatchId);
    const { data: ourMatches } = await supabase
      .from("matches")
      .select("id, api_match_id")
      .in("api_match_id", apiIds);

    const internalIdByApiId = new Map<number, string>();
    for (const m of ourMatches ?? []) {
      internalIdByApiId.set(Number(m.api_match_id), m.id);
    }

    for (const f of finished) {
      const matchId = internalIdByApiId.get(f.apiMatchId);
      if (!matchId) continue;
      try {
        const result = await settleMatchService(supabase, {
          matchId,
          homeScore: f.homeScore,
          awayScore: f.awayScore,
        });
        if (result.settled > 0) {
          autoSettledMatches++;
          autoSettledPredictions += result.settled;
        }
      } catch {
        // Individual failures shouldn't kill the whole cron run
      }
    }
  }

  // Purge ISR cache so the next visit sees fresh data
  revalidatePath("/arena");
  revalidatePath("/leaderboard");
  revalidatePath("/leaderboard/match");

  return NextResponse.json({
    ok: true,
    total: matches.length,
    upserted,
    skipped,
    autoSettledMatches,
    autoSettledPredictions,
  });
}
