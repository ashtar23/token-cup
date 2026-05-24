import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerUserId } from "@/lib/user-session.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const bodySchema = z.object({
  fantasyName: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid fantasy name" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ fantasy_name: parsed.data.fantasyName })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.code === "23505" ? 409 : 500 },
    );
  }

  return NextResponse.json({ success: true });
}
