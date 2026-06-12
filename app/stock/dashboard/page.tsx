// app/stock/dashboard/page.tsx
// Obsidian ERP v4.0 — Inventory Hub (master §4.1, 2N Part 2.2).

"use client";

import {
  Package,
  Box,
  Warehouse,
  Boxes,
  Truck,
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

export default function StockDashboardPage() {
  const now = new Date();
  const firstOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
    .toISOString()
    .split("T")[0];

  // KPIs
  const { data: items = [] } = useFrappeList<{ name: string }>("Item", {
    fields: ["name"],
    limit: 1,
  });
  const { data: warehouses = [] } = useFrappeList<{ name: string }>(
    "Warehouse",
    { fields: ["name"], limit: 1 },
  );
  const { data: binsWithStock = [] } = useFrappeList<{ name: string }>(
    "Bin",
    {
      fields: ["name"],
      filters: [["actual_qty", ">", 0]],
      limit: 1,
    },
  );
  const { data: draftDNs = [] } = useFrappeList<{ name: string }>(
    "Delivery Note",
    { fields: ["name"], filters: [["docstatus", "=", 0]], limit: 1 },
  );

  // Recent
  const { data: recentItems = [] } = useFrappeList<{
    name: string;
    item_name: string;
    item_group?: string;
  }>("Item", {
    fields: ["name", "item_name", "item_group"],
    orderBy: { field: "creation", order: "desc" },
    limit: 5,
  });

  // Alerts
  const { data: stockEntriesToday = [] } = useFrappeList<{ name: string }>(
    "Stock Entry",
    {
      fields: ["name", "creation"],
      filters: [["creation", ">=", firstOfDay]],
      limit: 1,
    },
  );
  const { data: negativeBins = [] } = useFrappeList<{ name: string }>(
    "Bin",
    {
      fields: ["name"],
      filters: [["projected_qty", "<", 0]],
      limit: 1,
    },
  );

  const kpis: HubKpi[] = [
    {
      title: "Items",
      value: items.length,
      icon: Box,
      variant: "default",
      href: "/stock/item",
    },
    {
      title: "Warehouses",
      value: warehouses.length,
      icon: Warehouse,
      variant: "default",
      href: "/stock/warehouse",
    },
    {
      title: "Bins with stock",
      value: binsWithStock.length,
      icon: Boxes,
      variant: "success",
      href: "/stock/stock-balance",
    },
    {
      title: "Pending Delivery Notes",
      value: draftDNs.length,
      icon: Truck,
      variant: "warning",
      href: "/stock/delivery-note",
    },
  ];

  const actions: HubAction[] = [
    {
      label: "Items",
      description: "All stocked and service items.",
      icon: Box,
      href: "/stock/item",
    },
    {
      label: "Warehouses",
      description: "Storage locations.",
      icon: Warehouse,
      href: "/stock/warehouse",
    },
    {
      label: "Delivery Notes",
      description: "Outbound shipments.",
      icon: Truck,
      href: "/stock/delivery-note",
    },
    {
      label: "New Item",
      description: "Register a new SKU.",
      icon: Plus,
      href: "/stock/item/new",
      primary: true,
    },
  ];

  const recent: HubRecentItem[] = recentItems.slice(0, 5).map((i) => ({
    name: i.name,
    subtitle: i.item_name,
    badge: i.item_group,
    badgeVariant: "outline",
    href: `/stock/item/${encodeURIComponent(i.name)}`,
  }));

  const alerts: HubAlert[] = [
    {
      label: "Stock entries today",
      count: stockEntriesToday.length,
      href: "/stock/stock-entry",
      variant: "info",
    },
    {
      label: "Bins below zero (projected)",
      count: negativeBins.length,
      href: "/stock/stock-balance",
      variant: "warning",
    },
  ];

  return (
    <ModuleHub
      title="Inventory Hub"
      subtitle="Items, warehouses, and stock movements."
      icon={Package}
      primaryAction={{ label: "New Item", href: "/stock/item/new" }}
      kpis={kpis}
      actions={actions}
      recent={recent}
      recentTitle="Recent items"
      alerts={alerts}
    />
  );
}
