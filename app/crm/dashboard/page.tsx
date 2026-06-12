// app/crm/dashboard/page.tsx
// Obsidian ERP v4.0 — CRM Hub (master §4.1, 2N Part 2.2).
//
// Real data, no fallbacks. KPIs/actions/recent/alerts all driven by
// `useFrappeList` aggregates. The shared `ModuleHub` component renders the
// B1 chrome and stagger.

"use client";

import {
  Users,
  UserCheck,
  UserPlus,
  Target,
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

const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export default function CrmDashboardPage() {
  // KPIs
  const { data: openLeads = [] } = useFrappeList<{ name: string }>("Lead", {
    fields: ["name"],
    filters: [["status", "!=", "Converted"]],
    limit: 1,
  });
  const { data: customers = [] } = useFrappeList<{ name: string }>(
    "Customer",
    { fields: ["name"], limit: 1 },
  );
  const { data: openOpps = [] } = useFrappeList<{ name: string }>(
    "Opportunity",
    { fields: ["name"], filters: [["status", "=", "Open"]], limit: 1 },
  );
  const { data: openQuotes = [] } = useFrappeList<{ name: string }>(
    "Quotation",
    {
      fields: ["name"],
      filters: [["status", "in", ["Open", "Draft"]]],
      limit: 1,
    },
  );

  // Recent
  const { data: recentLeads = [] } = useFrappeList<{
    name: string;
    lead_name: string;
    status: string;
  }>("Lead", {
    fields: ["name", "lead_name", "status"],
    orderBy: { field: "creation", order: "desc" },
    limit: 5,
  });

  // Alerts
  const { data: draftLeads = [] } = useFrappeList<{ name: string }>("Lead", {
    fields: ["name"],
    filters: [["status", "=", "Draft"]],
    limit: 1,
  });

  const kpis: HubKpi[] = [
    {
      title: "Open Leads",
      value: openLeads.length,
      icon: UserPlus,
      variant: "default",
      href: "/crm/lead",
    },
    {
      title: "Customers",
      value: customers.length,
      icon: UserCheck,
      variant: "success",
      href: "/crm/customer",
    },
    {
      title: "Open Opportunities",
      value: openOpps.length,
      icon: Target,
      variant: "warning",
      href: "/crm/opportunity",
    },
    {
      title: "Open Quotations",
      value: openQuotes.length,
      icon: FileText,
      variant: "default",
      href: "/sales/quotation",
    },
  ];

  const actions: HubAction[] = [
    {
      label: "Leads",
      description: "Pipeline of unqualified prospects.",
      icon: Users,
      href: "/crm/lead",
    },
    {
      label: "Customers",
      description: "Qualified accounts.",
      icon: UserCheck,
      href: "/crm/customer",
    },
    {
      label: "New Lead",
      description: "Capture an unqualified prospect.",
      icon: Plus,
      href: "/crm/lead/new",
      primary: true,
    },
    {
      label: "Opportunities",
      description: "Track deals in motion.",
      icon: Target,
      href: "/crm/opportunity",
    },
  ];

  const recent: HubRecentItem[] = recentLeads.slice(0, 5).map((l) => ({
    name: l.name,
    subtitle: l.lead_name ?? "",
    badge: l.status,
    badgeVariant:
      l.status === "Converted" || l.status === "Quotation"
        ? "outline"
        : "secondary",
    href: `/crm/lead/${encodeURIComponent(l.name)}`,
  }));

  const alerts: HubAlert[] = [
    {
      label: "Draft leads",
      count: draftLeads.length,
      href: "/crm/lead",
      variant: "warning",
    },
    {
      label: "All open leads",
      count: openLeads.length,
      href: "/crm/lead",
      variant: "info",
    },
  ];

  return (
    <ModuleHub
      title="CRM Hub"
      subtitle="Leads, customers, and pipeline at a glance."
      icon={Users}
      primaryAction={{ label: "New Lead", href: "/crm/lead/new" }}
      kpis={kpis}
      actions={actions}
      recent={recent}
      recentTitle="Recent leads"
      alerts={alerts}
    />
  );
}
