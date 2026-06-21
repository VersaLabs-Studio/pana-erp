// app/api/flows/resolve/route.ts
// Obsidian ERP v4.0 — Server-side flow-graph resolver (2R Part 1, P0
// headline).
//
// Collapses the 16-slot client-side cascade (8 primary + 8 secondary
// `useFrappeList` calls per detail page) into ONE server-side BFS over
// the registered link map. The response is the full `{ stage: name |
// null }` map for the anchor's flow.
//
// Per-request user-scoped Frappe client (`getRequestClient`) so ERPNext's
// DocPerms still apply. A user without READ on the anchor gets 401/403
// from Frappe and we surface it as a guided error.

import { NextRequest, NextResponse } from "next/server";
import { getRequestClient } from "@/lib/auth/resolve-user";
import { frappeClient } from "@/lib/frappe-client";
import {
  resolveFlowGraph,
  createBatchedGetDoc,
  type ListDoc,
  type ResolvedFlowChainResult,
} from "@/lib/flows/flow-graph";
import { getFlowForDocType } from "@/lib/flows/flow-chain-resolver";

// ---------------------------------------------------------------------------
// Server-side I/O adapters
// ---------------------------------------------------------------------------

/**
 * Server `getDoc`: `frappe.client.get(doctype, name)` returns the full
 * document. The BFS uses this to read header fields + child tables.
 */
async function serverGetDoc(
  client: ReturnType<typeof getRequestClient>,
  doctype: string,
  name: string,
): Promise<Record<string, unknown> | null> {
  if (!client) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await (client.call as any).get("frappe.client.get", {
    doctype,
    name,
  });
  const doc = Array.isArray(raw) ? raw[0] : raw?.message ?? raw;
  return doc && typeof doc === "object" ? (doc as Record<string, unknown>) : null;
}

/**
 * Server `listDoc`: build the Frappe `/api/method/frappe.client.get_list`
 * call. The BFS uses this for back-link filters and verify-existence
 * filters.
 */
async function serverListDoc(
  client: ReturnType<typeof getRequestClient>,
  doctype: string,
  filters: ReadonlyArray<unknown>,
  fields: string[],
  limit: number,
): Promise<Array<{ name: string; parent?: string }>> {
  if (!client) return [];
  const params: Record<string, unknown> = {
    doctype,
    fields: ["name", ...fields.filter((f) => f !== "name")],
    limit_page_length: Math.max(1, Math.min(limit, 1)),
  };
  if (filters && filters.length > 0) {
    params.filters = filters;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await (client.call as any).get(
    "frappe.client.get_list",
    params,
  );
  const rows = Array.isArray(raw) ? raw : raw?.message ?? [];
  if (!Array.isArray(rows)) return [];
  return rows.map((r: { name: string; parent?: string }) => ({
    name: r.name,
    parent: r.parent,
  }));
}

// ---------------------------------------------------------------------------
// GET /api/flows/resolve?doctype=&name=
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // 2P-FINAL A.3 — user-scoped client. ERPNext runs its DocPerm check on
  // every get_doc + get_list; fail closed (401) when no session.
  const client = getRequestClient(request);
  if (!client) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        details: "No valid session.",
        statusCode: 401,
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const doctype = searchParams.get("doctype");
  const name = searchParams.get("name");

  if (!doctype || !name) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required query params",
        details: "Provide ?doctype=<X>&name=<Y>.",
        statusCode: 400,
      },
      { status: 400 },
    );
  }

  // Confirm the anchor is part of a registered flow. If not, we still
  // walk the graph but the response carries an empty `stages` array.
  const flow = getFlowForDocType(doctype);

  try {
    // Wrap the raw server fetches in a dedupe-aware batched getDoc. The
    // BFS asks for many overlapping docs (the same neighbour is
    // reachable via two edges), so a raw implementation would refetch
    // the same doc N times.
    const rawGet = (d: string, n: string) => serverGetDoc(client, d, n);
    const getDoc = createBatchedGetDoc(rawGet);
    const listDoc: ListDoc = (d, f, fields, limit) =>
      serverListDoc(client, d, f, fields, limit);

    const result: ResolvedFlowChainResult = await resolveFlowGraph(
      doctype,
      name,
      getDoc,
      listDoc,
    );

    return NextResponse.json({
      success: true,
      data: {
        doctype,
        name,
        flowId: flow?.id ?? null,
        stages: result.stages,
        map: result.map,
      },
    });
  } catch (error) {
    const err = frappeClient.handleError(error);
    return NextResponse.json(err, { status: err.statusCode ?? 500 });
  }
}