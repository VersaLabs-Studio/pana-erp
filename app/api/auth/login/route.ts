// app/api/auth/login/route.ts
// Obsidian ERP v4.0 — Login (auth front-half).
//
// The app's RBAC enforcement (lib/api-factory.ts + lib/auth/resolve-user.ts)
// forwards a Frappe `sid` session cookie to ERPNext so its native DocPerm
// engine runs for the requesting user. THIS route is how that `sid` is
// obtained from inside Obsidian — without it there was no way to log in
// short of visiting the raw Frappe desk.
//
// Design — SERVER-SIDE PROXY (first-party cookie):
//   1. POST { usr, pwd } from the branded /login page.
//   2. Server-to-server POST to Frappe `/api/method/login`.
//   3. On success, Frappe replies with `Set-Cookie: sid=…` scoped to ITS
//      domain. We extract that sid value and re-issue it as a FIRST-PARTY,
//      httpOnly cookie on the Obsidian response.
//   4. Every later request carries our first-party `sid`;
//      `resolveUserContext` reads it and forwards it to Frappe.
//
// Why proxy instead of letting the browser hit Frappe directly:
//   - The sid becomes first-party to the Obsidian origin, so RBAC no
//     longer depends on Obsidian and Frappe sharing an origin / cookie
//     domain (the fragile assumption in the §0 pre-flight).
//   - The password never lands in client state; httpOnly means page JS
//     can't read the session id.

import { NextRequest, NextResponse } from "next/server";

function getErpBaseUrl(): string {
  return process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_API_URL || "";
}

/** Pull the real `sid` out of Frappe's Set-Cookie header(s). */
function extractSid(res: Response): string | null {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const cookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie") as string]
        : [];
  for (const c of cookies) {
    const m = c.match(/(?:^|;\s*)sid=([^;]+)/);
    // Frappe sets `sid=Guest` pre-auth; only a real sid means success.
    if (m && m[1] && m[1] !== "Guest") return decodeURIComponent(m[1]);
  }
  return null;
}

interface LoginBody {
  usr?: string;
  pwd?: string;
}

export async function POST(request: NextRequest) {
  const base = getErpBaseUrl();
  if (!base) {
    return NextResponse.json(
      {
        success: false,
        error: "Server misconfigured",
        details: "ERP URL is not set.",
        statusCode: 500,
      },
      { status: 500 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request",
        details: "Malformed request body.",
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  const usr = body.usr?.trim();
  const pwd = body.pwd;
  if (!usr || !pwd) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing credentials",
        details: "Email and password are required.",
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  let frappeRes: Response;
  try {
    frappeRes = await fetch(`${base}/api/method/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ usr, pwd }),
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Connection failed",
        details: "Couldn't reach the ERP server. Please try again.",
        statusCode: 502,
      },
      { status: 502 },
    );
  }

  // Frappe returns 401 on bad credentials; 200 + Set-Cookie on success.
  if (!frappeRes.ok) {
    let detail = "Invalid email or password.";
    try {
      const j = (await frappeRes.json()) as { message?: string };
      // Surface only safe, user-meaningful messages (disabled account,
      // too many attempts) — never raw internals.
      if (
        j?.message &&
        /password|credential|disabled|not allowed|too many|locked/i.test(j.message)
      ) {
        detail = j.message;
      }
    } catch {
      /* keep the generic message */
    }
    return NextResponse.json(
      { success: false, error: "Login failed", details: detail, statusCode: 401 },
      { status: 401 },
    );
  }

  const sid = extractSid(frappeRes);
  if (!sid) {
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        details:
          "The server accepted the login but issued no session. Check that cookies aren't being stripped between Obsidian and ERPNext.",
        statusCode: 502,
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ success: true, data: { user: usr } });
  response.cookies.set("sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // 7-day ceiling; if Frappe expires the server session sooner,
    // `resolveUserContext` fails closed and the user is bounced to /login.
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
