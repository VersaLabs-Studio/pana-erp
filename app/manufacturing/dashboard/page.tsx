// app/manufacturing/dashboard/page.tsx
// Obsidian ERP v4.0 — Manufacturing Hub (master §4.1, 2N Part 2.2).

"use client";

import {
  Factory,
  ClipboardList,
  PlayCircle,
  Layers,
  Cpu,
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

export default function ManufacturingDashboardPage() {
  // KPIs
  const { data: workOrders = [] } = useFrappeList<{ name: string }>(
    "Work Order",
    { fields: ["name"], limit: 1 },
  );
  const { data: woInProcess = [] } = useFrappeList<{ name: string }>(
    "Work Order",
    {
      fields: ["name"],
      filters: [["status", "=", "In Process"]],
      limit: 1,
    },
  );
  const { data: activeBOMs = [] } = useFrappeList<{ name: string }>("BOM", {
    fields: ["name"],
    filters: [["is_active", "=", 1]],
    limit: 1,
  });
  const { data: workstations = [] } = useFrappeList<{ name: string }>(
    "Workstation",
    { fields: ["name"], limit: 1 },
  );

  // Recent
  const { data: recentWOs = [] } = useFrappeList<{
    name: string;
    production_item?: string;
    status: string;
    creation: string;
  }>("Work Order", {
    fields: ["name", "production_item", "status", "creation"],
    orderBy: { field: "creation", order: "desc" },
    limit: 5,
  });

  // Alerts
  const { data: draftWOs = [] } = useFrappeList<{ name: string }>(
    "Work Order",
    { fields: ["name"], filters: [["docstatus", "=", 0]], limit: 1 },
  );

  const kpis: HubKpi[] = [
    {
      title: "Work Orders",
      value: workOrders.length,
      icon: ClipboardList,
      variant: "default",
      href: "/manufacturing/work-order",
    },
    {
      title: "In Process",
      value: woInProcess.length,
      icon: PlayCircle,
      variant: "warning",
      href: "/manufacturing/work-order",
    },
    {
      title: "Active BOMs",
      value: activeBOMs.length,
      icon: Layers,
      variant: "success",
      href: "/manufacturing/bom",
    },
    {
      title: "Workstations",
      value: workstations.length,
      icon: Cpu,
      variant: "default",
      href: "/manufacturing/workstation",
    },
  ];

  const actions: HubAction[] = [
    {
      label: "Work Orders",
      description: "Production jobs in flight.",
      icon: ClipboardList,
      href: "/manufacturing/work-order",
    },
    {
      label: "BOMs",
      description: "Bill of materials.",
      icon: Layers,
      href: "/manufacturing/bom",
    },
    {
      label: "Workstations",
      description: "Machines and stations.",
      icon: Cpu,
      href: "/manufacturing/workstation",
    },
    {
      label: "New Work Order",
      description: "Schedule a production run.",
      icon: Plus,
      href: "/manufacturing/work-order/new",
      primary: true,
    },
  ];

  const recent: HubRecentItem[] = recentWOs.slice(0, 5).map((wo) => ({
    name: wo.name,
    subtitle: wo.production_item ?? "",
    badge: wo.status,
    badgeVariant:
      wo.status === "In Process"
        ? ("secondary" as const)
        : wo.status === "Completed"
          ? ("outline" as const)
          : ("default" as const),
    href: `/manufacturing/work-order/${encodeURIComponent(wo.name)}`,
  }));

  const alerts: HubAlert[] = [
    {
      label: "Work orders in process",
      count: woInProcess.length,
      href: "/manufacturing/work-order",
      variant: "info",
    },
    {
      label: "Draft work orders",
      count: draftWOs.length,
      href: "/manufacturing/work-order",
      variant: "warning",
    },
  ];

  return (
    <ModuleHub
      title="Manufacturing Hub"
      subtitle="BOMs, work orders, and production."
      icon={Factory}
      primaryAction={{
        label: "New Work Order",
        href: "/manufacturing/work-order/new",
      }}
      kpis={kpis}
      actions={actions}
      recent={recent}
      recentTitle="Recent work orders"
      alerts={alerts}
    />
  );
}
