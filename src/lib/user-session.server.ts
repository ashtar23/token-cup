import "server-only";
import { cookies } from "next/headers";
import { USER_ID_COOKIE } from "./user-session";

export async function getServerUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(USER_ID_COOKIE)?.value ?? null;
}
