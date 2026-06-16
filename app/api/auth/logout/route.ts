// app/api/auth/logout/route.ts
// Obsidian ERP v4.0 — Logout (auth front-half).
//
// Clears the first-party `sid` cookie and best-effort tells Frappe to
// invalidate the server session. After this, `middleware.ts` bounces the
// user to /login on the next navigation.

import { NextRequest, NextResponse } from "next/server";

function getErpBaseUrl(): string {
  return process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_API_URL || "";
}

export async function POST(request: NextRequest) {
  const sid = request.cookies.get("sid")?.value;
  const base = getErpBaseUrl();

  // Best-effort server-side logout — never block the UI on it.
  if (sid && base) {
    try {
      await fetch(`${base}/api/method/logout`, {
        method: "POST",
        headers: { Cookie: `sid=${sid}` },
        cache: "no-store",
      });
    } catch {
      // ignore — we clear the cookie below regardless
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("sid", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
