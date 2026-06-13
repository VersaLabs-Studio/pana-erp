// app/accounting/dashboard/page.tsx
// Obsidian ERP v4.0 — Accounting Hub (master §4.1, 2N Part 2.2).
//
// 2N Part 2.2: rewritten on real data. The previous version had hardcoded
// `bg-blue-100`/`text-blue-600`/`bg-emerald-100` literal colors and a fake
// "Reports" link list. This version uses the shared `ModuleHub` component
// + `useFrappeList` aggregates only.

"use client";

import {
  Calculator,
  FileText,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  BookOpen,
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

export default function AccountingDashboardPage() {
  // KPIs
  const { data: receivablesRows = [] } = useFrappeList<{
    outstanding_amount: number;
  }>("Sales Invoice", {
    fields: ["outstanding_amount"],
    filters: [["docstatus", "=", 1]],
    limit: 1000,
  });
  const { data: payablesRows = [] } = useFrappeList<{
    outstanding_amount: number;
  }>("Purchase Invoice", {
    fields: ["outstanding_amount"],
    filters: [["docstatus", "=", 1]],
    limit: 1000,
  });
  const { data: draftSIs = [] } = useFrappeList<{ name: string }>(
    "Sales Invoice",
    { fields: ["name"], filters: [["docstatus", "=", 0]], limit: 1 },
  );
  const { data: draftPEs = [] } = useFrappeList<{ name: string }>(
    "Payment Entry",
    { fields: ["name"], filters: [["docstatus", "=", 0]], limit: 1 },
  );

  // Recent
  const { data: recentPEs = [] } = useFrappeList<{
    name: string;
    party_type?: string;
    party?: string;
    payment_type: string;
    paid_amount: number;
    creation: string;
  }>("Payment Entry", {
    fields: ["name", "party_type", "party", "payment_type", "paid_amount", "creation"],
    orderBy: { field: "creation", order: "desc" },
    limit: 5,
  });

  const receivables = receivablesRows.reduce(
    (s, i) => s + (Number(i.outstanding_amount) || 0),
    0,
  );
  const payables = payablesRows.reduce(
    (s, i) => s + (Number(i.outstanding_amount) || 0),
    0,
  );

  const kpis: HubKpi[] = [
    {
      title: "Receivables",
      value: ETB.format(receivables),
      icon: ArrowDownLeft,
      variant: "success",
      href: "/accounting/sales-invoice",
    },
    {
      title: "Payables",
      value: ETB.format(payables),
      icon: ArrowUpRight,
      variant: "warning",
      href: "/accounting/purchase-invoice",
    },
    {
      title: "Draft Sales Invoices",
      value: draftSIs.length,
      icon: FileText,
      variant: "warning",
      href: "/accounting/sales-invoice",
    },
    {
      title: "Draft Payment Entries",
      value: draftPEs.length,
      icon: CreditCard,
      variant: "warning",
      href: "/accounting/payment-entry",
    },
  ];

  const actions: HubAction[] = [
    {
      label: "Sales Invoices",
      description: "Customer bills.",
      icon: FileText,
      href: "/accounting/sales-invoice",
    },
    {
      label: "Purchase Invoices",
      description: "Supplier bills.",
      icon: FileText,
      href: "/accounting/purchase-invoice",
    },
    {
      label: "Payment Entries",
      description: "Cash receipts and payments.",
      icon: CreditCard,
      href: "/accounting/payment-entry",
    },
    {
      label: "New Sales Invoice",
      description: "Bill a customer.",
      icon: Plus,
      href: "/accounting/sales-invoice/new",
      primary: true,
    },
  ];

  const recent: HubRecentItem[] = recentPEs.slice(0, 5).map((pe) => ({
    name: pe.name,
    subtitle: `${pe.party_type ?? ""}: ${pe.party ?? ""} · ${ETB.format(pe.paid_amount || 0)}`,
    badge: pe.payment_type,
    badgeVariant:
      pe.payment_type === "Receive" ? ("default" as const) : ("secondary" as const),
    href: `/accounting/payment-entry/${encodeURIComponent(pe.name)}`,
  }));

  const alerts: HubAlert[] = [
    {
      label: "Draft Sales Invoices",
      count: draftSIs.length,
      href: "/accounting/sales-invoice",
      variant: "warning",
    },
    {
      label: "Draft Payment Entries",
      count: draftPEs.length,
      href: "/accounting/payment-entry",
      variant: "warning",
    },
  ];

  // Reports is not a ModuleHub primitive; add a single "Reports" action
  // pointing to the P&L report (3.x wires up the rest).
  return (
    <>
      <ModuleHub
        title="Accounting Hub"
        subtitle="Invoices, payments, and reports."
        icon={Calculator}
        primaryAction={{
          label: "New Sales Invoice",
          href: "/accounting/sales-invoice/new",
        }}
        kpis={kpis}
        actions={actions}
        recent={recent}
        recentTitle="Recent payment entries"
        alerts={alerts}
      />
      {/* 2N Part 3: Financial Reporting links (visible from the hub for
          easy navigation; the report pages themselves land in Part 3.2). */}
      <div className="mt-6 rounded-2xl border border-border/40 bg-card p-5 shadow-sm shadow-black/5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Financial reports
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Profit & Loss", href: "/accounting/reports/profit-and-loss" },
            { label: "Balance Sheet", href: "/accounting/reports/balance-sheet" },
            {
              label: "Accounts Receivable",
              href: "/accounting/reports/accounts-receivable",
            },
            {
              label: "Accounts Payable",
              href: "/accounting/reports/accounts-payable",
            },
          ].map((r) => (
            <a
              key={r.href}
              href={r.href}
              className="group flex items-center justify-between gap-2 rounded-xl border border-border/30 bg-secondary/20 px-3 py-2.5 text-xs font-medium text-foreground transition-all hover:border-primary/20 hover:bg-secondary/40"
            >
              {r.label}
              <Clock className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
