// app/sales/dashboard/page.tsx
// Obsidian ERP v4.0 — Sales Hub (master §4.1, 2N Part 2.2).
//
// 2N Part 2.2: rewritten on real data. The previous version used
// `text-emerald-500`/`text-rose-500` literal colors and `bg-${color}`
// dynamic Tailwind classes (which don't compile). This version uses the
// shared `ModuleHub` component + `useFrappeList` aggregates only.

"use client";

import {
  ShoppingCart,
  FileText,
  ClipboardList,
  Clock,
  TrendingUp,
  UserPlus,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useFrappeList } from "@/hooks/generic";
import {
  ModuleHub,
  type HubKpi,
  type HubAction,
  type HubRecentItem,
  type HubAlert,
} from "@/components/dashboard/ModuleHub";

export default function SalesDashboardPage() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // KPIs
  const { data: openQuotations = [] } = useFrappeList<{ name: string }>(
    "Quotation",
    {
      fields: ["name"],
      filters: [["status", "in", ["Open", "Draft"]]],
      limit: 1,
    },
  );
  const { data: allSalesOrders = [] } = useFrappeList<{ name: string }>(
    "Sales Order",
    { fields: ["name"], limit: 1 },
  );
  const { data: draftSalesOrders = [] } = useFrappeList<{ name: string }>(
    "Sales Order",
    {
      fields: ["name"],
      filters: [["docstatus", "=", 0]],
      limit: 1,
    },
  );
  const { data: monthQuotations = [] } = useFrappeList<{ name: string }>(
    "Quotation",
    {
      fields: ["name", "creation"],
      filters: [["creation", ">=", firstOfMonth]],
      limit: 1,
    },
  );

  // Recent (last 3 quotations + last 2 sales orders, deduped)
  const { data: recentQuotations = [] } = useFrappeList<{
    name: string;
    customer_name?: string;
    grand_total?: number;
    status: string;
    creation: string;
  }>("Quotation", {
    fields: ["name", "customer_name", "grand_total", "status", "creation"],
    orderBy: { field: "creation", order: "desc" },
    limit: 3,
  });
  const { data: recentSalesOrders = [] } = useFrappeList<{
    name: string;
    customer_name?: string;
    grand_total?: number;
    status: string;
    creation: string;
  }>("Sales Order", {
    fields: ["name", "customer_name", "grand_total", "status", "creation"],
    orderBy: { field: "creation", order: "desc" },
    limit: 2,
  });

  // Alerts
  const { data: draftSOAlerts = [] } = useFrappeList<{ name: string }>(
    "Sales Order",
    { fields: ["name"], filters: [["docstatus", "=", 0]], limit: 1 },
  );
  const { data: followupQuotes = [] } = useFrappeList<{ name: string }>(
    "Quotation",
    { fields: ["name"], filters: [["status", "=", "Open"]], limit: 1 },
  );

  const kpis: HubKpi[] = [
    {
      title: "Open Quotations",
      value: openQuotations.length,
      icon: FileText,
      variant: "default",
      href: "/sales/quotation",
    },
    {
      title: "Sales Orders",
      value: allSalesOrders.length,
      icon: ClipboardList,
      variant: "default",
      href: "/sales/sales-order",
    },
    {
      title: "Drafts needing submit",
      value: draftSalesOrders.length,
      icon: Clock,
      variant: "warning",
      href: "/sales/sales-order",
    },
    {
      title: "Quotations this month",
      value: monthQuotations.length,
      icon: TrendingUp,
      variant: "success",
      href: "/sales/quotation",
    },
  ];

  const actions: HubAction[] = [
    {
      label: "Quotations",
      description: "Proposals sent to customers.",
      icon: FileText,
      href: "/sales/quotation",
    },
    {
      label: "Sales Orders",
      description: "Confirmed customer orders.",
      icon: ClipboardList,
      href: "/sales/sales-order",
    },
    {
      label: "New Quotation",
      description: "Draft a new proposal.",
      icon: Plus,
      href: "/sales/quotation/new",
      primary: true,
    },
    {
      label: "New Customer",
      description: "Register a new account.",
      icon: UserPlus,
      href: "/crm/customer/new",
    },
  ];

  const recent: HubRecentItem[] = [
    ...recentQuotations.map((q) => ({
      name: q.name,
      subtitle: q.customer_name ?? "",
      badge: q.status,
      badgeVariant:
        q.status === "Open" || q.status === "Draft"
          ? ("secondary" as const)
          : ("outline" as const),
      href: `/sales/quotation/${encodeURIComponent(q.name)}`,
    })),
    ...recentSalesOrders.map((so) => ({
      name: so.name,
      subtitle: so.customer_name ?? "",
      badge: so.status,
      badgeVariant:
        so.status === "Draft"
          ? ("secondary" as const)
          : ("default" as const),
      href: `/sales/sales-order/${encodeURIComponent(so.name)}`,
    })),
  ].slice(0, 5);

  const alerts: HubAlert[] = [
    {
      label: "Drafts needing submit",
      count: draftSOAlerts.length,
      href: "/sales/sales-order",
      variant: "warning",
    },
    {
      label: "Quotations needing follow-up",
      count: followupQuotes.length,
      href: "/sales/quotation",
      variant: "info",
    },
  ];

  return (
    <ModuleHub
      title="Sales Hub"
      subtitle="Quotations, orders, and fulfillment."
      icon={ShoppingCart}
      primaryAction={{ label: "New Quotation", href: "/sales/quotation/new" }}
      kpis={kpis}
      actions={actions}
      recent={recent}
      recentTitle="Recent quotations & orders"
      alerts={alerts}
    />
  );
}
