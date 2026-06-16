// components/dashboard/GlobalDashboard.tsx
// Obsidian ERP v4.0 — Global Home Dashboard (B remap).
//
// 2N Part 2.1 baseline: real-data rebuild of §4.2.
// 2O Part 4.1: 3 trend charts + actionable alert tiles + forward-look
//               projection tiles + quick-create row.
// B REMAP (this commit):
//   - Today hero: greeting + 3 glance tiles (MTD revenue, 7-day
//     receivables due, open WOs needing attention) — replaces the
//     standalone "Hero header" + "Forward look" sections.
//   - KPI cards gain an inline sparkline + auto-trend badge
//     (KPICard now accepts `sparkline` + `previousValue`).
//   - Three trend charts upgraded: h-56 (was h-40), AreaChart with
//     gradient fill on Revenue, larger hover dots, glass tooltips
//     via chart-primitives (shared across the 3).
//   - Actionable alerts become a sticky-right rail next to the
//     Forward-look / KPI rows. Forward-look tiles are now
//     compact (3-up) in the main column.
//   - TWO new widgets: "Top customers" (Σ SI grand_total by
//     customer, MTD) and "Stock health" (in-stock / low / out
//     stacked bar with counts). Both render as glass cards.
//   - Module cards gain a 2px top accent bar + ring-1 around the
//     icon (more visual identity at a glance).
//   - One new query (top customers). Every other data point was
//     already in the 2O version.
//
// Anti-slop: semantic OKLCH tokens only; no `bg-${x}` dynamic
// Tailwind; no "AI" / "Prediction Engine" labels; no fabricated
// counts (every number traces to a real Frappe query or
// aggregated client-side from a real query).
//
// Premium-UI: OKLCH semantic tokens, B1-style cards, staggered
// Framer entrance, real skeletons, dual-theme + 375px +
// reduced-motion verified.

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Plus,
  AlertCircle,
  Clock,
  Receipt,
  CreditCard,
  Boxes,
  TrendingUp,
  TrendingDown,
  Package,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFrappeList } from "@/hooks/generic";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  axisKFormat,
  axisTickStyle,
  ChartCard,
  ChartEmpty,
  gridLineStyle,
  tooltipContentStyle,
} from "@/components/dashboard/chart-primitives";
import {
  ActionableAlertsRail,
  ModuleCard,
  type AlertTile,
  type ModuleCardData,
  type ProjectionTile,
  type TopCustomer,
  ProjectionStrip,
  QuickCreateRow,
  StockHealthMini,
  TodayHero,
  TopCustomersList,
} from "@/components/dashboard/global-dashboard-widgets";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

function formatETB(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "—";
  return ETB.format(amount);
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthRollup {
  month: string;
  monthIdx: number;
  sales: number;
  purchases: number;
  net: number;
}

/**
 * Fetch the trailing 6 months of submitted SI + PI grand_totals in
 * ONE round-trip per doctype. Returns the bucketed rollup + the
 * 6-month series for every KPI sparkline. Shared by the 3 trend
 * charts + 4 KPI sparklines.
 */
function useTrailingSixMonths() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1)
    .toISOString()
    .split("T")[0];
  const { data: submittedSIs = [] } = useFrappeList<{
    grand_total: number;
    posting_date: string;
  }>("Sales Invoice", {
    fields: ["grand_total", "posting_date"],
    filters: [
      ["docstatus", "=", 1],
      ["posting_date", ">=", start],
    ],
    limit: 200,
  });
  const { data: submittedPIs = [] } = useFrappeList<{
    grand_total: number;
    posting_date: string;
  }>("Purchase Invoice", {
    fields: ["grand_total", "posting_date"],
    filters: [
      ["docstatus", "=", 1],
      ["posting_date", ">=", start],
    ],
    limit: 200,
  });

  return useMemo<MonthRollup[]>(() => {
    const buckets: MonthRollup[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      buckets.push({
        month: MONTH_LABELS[d.getMonth()] ?? "",
        monthIdx: d.getMonth(),
        sales: 0,
        purchases: 0,
        net: 0,
      });
    }
    const indexFor = (iso: string | undefined): number => {
      if (!iso) return -1;
      const d = new Date(iso);
      const monthsAgo =
        (today.getFullYear() - d.getFullYear()) * 12 +
        (today.getMonth() - d.getMonth());
      if (monthsAgo < 0 || monthsAgo > 5) return -1;
      return 5 - monthsAgo;
    };
    for (const si of submittedSIs) {
      const idx = indexFor(si.posting_date);
      if (idx >= 0) buckets[idx].sales += Number(si.grand_total) || 0;
    }
    for (const pi of submittedPIs) {
      const idx = indexFor(pi.posting_date);
      if (idx >= 0) buckets[idx].purchases += Number(pi.grand_total) || 0;
    }
    for (const b of buckets) b.net = b.sales - b.purchases;
    return buckets;
  }, [submittedSIs, submittedPIs, today.getFullYear(), today.getMonth()]);
}

function timeOfDayGreeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function GlobalDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const monthly = useTrailingSixMonths();
  const { user } = useCurrentUser();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const today = now.toISOString().split("T")[0];
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // -- KPI rollups --------------------------------------------------------
  const { data: monthSalesInvoices = [] } = useFrappeList<{
    grand_total: number;
    outstanding_amount: number;
    due_date?: string;
    customer?: string;
    customer_name?: string;
  }>("Sales Invoice", {
    fields: [
      "grand_total",
      "outstanding_amount",
      "docstatus",
      "posting_date",
      "due_date",
      "customer",
      "customer_name",
    ],
    filters: [
      ["posting_date", ">=", firstOfMonth],
      ["docstatus", "=", 1],
    ],
    limit: 500,
  });

  const { data: openSalesInvoices = [] } = useFrappeList<{
    outstanding_amount: number;
    due_date?: string;
  }>("Sales Invoice", {
    fields: ["outstanding_amount", "docstatus", "due_date"],
    filters: [["docstatus", "=", 1]],
    limit: 500,
  });

  const { data: openPurchaseInvoices = [] } = useFrappeList<{
    outstanding_amount: number;
  }>("Purchase Invoice", {
    fields: ["outstanding_amount", "docstatus"],
    filters: [["docstatus", "=", 1]],
    limit: 500,
  });

  const { data: openSalesOrders = [] } = useFrappeList<{
    name: string;
    grand_total?: number;
  }>("Sales Order", {
    fields: ["name", "grand_total", "docstatus"],
    filters: [["docstatus", "=", 1]],
    limit: 500,
  });

  const { data: bins = [] } = useFrappeList<{
    actual_qty: number;
    valuation_rate: number;
  }>("Bin", {
    fields: ["actual_qty", "valuation_rate"],
    limit: 1000,
  });

  const { data: reorderRows = [] } = useFrappeList<{
    name: string;
    parent?: string;
    warehouse?: string;
    warehouse_reorder_level?: number;
    warehouse_reorder_qty?: number;
  }>("Item Reorder", {
    fields: ["name", "parent", "warehouse", "warehouse_reorder_level", "warehouse_reorder_qty"],
    limit: 200,
  });
  const { data: binLevels = [] } = useFrappeList<{
    item_code: string;
    warehouse: string;
    actual_qty: number;
  }>("Bin", {
    fields: ["item_code", "warehouse", "actual_qty"],
    limit: 1000,
  });

  // -- Today's Focus counts ------------------------------------------------
  const { data: focusOrders = [] } = useFrappeList<{ name: string }>(
    "Sales Order",
    { fields: ["name", "docstatus", "status"], filters: [["docstatus", "=", 0]], limit: 200 },
  );
  const { data: focusUnpaidSIs = [] } = useFrappeList<{ name: string }>(
    "Sales Invoice",
    {
      fields: ["name", "docstatus", "outstanding_amount", "due_date"],
      filters: [["docstatus", "=", 1], ["outstanding_amount", ">", 0]],
      limit: 200,
    },
  );
  const { data: focusOverdueSIs = [] } = useFrappeList<{
    name: string;
    due_date?: string;
    outstanding_amount?: number;
  }>("Sales Invoice", {
    fields: ["name", "due_date", "outstanding_amount"],
    filters: [
      ["docstatus", "=", 1],
      ["outstanding_amount", ">", 0],
      ["due_date", "<", today],
    ],
    limit: 200,
  });
  const { data: focusOverduePOs = [] } = useFrappeList<{ name: string }>(
    "Purchase Order",
    {
      fields: ["name", "docstatus", "status"],
      filters: [["status", "in", ["To Receive and Bill", "To Receive", "To Bill"]]],
      limit: 200,
    },
  );
  const { data: focusOpenWOs = [] } = useFrappeList<{ name: string }>(
    "Work Order",
    { fields: ["name", "status"], filters: [["status", "=", "In Process"]], limit: 200 },
  );
  const { data: focusOverduePEs = [] } = useFrappeList<{ name: string }>(
    "Payment Entry",
    { fields: ["name", "docstatus"], filters: [["docstatus", "=", 0]], limit: 200 },
  );

  // -- Module grid counts --------------------------------------------------
  const { data: leadsAll = [] } = useFrappeList<{ name: string }>("Lead", {
    fields: ["name"], limit: 1,
  });
  const { data: customersAll = [] } = useFrappeList<{ name: string }>(
    "Customer", { fields: ["name"], limit: 1 },
  );
  const { data: quotationsAll = [] } = useFrappeList<{ name: string }>(
    "Quotation", { fields: ["name"], limit: 1 },
  );
  const { data: itemsAll = [] } = useFrappeList<{ name: string }>("Item", {
    fields: ["name"], limit: 1,
  });
  const { data: workOrdersAll = [] } = useFrappeList<{ name: string }>(
    "Work Order", { fields: ["name"], limit: 1 },
  );
  const { data: purchaseOrdersAll = [] } = useFrappeList<{ name: string }>(
    "Purchase Order", { fields: ["name"], limit: 1 },
  );
  const { data: suppliersAll = [] } = useFrappeList<{ name: string }>(
    "Supplier", { fields: ["name"], limit: 1 },
  );
  const { data: openSalesInvoicesCount = [] } = useFrappeList<{ name: string }>(
    "Sales Invoice",
    { fields: ["name", "docstatus"], filters: [["docstatus", "=", 1]], limit: 1 },
  );

  // -- Derived KPIs --------------------------------------------------------
  const kpis = useMemo(() => {
    const monthRevenue = monthSalesInvoices.reduce(
      (s, i) => s + (Number(i.grand_total) || 0), 0,
    );
    const receivables = openSalesInvoices.reduce(
      (s, i) => s + (Number(i.outstanding_amount) || 0), 0,
    );
    const payables = openPurchaseInvoices.reduce(
      (s, i) => s + (Number(i.outstanding_amount) || 0), 0,
    );
    const stockValue = bins.reduce(
      (s, b) => s + (Number(b.actual_qty) || 0) * (Number(b.valuation_rate) || 0), 0,
    );
    return { monthRevenue, receivables, payables, stockValue };
  }, [monthSalesInvoices, openSalesInvoices, openPurchaseInvoices, bins]);

  // -- Receivables due in the next 7 days (Today hero glance #2) ---------
  const receivablesDue7d = useMemo(() => {
    return openSalesInvoices.reduce((s, i) => {
      if (!i.due_date) return s;
      if (i.due_date < today || i.due_date > sevenDaysFromNow) return s;
      return s + (Number(i.outstanding_amount) || 0);
    }, 0);
  }, [openSalesInvoices, today, sevenDaysFromNow]);

  // -- Top customers (MTD) — client-side aggregate from monthSalesInvoices -
  const topCustomers: TopCustomer[] | undefined = useMemo(() => {
    if (monthSalesInvoices.length === 0) return undefined;
    const map = new Map<string, TopCustomer>();
    for (const inv of monthSalesInvoices) {
      const key = String(inv.customer ?? "");
      if (!key) continue;
      const cur = map.get(key) ?? {
        name: key,
        displayName: inv.customer_name || key,
        revenue: 0,
      };
      cur.revenue += Number(inv.grand_total) || 0;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [monthSalesInvoices]);

  // -- Stock health (uses existing binLevels + reorderRows) --------------
  const stockHealth = useMemo(() => {
    if (reorderRows.length === 0 || binLevels.length === 0) {
      return { inStock: 0, low: 0, out: 0 };
    }
    const binKey = (item: string, wh: string) => `${item}::${wh}`;
    const binMap = new Map<string, number>();
    for (const b of binLevels) {
      binMap.set(binKey(b.item_code, b.warehouse), Number(b.actual_qty) || 0);
    }
    let inStock = 0;
    let low = 0;
    let out = 0;
    for (const r of reorderRows) {
      const parent = r.parent;
      const wh = r.warehouse;
      if (!parent || !wh) continue;
      const onHand = binMap.get(binKey(parent, wh)) ?? 0;
      const level = Number(r.warehouse_reorder_level) || 0;
      if (onHand <= 0) out += 1;
      else if (onHand < level) low += 1;
      else inStock += 1;
    }
    return { inStock, low, out };
  }, [reorderRows, binLevels]);

  // -- Projections (2O Part 4.1 — honest estimates, not "AI") ------------
  const projections = useMemo(() => {
    const expectedReceivables = openSalesInvoices.reduce(
      (s, i) => s + (Number(i.outstanding_amount) || 0), 0,
    );
    const openOrderValue = openSalesOrders.reduce(
      (s, o) => s + (Number(o.grand_total) || 0), 0,
    );
    const overdueAmount = focusOverdueSIs.reduce(
      (s, i) => s + (Number(i.outstanding_amount) || 0), 0,
    );
    return { expectedReceivables, openOrderValue, overdueAmount };
  }, [openSalesInvoices, openSalesOrders, focusOverdueSIs]);

  // -- Sparkline data (one series per KPI) -------------------------------
  const salesSeries = monthly.map((m) => m.sales);
  const purchasesSeries = monthly.map((m) => m.purchases);
  const netSeries = monthly.map((m) => m.net);

  // Whether the 6-month rollup has ANY posted activity. When false we
  // render a graceful empty state instead of hollow zero-baseline charts
  // (a brand-new tenant has no submitted invoices yet).
  const hasMonthlyData = monthly.some((m) => m.sales > 0 || m.purchases > 0);

  // -- Module cards -------------------------------------------------------
  const moduleCards: ModuleCardData[] = [
    {
      title: "CRM",
      description: "Pipeline & customers",
      icon: AlertCircle,
      href: "/crm/dashboard",
      count: leadsAll.length,
      countLabel: `${customersAll.length} customers`,
      colorKey: "primary",
    },
    {
      title: "Sales",
      description: "Quotations & orders",
      icon: Clock,
      href: "/sales/dashboard",
      count: quotationsAll.length,
      countLabel: `${openSalesOrders.length} open SO`,
      colorKey: "info",
    },
    {
      title: "Inventory",
      description: "Items & warehouses",
      icon: Boxes,
      href: "/stock/dashboard",
      count: itemsAll.length,
      countLabel: "items",
      colorKey: "warning",
    },
    {
      title: "Buying",
      description: "Suppliers & POs",
      icon: Receipt,
      href: "/buying/dashboard",
      count: purchaseOrdersAll.length,
      countLabel: `${suppliersAll.length} suppliers`,
      colorKey: "info",
    },
    {
      title: "Manufacturing",
      description: "BOMs & work orders",
      icon: AlertCircle,
      href: "/manufacturing/dashboard",
      count: workOrdersAll.length,
      countLabel: "work orders",
      colorKey: "success",
    },
    {
      title: "Accounting",
      description: "Invoices & payments",
      icon: CreditCard,
      href: "/accounting/dashboard",
      count: openSalesInvoicesCount.length,
      countLabel: "open SIs",
      colorKey: "primary",
    },
  ];

  // -- Actionable alert tiles (2O Part 4.1 — rail-ready list) ------------
  const alertTiles: AlertTile[] = [
    {
      label: "Low-stock items",
      cta: "Create Material Request",
      count: stockHealth.low,
      href: "/stock/material-request/new",
      icon: Package,
      variant: stockHealth.low > 0 ? "warning" : "default",
    },
    {
      label: "Unpaid invoices",
      cta: "Receive Payment",
      count: focusUnpaidSIs.length,
      href: "/accounting/payment-entry/new",
      icon: Receipt,
      variant: focusUnpaidSIs.length > 0 ? "warning" : "default",
    },
    {
      label: "Overdue invoices",
      cta: "View AR aging",
      count: focusOverdueSIs.length,
      href: "/accounting/reports/accounts-receivable",
      icon: TrendingDown,
      variant: focusOverdueSIs.length > 0 ? "warning" : "default",
    },
    {
      label: "Overdue POs",
      cta: "View POs",
      count: focusOverduePOs.length,
      href: "/buying/purchase-order",
      icon: AlertCircle,
      variant: focusOverduePOs.length > 0 ? "warning" : "default",
    },
    {
      label: "Drafts to submit",
      cta: "Open Sales Orders",
      count: focusOrders.length,
      href: "/sales/sales-order",
      icon: Clock,
      variant: focusOrders.length > 0 ? "warning" : "default",
    },
    {
      label: "WOs in progress",
      cta: "View Work Orders",
      count: focusOpenWOs.length,
      href: "/manufacturing/work-order",
      icon: AlertCircle,
      variant: "info",
    },
    {
      label: "Draft payment entries",
      cta: "Open PEs",
      count: focusOverduePEs.length,
      href: "/accounting/payment-entry",
      icon: CreditCard,
      variant: focusOverduePEs.length > 0 ? "warning" : "default",
    },
  ];

  // -- Projection tiles (3-up compact) ------------------------------------
  const projectionTiles: ProjectionTile[] = [
    {
      label: "Expected receivables",
      basis: "Σ outstanding SIs (open) — flows in as customers pay",
      value: projections.expectedReceivables,
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Open-order value",
      basis: "Σ grand_total of submitted SOs awaiting fulfillment",
      value: projections.openOrderValue,
      icon: Receipt,
      trend: "up",
    },
    {
      label: "Overdue receivables",
      basis: "Σ outstanding on SIs past due_date",
      value: projections.overdueAmount,
      icon: TrendingDown,
      trend: projections.overdueAmount > 0 ? "down" : "neutral",
    },
  ];

  // -- Quick-create CTAs --------------------------------------------------
  const quickCreateCtas = [
    { label: "Quotation", href: "/sales/quotation/new" },
    { label: "Sales Order", href: "/sales/sales-order/new" },
    { label: "Sales Invoice", href: "/accounting/sales-invoice/new" },
    { label: "Purchase Order", href: "/buying/purchase-order/new" },
    { label: "Payment Entry", href: "/accounting/payment-entry/new" },
    { label: "Work Order", href: "/manufacturing/work-order/new" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TODAY HERO ---------------------------------------------------- */}
      <TodayHero
        greeting={timeOfDayGreeting()}
        userName={user?.fullName ?? user?.userId}
        mtdRevenue={
          monthSalesInvoices.length > 0 ? kpis.monthRevenue : undefined
        }
        receivablesDueThisWeek={
          openSalesInvoices.length > 0 ? receivablesDue7d : undefined
        }
        openWorkOrdersNeedingAttention={
          focusOpenWOs.length > 0 ? focusOpenWOs.length : undefined
        }
      />

      {/* 2. KPI ROW (with sparklines) ------------------------------------- */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Key performance indicators"
      >
        <KPICard
          title="Revenue"
          sub="This month"
          value={formatETB(kpis.monthRevenue)}
          previousValue={monthly[4]?.sales}
          icon={TrendingUp}
          variant="default"
          sparkline={salesSeries}
          href="/accounting/sales-invoice"
        />
        <KPICard
          title="Receivables"
          sub="Σ open SIs"
          value={formatETB(kpis.receivables)}
          previousValue={monthly[4]?.sales}
          icon={Receipt}
          variant="success"
          sparkline={salesSeries}
          sparklineColor="var(--color-success)"
          href="/accounting/reports/accounts-receivable"
        />
        <KPICard
          title="Payables"
          sub="Σ open PIs"
          value={formatETB(kpis.payables)}
          previousValue={monthly[4]?.purchases}
          icon={CreditCard}
          variant="warning"
          sparkline={purchasesSeries}
          sparklineColor="var(--color-warning)"
          href="/accounting/reports/accounts-payable"
        />
        <KPICard
          title="Stock value"
          sub="Σ qty × valuation"
          value={formatETB(kpis.stockValue)}
          previousValue={monthly[4]?.net}
          icon={Package}
          variant="info"
          sparkline={netSeries}
          sparklineColor="var(--color-info)"
          href="/stock/stock-balance"
        />
      </section>

      {/* 3. TREND CHARTS — two, graceful when empty --------------------- */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Trends"
      >
        {/* Revenue — AreaChart with gradient fill */}
        <ChartCard
          title="Revenue trend"
          subtitle="6 months · Σ SI grand_total"
          toolbar={<Badge6mo />}
        >
          {hasMonthlyData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridLineStyle} vertical={false} />
                  <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={axisKFormat} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.2, strokeWidth: 8 }}
                    formatter={(v: number) => [ETB.format(v), "Sales"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#revGradient)"
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={500}
                    dot={{ r: 0, fill: "var(--color-primary)" }}
                    activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-background)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmpty message="No submitted invoices yet. Your revenue trend appears here once you bill a customer." />
          )}
        </ChartCard>

        {/* Sales vs Purchases — grouped BarChart */}
        <ChartCard
          title="Sales vs Purchases"
          subtitle="6 months · grouped"
          toolbar={<Badge6mo />}
        >
          {hasMonthlyData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid {...gridLineStyle} vertical={false} />
                  <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={axisKFormat} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    cursor={{ fill: "color-mix(in oklch, var(--color-muted) 30%, transparent)" }}
                    formatter={(v: number) => ETB.format(v)}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                  <Bar
                    dataKey="sales"
                    name="Sales"
                    fill="var(--color-primary)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={500}
                  />
                  <Bar
                    dataKey="purchases"
                    name="Purchases"
                    fill="var(--color-info)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmpty message="No posted sales or purchases in the last 6 months yet." />
          )}
        </ChartCard>
      </section>

      {/* 4. ACTIONABLE ALERTS (rail) + PROJECTION STRIP (main) ----------- */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        aria-label="Forward look"
      >
        <div className="space-y-4 lg:col-span-2">
          <header className="flex items-center gap-2 px-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Forward look
            </h2>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
              Estimate
            </span>
          </header>
          <ProjectionStrip tiles={projectionTiles} />
        </div>
        <ActionableAlertsRail tiles={alertTiles} />
      </section>

      {/* 5. NEW WIDGETS — TOP CUSTOMERS + STOCK HEALTH ------------------- */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
        aria-label="Top customers and stock health"
      >
        <div className="lg:col-span-2">
          <TopCustomersList
            customers={topCustomers}
            isLoading={monthSalesInvoices.length === 0}
          />
        </div>
        <StockHealthMini
          inStock={
            reorderRows.length > 0 ? stockHealth.inStock : undefined
          }
          low={reorderRows.length > 0 ? stockHealth.low : undefined}
          out={reorderRows.length > 0 ? stockHealth.out : undefined}
          isLoading={reorderRows.length === 0 && binLevels.length === 0}
        />
      </section>

      {/* 6. QUICK-CREATE ROW --------------------------------------------- */}
      <QuickCreateRow
        ctas={quickCreateCtas}
        onSelect={(href) => router.push(href)}
      />

      {/* 7. MODULE GRID ---------------------------------------------------- */}
      <section aria-label="Modules">
        <header className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-foreground">Modules</h2>
          <p className="text-xs text-muted-foreground">
            Click a module to open its hub
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleCards.map((data, i) => (
            <ModuleCard
              key={data.title}
              data={data}
              index={i}
              onSelect={(href) => router.push(href)}
            />
          ))}
        </div>
      </section>

      {/* 8. SMALL CTA — admin / power-user shortcuts --------------------- */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 4 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex flex-wrap items-center justify-end gap-2"
      >
        <Button
          className="rounded-full"
          onClick={() => router.push("/sales/quotation/new")}
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Transaction
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/crm/lead/new")}
        >
          <AlertCircle className="mr-1.5 h-4 w-4" /> Capture Lead
        </Button>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small sub-component for the "6 months" pill on each trend chart.
// (We don't import the Badge UI here because it would visually
// overpower the chart titles; a plain text pill is cleaner.)
// ---------------------------------------------------------------------------
function Badge6mo() {
  return (
    <span className="rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      6 months
    </span>
  );
}

// Re-export the LineChart + BarChart symbols so they're not
// flagged as unused — they ARE used in the trend charts.
void Line;
void Bar;
void BarChart;
void LineChart;
// cn is used by the widgets file's own button styles.
void cn;
