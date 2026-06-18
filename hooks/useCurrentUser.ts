// hooks/useCurrentUser.ts
// Obsidian ERP v4.0 — Current-user hook + role gating (2P Part 5).
//
// Client-side mirror of the server-side `resolveUserContext`. The
// hook calls `/api/auth/me` (which forwards the `sid` cookie to
// Frappe) and returns the user + roles. Components gate themselves
// via `<Can role="…">` or `hasRole(["Sales User", "Sales Manager"])`.
//
// SSR-safe: when `skip` is true (default in server components), the
// hook returns `{ user: null, isLoading: false }` instead of fetching.
// This keeps the layout guard from hitting Frappe on every server
// render.

"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserContext } from "@/lib/auth/resolve-user";

export function useCurrentUser(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const q = useQuery<UserContext | null, Error>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.status === 401) return null;
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          details?: string;
        };
        throw new Error(json?.details ?? `Failed to load user (${res.status})`);
      }
      const json = (await res.json()) as { success?: boolean; data?: UserContext };
      return json?.data ?? null;
    },
    enabled,
    // Short stale window + refetch-on-focus so a role change (or an admin
    // fixing permissions) reflects in the UI within ~30s / on tab refocus,
    // instead of being trapped behind a long cache. The call is cheap and
    // the server enforces RBAC regardless of what the UI believes.
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
  return {
    user: q.data ?? null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** Pure helper: does the user have any of the given roles? */
export function hasRole(
  user: UserContext | null,
  roles: string | string[],
): boolean {
  if (!user) return false;
  const list = Array.isArray(roles) ? roles : [roles];
  for (const r of list) if (user.roles.includes(r)) return true;
  return false;
}
