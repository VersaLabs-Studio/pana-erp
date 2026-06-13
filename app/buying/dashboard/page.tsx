// app/buying/dashboard/page.tsx
// Obsidian ERP v4.0 — Buying Hub (master §4.1, 2N Part 2.2).

"use client";

import {
  ShoppingCart,
  Building2,
  ClipboardList,
  FileText,
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

export default function BuyingDashboardPage() {
  // KPIs
  const { data: suppliers = [] } = useFrappeList<{ name: string }>(
    "Supplier",
    { fields: ["name"], limit: 1 },
  );
  const { data: openPOs = [] } = useFrappeList<{ name: string }>(
    "Purchase Order",
    {
      fields: ["name"],
      filters: [["docstatus", "=", 0]],
      limit: 1,
    },
  );
  const { data: submittedPOs = [] } = useFrappeList<{ name: string }>(
    "Purchase Order",
    {
      fields: ["name"],
      filters: [["docstatus", "=", 1]],
      limit: 1,
    },
  );
  const { data: draftPIs = [] } = useFrappeList<{ name: string }>(
    "Purchase Invoice",
    {
      fields: ["name"],
      filters: [["docstatus", "=", 0]],
      limit: 1,
    },
  );

  // Recent
  const { data: recentPOs = [] } = useFrappeList<{
    name: string;
    supplier_name?: string;
    grand_total?: number;
    status: string;
    creation: string;
  }>("Purchase Order", {
    fields: ["name", "supplier_name", "grand_total", "status", "creation"],
    orderBy: { field: "creation", order: "desc" },
    limit: 5,
  });

  const kpis: HubKpi[] = [
    {
      title: "Suppliers",
      value: suppliers.length,
      icon: Building2,
      variant: "default",
      href: "/buying/supplier",
    },
    {
      title: "Open POs",
      value: openPOs.length,
      icon: ClipboardList,
      variant: "warning",
      href: "/buying/purchase-order",
    },
    {
      title: "Submitted POs",
      value: submittedPOs.length,
      icon: ShoppingCart,
      variant: "success",
      href: "/buying/purchase-order",
    },
    {
      title: "Draft Purchase Invoices",
      value: draftPIs.length,
      icon: FileText,
      variant: "warning",
      href: "/accounting/purchase-invoice",
    },
  ];

  const actions: HubAction[] = [
    {
      label: "Suppliers",
      description: "Vendors and partners.",
      icon: Building2,
      href: "/buying/supplier",
    },
    {
      label: "Purchase Orders",
      description: "Confirmed orders to suppliers.",
      icon: ClipboardList,
      href: "/buying/purchase-order",
    },
    {
      label: "Purchase Invoices",
      description: "Supplier bills.",
      icon: FileText,
      href: "/accounting/purchase-invoice",
    },
    {
      label: "New PO",
      description: "Create a purchase order.",
      icon: Plus,
      href: "/buying/purchase-order/new",
      primary: true,
    },
  ];

  const recent: HubRecentItem[] = recentPOs.slice(0, 5).map((po) => ({
    name: po.name,
    subtitle: po.supplier_name ?? "",
    badge: po.status,
    badgeVariant:
      po.status === "Draft"
        ? ("secondary" as const)
        : ("default" as const),
    href: `/buying/purchase-order/${encodeURIComponent(po.name)}`,
  }));

  const alerts: HubAlert[] = [
    {
      label: "Draft POs",
      count: openPOs.length,
      href: "/buying/purchase-order",
      variant: "warning",
    },
    {
      label: "Draft Purchase Invoices",
      count: draftPIs.length,
      href: "/accounting/purchase-invoice",
      variant: "warning",
    },
  ];

  return (
    <ModuleHub
      title="Buying Hub"
      subtitle="Suppliers, POs, and procurement."
      icon={ShoppingCart}
      primaryAction={{ label: "New PO", href: "/buying/purchase-order/new" }}
      kpis={kpis}
      actions={actions}
      recent={recent}
      recentTitle="Recent purchase orders"
      alerts={alerts}
    />
  );
}
