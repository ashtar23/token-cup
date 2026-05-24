import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceRoleKey && !publishableKey) {
    throw new Error("Supabase server key is not set");
  }

  return createClient(supabaseUrl, serviceRoleKey ?? publishableKey!, {
    auth: { persistSession: false },
  });
}
