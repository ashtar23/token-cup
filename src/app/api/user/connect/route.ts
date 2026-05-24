import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fakeWalletFromUserId } from "@/lib/user-session";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const bodySchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        id: parsed.data.userId,
        wallet_address: fakeWalletFromUserId(parsed.data.userId),
      },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
