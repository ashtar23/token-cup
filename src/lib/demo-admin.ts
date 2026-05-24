import { NextRequest, NextResponse } from "next/server";

export function requireDemoAdmin(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null;

  const secret = process.env.DEMO_ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "DEMO_ADMIN_SECRET is required in production" },
      { status: 500 },
    );
  }

  const headerSecret = req.headers.get("x-demo-admin-secret");
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (headerSecret === secret || bearer === secret) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
