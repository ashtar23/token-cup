import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerUserId } from "@/lib/user-session.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const tokenSchema = z.object({
  symbol: z.string().trim().min(1).max(12).transform((s) => s.toUpperCase()),
  amount: z.number().int().min(0),
});

const deleteSchema = z.object({
  symbol: z.string().trim().min(1).max(12).transform((s) => s.toUpperCase()),
});

export async function POST(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const parsed = tokenSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token input" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { symbol, amount } = parsed.data;
  const { error } = await supabase.from("user_tokens").upsert(
    { user_id: userId, token_symbol: symbol, staked_amount: amount },
    { onConflict: "user_id,token_symbol" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ symbol, amount });
}

export async function DELETE(req: NextRequest) {
  const userId = await getServerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const parsed = deleteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token input" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("user_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("token_symbol", parsed.data.symbol);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
