// app/api/manufacturing/work-order/[name]/make-stock-entry/route.ts
// Obsidian ERP v4.0 — Work Order → Stock Entry, the DESK-BUTTON way (2P live-fix).
//
// WHY THIS ROUTE EXISTS (the "WO never starts" bug):
//   The Start/Finish modals previously HAND-BUILT the Material Transfer /
//   Manufacture Stock Entry payload and submitted it via the generic CRUD
//   factory. That moved stock (per-item `transferred_qty` updated) but left
//   the Work Order on "Not Started" — because ERPNext only advances the WO
//   header (`material_transferred_for_manufacturing` → status "In Process")
//   when the submitted SE carries the FULL manufacturing linkage that
//   `on_submit → update_work_order_qty()` credits back to the BOM:
//   `fg_completed_qty > 0`, `from_bom`, `bom_no`, `use_multi_level_bom`, and
//   item rows tied to the WO's required materials. Re-deriving those private
//   invariants by hand is the loop we were stuck in.
//
//   This route stops guessing. It calls ERPNext's OWN server method
//   `...work_order.make_stock_entry(work_order_id, purpose, qty)` — the exact
//   function the ERPNext desk "Start"/"Finish" buttons invoke. That returns a
//   fully-formed SE dict (every field ERPNext expects), which we then insert +
//   submit in one shot via `frappe.client.submit`. Because ERPNext built the
//   doc, no linkage field can be missing, so the WO advances every time.
//
// RBAC (consistent with the rest of 2P-FINAL): both calls go through the
// per-request, sid-forwarded `getRequestClient(request)`. ERPNext runs its
// native DocPerm engine for the requesting user — they need create+submit on
// Stock Entry (the manufacturing roles do). Fail closed (401) with no session.
//
// Body: { purpose: "Material Transfer for Manufacture" | "Manufacture", qty?: number }
//   - "Material Transfer for Manufacture"  → Start production (move RM → WIP)
//   - "Manufacture"                        → Finish production (declare FG)
// Returns: { success, data: { name } } — the submitted Stock Entry name.

import { NextRequest, NextResponse } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { getRequestClient } from "@/lib/auth/resolve-user";

const MAKE_STOCK_ENTRY =
  "erpnext.manufacturing.doctype.work_order.work_order.make_stock_entry";

const ALLOWED_PURPOSES = new Set([
  "Material Transfer for Manufacture",
  "Manufacture",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  // Per-request, user-scoped client — fail closed (401) with no session.
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

  try {
    const { name } = await params;
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Parameter",
          details: "Work Order name is required.",
          statusCode: 400,
        },
        { status: 400 },
      );
    }
    const workOrderId = decodeURIComponent(name);

    const body = (await request.json().catch(() => ({}))) as {
      purpose?: string;
      qty?: number;
    };
    const purpose = body.purpose ?? "Material Transfer for Manufacture";
    if (!ALLOWED_PURPOSES.has(purpose)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid purpose",
          details: `purpose must be one of: ${[...ALLOWED_PURPOSES].join(", ")}`,
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    // 1) Ask ERPNext to BUILD the Stock Entry — the same call the desk
    //    Start/Finish buttons make. `qty` is the fg_completed_qty (the qty to
    //    transfer/manufacture); when omitted ERPNext defaults to the WO's
    //    remaining qty. The returned dict is unsaved and fully linked.
    const args: Record<string, unknown> = {
      work_order_id: workOrderId,
      purpose,
    };
    if (typeof body.qty === "number" && body.qty > 0) {
      args.qty = body.qty;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const built: any = await (client.call as any).get(MAKE_STOCK_ENTRY, args);
    const seDoc = built?.message ?? built;
    if (!seDoc || typeof seDoc !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Empty draft from ERPNext",
          details: `make_stock_entry returned no document for '${workOrderId}'.`,
          statusCode: 502,
        },
        { status: 502 },
      );
    }

    // 2) Insert + submit the fully-formed doc in one server call. ERPNext's
    //    `frappe.client.submit` parses the doc, `get_doc()`s it, and submits —
    //    inserting first because it's new. on_submit then runs
    //    `update_work_order_qty()` with the proper linkage, so the WO flips to
    //    "In Process" (transfer) / "Completed" (manufacture).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submitted: any = await (client.call as any).post("frappe.client.submit", {
      doc: JSON.stringify(seDoc),
    });
    const result = submitted?.message ?? submitted;
    const seName: string | undefined = result?.name;

    return NextResponse.json(
      {
        success: true,
        data: { name: seName ?? null, purpose },
        message:
          purpose === "Manufacture"
            ? "Production finished — finished goods declared."
            : "Production started — materials transferred to WIP.",
      },
      { status: 201 },
    );
  } catch (error) {
    const err = frappeClient.handleError(error);
    return NextResponse.json(err, { status: err.statusCode ?? 500 });
  }
}
