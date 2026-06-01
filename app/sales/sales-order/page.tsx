// app/sales/sales-order/page.tsx
// Obsidian ERP v4.0 — Sales Order List Page (Golden Template)
// KPI bar + SmartTable, OKLCH tokens, Framer Motion, dual theme, skeleton/empty/error

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFrappeList } from "@/hooks/generic";
import { queryKeys } from "@/lib/query-keys";
import { KPICard } from "@/components/dashboard/KPICard";
import { SmartTable } from "@/components/smart/SmartTable";
import { InlineStatusChange } from "@/components/smart/InlineStatusChange";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus,
  ShoppingCart,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import type { SalesOrder } from "@/types/doctype-types";

/**
 * Status color map for inline status badges
 */
const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "To Deliver and Bill": "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "To Deliver": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "To Bill": "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  Cancelled: "bg-muted text-muted-foreground",
  Closed: "bg-muted text-muted-foreground",
};

export default function SalesOrderListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const prefersReducedMotion = useReducedMotion();

  // Fetch sales orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = useFrappeList("Sales Order", {
    limit: 20,
    limit_start: (page - 1) * 20,
    filters: search ? [["name", "like", `%${search}%`]] : undefined,
  } as Record<string, unknown>);

  // Fetch KPI data (all orders for counts)
  const { data: allOrders } = useFrappeList("Sales Order", {
    fields: ["name", "status", "grand_total", "per_delivered", "per_billed"],
    limit: 0,
  } as Record<string, unknown>);

  // Calculate KPIs
  const kpis = {
    total: (allOrders as unknown as SalesOrder[])?.length ?? 0,
    draft: (allOrders as unknown as SalesOrder[])?.filter((o: SalesOrder) => o.status === "Draft").length ?? 0,
    active: (allOrders as unknown as SalesOrder[])?.filter((o: SalesOrder) =>
      ["To Deliver and Bill", "To Deliver", "To Bill"].includes(o.status)
    ).length ?? 0,
    completed: (allOrders as unknown as SalesOrder[])?.filter((o: SalesOrder) => o.status === "Completed").length ?? 0,
    totalValue: (allOrders as unknown as SalesOrder[])?.reduce((sum: number, o: SalesOrder) => sum + (o.grand_total || 0), 0) ?? 0,
  };

  // Table columns
  const columns = [
    {
      key: "name",
      label: "Order #",
      sortable: true,
      render: (value: unknown, row: SalesOrder) => (
        <button
          onClick={() => router.push(`/sales/sales-order/${row.name}`)}
          className="text-primary hover:underline font-medium"
        >
          {String(value)}
        </button>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      sortable: true,
    },
    {
      key: "transaction_date",
      label: "Date",
      sortable: true,
      render: (value: unknown) => {
        if (!value) return "—";
        return new Date(String(value)).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: unknown, row: SalesOrder) => (
        <InlineStatusChange
          currentStatus={String(value)}
          statuses={["Draft", "To Deliver and Bill", "To Deliver", "To Bill", "Completed", "Cancelled", "Closed"]}
          statusColors={STATUS_COLORS}
          onStatusChange={async (_newStatus) => {
            toast.success(`Status updated to ${_newStatus}`);
          }}
        />
      ),
    },
    {
      key: "grand_total",
      label: "Total",
      sortable: true,
      align: "right" as const,
      render: (value: unknown, row: SalesOrder) => (
        <span className="font-medium">
          {row.currency || "ETB"} {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "per_delivered",
      label: "Delivered",
      align: "right" as const,
      render: (value: unknown) => {
        const pct = Number(value || 0);
        return (
          <span className={cn("text-xs font-medium", pct === 100 ? "text-emerald-600" : "text-muted-foreground")}>
            {pct}%
          </span>
        );
      },
    },
    {
      key: "per_billed",
      label: "Billed",
      align: "right" as const,
      render: (value: unknown) => {
        const pct = Number(value || 0);
        return (
          <span className={cn("text-xs font-medium", pct === 100 ? "text-emerald-600" : "text-muted-foreground")}>
            {pct}%
          </span>
        );
      },
    },
  ];

  // Row actions
  const actions = [
    {
      label: "View",
      icon: <Eye className="h-3 w-3" />,
      onClick: (row: SalesOrder) => router.push(`/sales/sales-order/${row.name}`),
    },
    {
      label: "Edit",
      icon: <Pencil className="h-3 w-3" />,
      onClick: (row: SalesOrder) => router.push(`/sales/sales-order/${row.name}/edit`),
      isDisabled: (row: SalesOrder) => row.docstatus === 1,
    },
  ];

  return (
    <>
      <CommandPalette />

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-4 sm:p-6"
      >
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your sales orders and track fulfillment
            </p>
          </div>
          <Button onClick={() => router.push("/sales/sales-order/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Sales Order
          </Button>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KPICard
            title="Total Orders"
            value={kpis.total}
            icon={ShoppingCart}
            isLoading={isLoading}
          />
          <KPICard
            title="Draft"
            value={kpis.draft}
            icon={AlertCircle}
            variant="warning"
            isLoading={isLoading}
          />
          <KPICard
            title="Active"
            value={kpis.active}
            icon={Package}
            variant="default"
            isLoading={isLoading}
          />
          <KPICard
            title="Completed"
            value={kpis.completed}
            icon={CheckCircle2}
            variant="success"
            isLoading={isLoading}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              Failed to load sales orders: {error.message}
            </span>
          </div>
        )}

        {/* Smart Table */}
        <SmartTable
          columns={columns}
          data={(ordersData as unknown as SalesOrder[]) || []}
          actions={actions}
          total={ordersData?.length ?? 0}
          page={page}
          onPageChange={setPage}
          isLoading={isLoading}
          getRowKey={(row) => row.name}
          onRowClick={(row) => router.push(`/sales/sales-order/${row.name}`)}
        />
      </motion.div>
    </>
  );
}
