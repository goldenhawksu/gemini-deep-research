import { NextRequest, NextResponse } from "next/server";
import { createSession, passwordMatches, SESSION_COOKIE, SESSION_SECONDS } from "@/utils/session";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const password = process.env.ACCESS_PASSWORD || "";
  let candidate: unknown;
  try { candidate = (await request.json()).password; } catch { /* invalid JSON */ }
  if (typeof candidate !== "string" || candidate.length > 1024 || !await passwordMatches(candidate, password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, await createSession(password), {
    httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS,
  });
  return response;
}
