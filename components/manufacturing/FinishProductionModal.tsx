// components/manufacturing/FinishProductionModal.tsx
// Obsidian ERP v4.0 — One-click "Finish Production" modal (2O Part 5.3).
//
// Replaces the prior WO detail page's "Finish" button which deep-linked
// into a prefilled SE wizard. The new flow:
//   1. The user clicks "Finish Production" on a started WO (status =
//      "In Process").
//   2. A single modal opens showing a CONCISE summary of the
//      Manufacture Stock Entry that will be created — the produced FG
//      (qty + warehouse) and the consumed materials (auto-computed from
//      `wo.required_items`).
//   3. On confirm:
//        a. Idempotency check — if a Manufacture SE for this WO
//           already exists, the modal shows a "View existing SE" link
//           instead of a Create button (B3 idempotency).
//        b. Otherwise, the modal creates + submits the Stock Entry
//           (`purpose=Manufacture`) and on success, navigates to the
//           new SE detail.
//   4. Always show what was done (the summary at the top), always
//      leave an undo path (the new SE is cancel-able from its detail
//      page).

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
  X,
  ArrowRight,
  Plus,
  Factory,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFrappeDelete, useFrappeList } from "@/hooks/generic";
import { resolveFrappeError } from "@/lib/errors/frappe-error-resolver";
import { GuidedErrorDialog, useGuidedError } from "@/components/errors/GuidedErrorDialog";
import { resolveCompanyWarehouses } from "@/lib/settings/warehouses";
import type { WORequiredItem } from "./StartProductionModal";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export interface FinishProductionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderName: string;
  workOrderQty: number;
  producedQty: number;
  /** How many of the workOrderQty should the user be able to declare
   *  finished in this Manufacture entry. Defaults to (workOrderQty -
   *  producedQty). */
  remainingQty?: number;
  productionItem: string;
  wipWarehouse?: string;
  fgWarehouse?: string;
  requiredItems: WORequiredItem[];
  /** Called after a successful manufacture so the parent (WO page) can
   *  refetch and reflect "Completed". When provided, the modal stays on the
   *  Work Order instead of redirecting to the SE. */
  onCompleted?: () => void;
}

