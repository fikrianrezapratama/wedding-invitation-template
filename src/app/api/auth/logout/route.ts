import { NextResponse } from "next/server";
import { AUTH_COOKIE, shouldUseSecureCookie } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
