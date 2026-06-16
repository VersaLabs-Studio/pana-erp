// middleware.ts
// Obsidian ERP v4.0 — Auth edge guard (auth front-half).
//
// Presence-check only: if there is no `sid` cookie, a PAGE request is
// redirected to /login (remembering where it was headed). An already-
// authenticated visitor hitting /login is bounced to /dashboard.
//
// We deliberately do NOT validate the sid here (no network call belongs
// in middleware). Real validation stays fail-closed in
// `resolveUserContext` — a present-but-expired sid still reaches the app,
// where the API returns 401 and the user context resolves to null. API
// routes are EXCLUDED from the matcher: they enforce their own 401 (the
// CRUD factory) rather than being redirected to an HTML page.

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("sid")?.value);
  const isLogin = pathname === "/login";

  if (!hasSession && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Guard page routes only. Exclude the API surface (self-enforcing 401),
  // Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)).*)",
  ],
};
