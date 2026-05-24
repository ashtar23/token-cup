import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { settleMatchService } from "@/features/predictions/lib/settle";
import { requireDemoAdmin } from "@/lib/demo-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * POST /api/settle — manual settle endpoint used by the dev panel.
 * The cron route calls {@link settleMatchService} directly when a
 * match's status transitions to FINISHED upstream.
 */
export async function POST(req: NextRequest) {
  const adminError = requireDemoAdmin(req);
  if (adminError) return adminError;

  const supabase = createServerSupabaseClient();
  const { matchId, homeScore, awayScore } = await req.json();

  if (!matchId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await settleMatchService(supabase, {
      matchId,
      homeScore,
      awayScore,
    });

    revalidatePath("/leaderboard");
    revalidatePath("/leaderboard/match");
    revalidatePath("/arena");

    return NextResponse.json({ settled: result.settled });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Settle failed" },
      { status: 500 },
    );
  }
}
