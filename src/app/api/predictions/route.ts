import { NextResponse } from "next/server";
import { getServerUserId } from "@/lib/user-session.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function DELETE() {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const [{ error }, { error: achievementError }, { error: eventError }] =
    await Promise.all([
      supabase.from("predictions").delete().eq("user_id", userId),
      supabase.from("user_achievements").delete().eq("user_id", userId),
      supabase.from("achievement_events").delete().eq("user_id", userId),
    ]);

  const failed = error ?? achievementError ?? eventError;
  if (failed) {
    return NextResponse.json({ error: failed.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