export function FinishProductionModal({
  open,
  onOpenChange,
  workOrderName,
  workOrderQty,
  producedQty,
  remainingQty,
  productionItem,
  wipWarehouse,
  fgWarehouse,
  requiredItems,
  onCompleted,
}: FinishProductionModalProps) {
  const router = useRouter();
  const { resolution, showError, dismiss } = useGuidedError();
  const [isCreating, setIsCreating] = useState(false);

  // 2P Part 2.5 — implicit-warehouse resolution. If the WO's
  // wip_warehouse / fg_warehouse are blank, fall back to the active
  // company's canonical WIP / FG (via lib/settings/warehouses.ts).
  const [implicitWarehouses, setImplicitWarehouses] = useState<{
    stores: string;
    wip: string;
    fg: string;
  } | null>(null);
  useEffect(() => {
    if (!open) return;
    if (wipWarehouse && fgWarehouse) {
      setImplicitWarehouses(null);
      return;
    }
    resolveCompanyWarehouses()
      .then((w) => setImplicitWarehouses({ stores: w.stores, wip: w.wip, fg: w.fg }))
      .catch(() => setImplicitWarehouses(null));
  }, [open, wipWarehouse, fgWarehouse]);

  // 2O Part 5.3 — idempotency, now SELF-HEALING (2P live-fix). Surface any
  // existing Manufacture SE *with its docstatus* so confirm can resolve
  // rather than block: submitted → done (continue); draft → submit it.
  const { data: existingSEs = [], refetch: refetchExisting } = useFrappeList<{
    name: string;
    docstatus: number;
  }>(
    "Stock Entry",
    {
      fields: ["name", "docstatus"],
      filters: [
        ["work_order", "=", workOrderName],
        ["purpose", "=", "Manufacture"],
        ["docstatus", "!=", 2],
      ],
      orderBy: { field: "docstatus", order: "desc" },
      limit: 1,
    },
    { enabled: open && !!workOrderName },
  );
  const existingSE = existingSEs.length > 0 ? existingSEs[0] : null;
  const existingSubmitted = existingSE?.docstatus === 1;

  // 2P Part 2.5 — second idempotency guard: if the WO is already
  // "Completed" we block a second Manufacture. Show "View output"
  // instead. ERPNext's WO status is the canonical signal.
  const { data: woStatus = [] } = useFrappeList<{ name: string; status: string }>(
    "Work Order",
    {
      fields: ["status"],
      filters: [["name", "=", workOrderName]],
      limit: 1,
    },
    { enabled: open && !!workOrderName },
  );
  const woCompleted = woStatus[0]?.status === "Completed";

  const wipWh = wipWarehouse || implicitWarehouses?.wip || "";
  const fgWh = fgWarehouse || implicitWarehouses?.fg || "";

  // qty to declare as produced in THIS entry
  const declareQty = useMemo(() => {
    if (typeof remainingQty === "number") return Math.max(0, remainingQty);
    return Math.max(0, (Number(workOrderQty) || 0) - (Number(producedQty) || 0));
  }, [remainingQty, workOrderQty, producedQty]);

  // Materials consumed — sum required minus transferred (consumed stays
  // as required for the "expected" view; ERPNext computes the actual
  // transfer from the WO's required_items × declared fg qty).
  const consumedRows = useMemo(() => {
    return requiredItems.map((it) => {
      const required = Number(it.required_qty) || 0;
      const transferred = Number(it.transferred_qty) || 0;
      return {
        item_code: it.item_code,
        item_name: it.item_name,
        qty: required,
        onHand: transferred,
      };
    });
  }, [requiredItems]);

  // -- Mutations -----------------------------------------------------------
  // Like Start, Finish no longer HAND-BUILDS the Manufacture Stock Entry —
  // ERPNext's own `make_stock_entry(work_order, "Manufacture", qty)` builds
  // and submits it server-side so the WO actually completes. The delete
  // mutation only cleans up a leftover DRAFT before the canonical run.
  const deleteMutation = useFrappeDelete("Stock Entry", { showToast: false });

  const finish = (name: string, message: string) => {
    toast.success(
      message,
      name
        ? {
            action: {
              label: "View entry",
              onClick: () =>
                router.push(`/stock/stock-entry/${encodeURIComponent(name)}`),
            },
          }
        : undefined,
    );
    onOpenChange(false);
    if (onCompleted) {
      onCompleted();
    } else if (name) {
      router.push(`/stock/stock-entry/${encodeURIComponent(name)}`);
    }
  };

  // The DEFINITIVE manufacture: POST to the server route that calls ERPNext's
  // `make_stock_entry(work_order, "Manufacture", qty)` and submits the result.
  // ERPNext builds the FG + consumption rows from the BOM, so the WO completes.
  const runCanonicalManufacture = async (): Promise<string> => {
    const res = await fetch(
      `/api/manufacturing/work-order/${encodeURIComponent(
        workOrderName,
      )}/make-stock-entry`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "Manufacture", qty: declareQty }),
      },
    );
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(
        (json?.details as string) ||
          (json?.error as string) ||
          "Couldn't finish production. Please try again.",
      );
    }
    return (json.data?.name as string) ?? "";
  };

  const handleConfirm = async () => {
    setIsCreating(true);
    try {
      // 0) WO already Completed → nothing to do; hand back to the WO page.
      if (woCompleted) {
        finish(
          existingSE?.name ?? "",
          `Production already finished for ${workOrderName}`,
        );
        return;
      }

      // 1) Already-submitted Manufacture → done.
      if (existingSE && existingSubmitted) {
        finish(existingSE.name, `Production already finished for ${workOrderName}`);
        return;
      }

      // 2) Leftover DRAFT (from the old hand-built path) → delete it so the
      //    canonical manufacture is the only declaring entry.
      if (existingSE && !existingSubmitted) {
        await deleteMutation.mutateAsync(existingSE.name);
      }

      if (declareQty <= 0) return; // nothing left to declare

      // 3) Canonical path — ERPNext builds + submits the Manufacture SE; the
      //    WO completes.
      const seName = await runCanonicalManufacture();
      finish(seName, `Manufactured ${declareQty} × ${productionItem}`);
    } catch (err) {
      refetchExisting();
      showError(resolveFrappeError(err, { doctype: "Stock Entry" }));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl border border-border/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Factory className="h-4 w-4" />
            </span>
            Finish production for {workOrderName}
          </DialogTitle>
          <DialogDescription>
            One-click manufacture. Review the produced / consumed summary,
            then confirm to create and submit the Stock Entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {existingSE && (
            <div
              className={cn(
                "rounded-xl border px-3 py-2 text-xs",
                existingSubmitted
                  ? "border-success/30 bg-success/5 text-success"
                  : "border-info/30 bg-info/5 text-info",
              )}
            >
              {existingSubmitted ? (
                <>
                  <strong>Production already finished.</strong>{" "}
                  <a
                    href={`/stock/stock-entry/${encodeURIComponent(existingSE.name)}`}
                    className="underline"
                  >
                    View {existingSE.name}
                  </a>
                  . Continue to close out the job.
                </>
              ) : (
                <>
                  <strong>A draft manufacture entry exists</strong> (
                  <a
                    href={`/stock/stock-entry/${encodeURIComponent(existingSE.name)}`}
                    className="underline"
                  >
                    {existingSE.name}
                  </a>
                  ). We&apos;ll replace it with a correct manufacture so the
                  job completes.
                </>
              )}
            </div>
          )}

          {/* 2P Part 2.5 — "already finished" guard (idempotency on the
              WO status). The WO is Completed → no second Manufacture. */}
          {woCompleted && !existingSE && (
            <div className="rounded-xl border border-info/30 bg-info/5 px-3 py-2 text-xs text-info">
              <strong>This job is already marked Completed.</strong> Opening a
              second Manufacture is not allowed. View the Work Order output
              from the Jobs board.
            </div>
          )}

          {/* Produced summary */}
          <div className="rounded-xl border border-border/40 bg-secondary/20 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Will be produced
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {productionItem}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Target: <span className="font-mono">{fgWh || "—"}</span>
                </p>
              </div>
              <p className="text-2xl font-bold tabular-nums text-primary">
                {declareQty}
              </p>
            </div>
          </div>

          {/* Consumed materials */}
          <div className="rounded-xl border border-border/40">
            <div className="border-b border-border/40 bg-secondary/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Will be consumed (WIP → free)
            </div>
            <ul className="divide-y divide-border/40">
              {consumedRows.length === 0 ? (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  No required items on this Work Order.
                </li>
              ) : (
                consumedRows.map((c) => (
                  <li
                    key={c.item_code}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {c.item_name || c.item_code}
                      </p>
                      <p className="truncate text-[10px] font-mono text-muted-foreground">
                        {c.item_code}
                      </p>
                    </div>
                    <p className="text-right text-xs font-bold tabular-nums text-foreground">
                      {c.qty}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={handleConfirm}
              disabled={
                isCreating ||
                // A fresh manufacture needs a positive qty to declare.
                // Warehouses are resolved server-side by make_stock_entry.
                (!existingSE && declareQty <= 0)
              }
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {existingSE ? "Resolving…" : "Creating…"}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  {existingSubmitted || woCompleted
                    ? "Continue"
                    : existingSE
                      ? "Re-run & finish"
                      : "Finish production"}
                </>
              )}
            </Button>
          </div>
        </div>

        <GuidedErrorDialog resolution={resolution} onDismiss={dismiss} />
      </DialogContent>
    </Dialog>
  );
}
