// app/sales/sales-order/[name]/page.tsx
// Obsidian ERP v4.0 — Sales Order Detail Page (Golden Template)
// FlowTracker + WhatsNext + ActivityTimeline, OKLCH tokens, Framer Motion

"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFrappeDoc } from "@/hooks/generic";
import { queryKeys } from "@/lib/query-keys";
import { resolveFlowChain } from "@/lib/flows/flow-chain-resolver";
import { FlowTracker } from "@/components/flows/FlowTracker";
import { WhatsNext } from "@/components/smart/WhatsNext";
import { ActivityTimeline } from "@/components/smart/ActivityTimeline";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Printer,
  Send,
  Ban,
  CheckCircle2,
  Package,
  Truck,
  Receipt,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { SalesOrder } from "@/types/doctype-types";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "To Deliver and Bill": "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "To Deliver": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "To Bill": "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  Cancelled: "bg-muted text-muted-foreground",
  Closed: "bg-muted text-muted-foreground",
};

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = params.name as string;
  const prefersReducedMotion = useReducedMotion();

  // Fetch document
  const {
    data: order,
    isLoading,
    error,
  } = useFrappeDoc<SalesOrder>("Sales Order", name);

  // Build flow chain result
  const flowResult = useMemo(() => {
    if (!order) return null;
    const so = order as unknown as SalesOrder;
    return resolveFlowChain("Sales Order", name, {
      Lead: { status: "completed" },
      Opportunity: { status: "completed" },
      Quotation: { status: "completed" },
      "Sales Order": { status: "current", documentName: name },
      "Delivery Note": { status: (so.per_delivered ?? 0) === 100 ? "completed" : "pending" },
      "Sales Invoice": { status: (so.per_billed ?? 0) === 100 ? "completed" : "pending" },
      "Payment Entry": { status: "pending" },
    });
  }, [order, name]);

  // What's Next actions
  const whatsNextActions = useMemo(() => {
    if (!order) return [];
    const so = order as unknown as SalesOrder;
    const actions = [];

    if (so.docstatus === 0) {
      actions.push({
        label: "Submit Order",
        description: "Submit this order for processing",
        onClick: async () => {
          toast.success("Order submitted");
        },
        isPrimary: true,
      });
    }

    if (so.docstatus === 1 && (so.per_delivered ?? 0) < 100) {
      actions.push({
        label: "Create Delivery Note",
        description: "Ship items to customer",
        onClick: () => toast.info("Creating delivery note..."),
      });
    }

    if (so.docstatus === 1 && (so.per_billed ?? 0) < 100) {
      actions.push({
        label: "Create Sales Invoice",
        description: "Generate invoice for this order",
        onClick: () => toast.info("Creating invoice..."),
      });
    }

    if (so.docstatus === 1) {
      actions.push({
        label: "Create Work Order",
        description: "Start manufacturing for this order",
        onClick: () => toast.info("Creating work order..."),
      });
    }

    return actions;
  }, [order]);

  // Mock activity data
  const activityItems = useMemo(() => {
    if (!order) return [];
    const so = order as unknown as Record<string, unknown>;
    return [
      {
        id: "1",
        type: "created" as const,
        description: `Sales Order ${name} created`,
        user: String(so.owner || "Administrator"),
        timestamp: String(so.creation || new Date().toISOString()),
      },
      ...((so.docstatus as number) === 1
        ? [
            {
              id: "2",
              type: "submitted" as const,
              description: "Order submitted for processing",
              user: String(so.modified_by || "Administrator"),
              timestamp: String(so.modified || new Date().toISOString()),
            },
          ]
        : []),
    ];
  }, [order, name]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Order not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error?.message || `Sales Order "${name}" does not exist`}
        </p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/sales/sales-order")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sales Orders
        </Button>
      </div>
    );
  }

  // Cast order to SalesOrder for rendering
  const so = order as unknown as SalesOrder;

  return (
    <>
      <CommandPalette />

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/sales/sales-order")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{name}</h1>
                <Badge
                  className={cn(
                    "text-xs",
                    STATUS_COLORS[so.status] || "bg-muted text-muted-foreground"
                  )}
                >
                  {so.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {so.customer_name || so.customer} · {so.transaction_date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {so.docstatus === 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/sales/sales-order/${name}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => toast.success("Order submitted")}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Flow Tracker */}
        {flowResult && (
          <FlowTracker
            result={flowResult}
            compact={false}
            onCreateAction={(stageId, action) => {
              toast.info(`Creating from stage: ${stageId}, action: ${action}`);
            }}
          />
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order details */}
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">Order Details</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-muted-foreground">Customer</span>
                  <p className="text-sm font-medium text-foreground">
                    {so.customer_name || so.customer}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Transaction Date</span>
                  <p className="text-sm font-medium text-foreground">{so.transaction_date}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Delivery Date</span>
                  <p className="text-sm font-medium text-foreground">{so.delivery_date || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Currency</span>
                  <p className="text-sm font-medium text-foreground">{so.currency || "ETB"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Grand Total</span>
                  <p className="text-lg font-bold text-foreground">
                    {so.currency || "ETB"} {Number(so.grand_total || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Status</span>
                  <p className="text-sm font-medium text-foreground">{so.status}</p>
                </div>
              </div>
            </div>

            {/* Items table */}
            {so.items && so.items.length > 0 && (
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b">
                  <h3 className="text-base font-semibold text-foreground">Items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Item</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((so.items || []) as Record<string, unknown>[]).map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{String(item.item_code || "")}</p>
                            {String(item.item_name || "") && (
                              <p className="text-xs text-muted-foreground">{String(item.item_name || "")}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">{String(item.qty || "")}</td>
                          <td className="px-4 py-3 text-right text-sm">{Number(item.rate || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {Number(item.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* What's Next */}
            <WhatsNext actions={whatsNextActions} />

            {/* Activity Timeline */}
            <ActivityTimeline items={activityItems} />
          </div>
        </div>
      </motion.div>
    </>
  );
}
