// components/dashboard/global-dashboard-widgets.tsx
// Obsidian ERP v4.0 - Global Dashboard widget sub-components (B remap).
//
// Each widget is a small, focused sub-component consumed by
// GlobalDashboard.tsx. Splitting them out keeps the main file
// readable and lets the B remap add new widgets without growing
// the parent beyond ~600 lines.
//
// Premium-UI: OKLCH tokens only, B1 cards, reduced-motion safe,
// dual-theme, 375px-friendly, no fabricated data.

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Wallet,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import { SkeletonLine } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

// ---------------------------------------------------------------------------
// TodayHero — Greeting + 3 glance metrics. Glass card.
// ---------------------------------------------------------------------------

export interface TodayHeroProps {
  /** Greeting derived from the local hour (caller computes). */
  greeting: string;
  /** Display name (first name preferred). */
  userName?: string;
  /** Primary headline metric. */
  mtdRevenue: number | undefined;
  /** Subhead metric 1. */
  receivablesDueThisWeek: number | undefined;
  /** Subhead metric 2. */
  openWorkOrdersNeedingAttention: number | undefined;
}

export function TodayHero({
  greeting,
  userName,
  mtdRevenue,
  receivablesDueThisWeek,
  openWorkOrdersNeedingAttention,
}: TodayHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.section
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/8 via-card/80 to-info/8 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl sm:p-8"
      aria-label="Today"
    >
      {/* Decorative gradient blob — subtle, no animation */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-info/10 blur-3xl"
      />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {greeting}
          {userName && <span className="text-muted-foreground/70"> · {userName}</span>}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {userName ? `Welcome back, ${userName.split(" ")[0]}.` : "Welcome back."}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Real-time rollups from your operational data. Every number
          below traces to a live Frappe query.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GlanceTile
            label="MTD revenue"
            value={mtdRevenue}
            tone="primary"
            icon={TrendingUp}
            href="/accounting/sales-invoice"
            tooltip="Sum of grand_total on submitted Sales Invoices this month."
          />
          <GlanceTile
            label="Receivables due (7d)"
            value={receivablesDueThisWeek}
            tone="success"
            icon={CalendarClock}
            href="/accounting/reports/accounts-receivable"
            tooltip="Σ outstanding on SIs with due_date in the next 7 days."
          />
          <GlanceTile
            label="Open work orders"
            value={openWorkOrdersNeedingAttention}
            tone="warning"
            icon={Hammer}
            href="/manufacturing/work-order"
            tooltip="Work orders currently In Process — review on the cockpit."
            isCount
          />
        </div>
      </div>
    </motion.section>
  );
}

function GlanceTile({
  label,
  value,
  tone,
  icon: Icon,
  href,
  tooltip,
  isCount,
}: {
  label: string;
  value: number | undefined;
  tone: "primary" | "success" | "warning";
  icon: LucideIcon;
  href: string;
  tooltip: string;
  isCount?: boolean;
}) {
  const toneCls = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    success: "border-success/20 bg-success/5 text-success",
    warning: "border-warning/20 bg-warning/5 text-warning",
  }[tone];
  return (
    <Link
      href={href}
      title={tooltip}
      className={cn(
        "group flex flex-col gap-1 rounded-2xl border p-4 transition-all hover:shadow-md",
        toneCls,
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4" />
        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </p>
      {value === undefined ? (
        <SkeletonLine className="h-6 w-20" />
      ) : (
        <p className="text-xl font-bold tabular-nums text-foreground">
          {isCount ? value : ETB.format(value)}
        </p>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// TopCustomersList — top 5 customers by Σ grand_total (MTD), with bars.
// ---------------------------------------------------------------------------

export interface TopCustomer {
  name: string;
  displayName: string;
  revenue: number;
}

export function TopCustomersList({
  customers,
  isLoading,
  periodLabel = "this month",
}: {
  customers: TopCustomer[] | undefined;
  isLoading: boolean;
  periodLabel?: string;
}) {
  const max = useMemo(
    () =>
      customers && customers.length > 0
        ? Math.max(...customers.map((c) => c.revenue))
        : 1,
    [customers],
  );
  const top = (customers ?? []).slice(0, 5);
  return (
    <section
      className="rounded-2xl border border-border/40 bg-card/60 p-5 shadow-sm shadow-black/5 backdrop-blur-sm sm:p-6"
      aria-label="Top customers"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Top customers
          </h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Σ SI grand_total · {periodLabel}
          </p>
        </div>
        <Link
          href="/accounting/sales-invoice"
          className="text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all →
        </Link>
      </header>
      {isLoading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <SkeletonLine className="h-6 w-32" />
              <SkeletonLine className="h-2 flex-1" />
              <SkeletonLine className="h-4 w-20" />
            </li>
          ))}
        </ul>
      ) : top.length === 0 ? (
        <Empty
          title="No customers yet"
          description="Once you submit Sales Invoices, your top customers will appear here."
        />
      ) : (
        <ul className="space-y-2.5">
          {top.map((c, i) => {
            const pct = max > 0 ? (c.revenue / max) * 100 : 0;
            return (
              <li key={c.name} className="group">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-foreground">
                    <span className="mr-1.5 inline-block w-4 text-right tabular-nums text-muted-foreground">
                      {i + 1}.
                    </span>
                    {c.displayName}
                  </span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                    {ETB.format(c.revenue)}
                  </span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary/50"
                  role="presentation"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-info"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// StockHealthMini — 3 numbers + tiny horizontal stacked bar.
// ---------------------------------------------------------------------------

export function StockHealthMini({
  inStock,
  low,
  out,
  isLoading,
}: {
  inStock: number | undefined;
  low: number | undefined;
  out: number | undefined;
  isLoading: boolean;
}) {
  const total = (inStock ?? 0) + (low ?? 0) + (out ?? 0);
  const segs = [
    {
      key: "in",
      label: "In stock",
      value: inStock,
      color: "bg-success",
      text: "text-success",
      dot: "bg-success",
    },
    {
      key: "low",
      label: "Low",
      value: low,
      color: "bg-warning",
      text: "text-warning",
      dot: "bg-warning",
    },
    {
      key: "out",
      label: "Out",
      value: out,
      color: "bg-destructive",
      text: "text-destructive",
      dot: "bg-destructive",
    },
  ] as const;
  return (
    <section
      className="rounded-2xl border border-border/40 bg-card/60 p-5 shadow-sm shadow-black/5 backdrop-blur-sm sm:p-6"
      aria-label="Stock health"
    >
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Stock health
          </h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Bin actual_qty vs reorder level
          </p>
        </div>
        <Link
          href="/stock/stock-balance"
          className="text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
        >
          Open stock balance →
        </Link>
      </header>
      {isLoading ? (
        <SkeletonLine className="h-3 w-full" />
      ) : total === 0 ? (
        <Empty
          title="No stock configured"
          description="Set reorder levels on your Items to see stock health."
        />
      ) : (
        <>
          {/* Stacked bar */}
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-secondary/40"
            role="presentation"
          >
            {segs.map((s) => {
              const v = s.value ?? 0;
              const pct = (v / total) * 100;
              if (pct <= 0) return null;
              return (
                <motion.div
                  key={s.key}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className={cn("h-full", s.color)}
                />
              );
            })}
          </div>
          {/* Legend rows */}
          <ul className="mt-4 space-y-2">
            {segs.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                  {s.label}
                </span>
                {s.value === undefined ? (
                  <SkeletonLine className="h-3 w-10" />
                ) : (
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {s.value}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Empty state helper (used by the two list widgets above + future ones).
// ---------------------------------------------------------------------------
function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-secondary/10 px-4 py-6 text-center">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionableAlertsRail — sidebar version of the 2O Part 4.1 alerts,
// now sticky on the right of the Forward-look / KPI sections.
// ---------------------------------------------------------------------------

export interface AlertTile {
  label: string;
  cta: string;
  count: number | undefined;
  href: string;
  icon: LucideIcon;
  variant: "warning" | "info" | "default";
}

export function ActionableAlertsRail({ tiles }: { tiles: AlertTile[] }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <aside
      className="rounded-2xl border border-border/40 bg-card/60 p-5 shadow-sm shadow-black/5 backdrop-blur-sm sm:p-6 lg:sticky lg:top-4"
      aria-label="Actionable alerts"
    >
      <header className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TrendingDown className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Needs attention
        </h3>
      </header>
      <ul className="space-y-2">
        {tiles.map((t, i) => (
          <motion.li
            key={t.label}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 4 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
          >
            <AlertRow tile={t} />
          </motion.li>
        ))}
      </ul>
    </aside>
  );
}

function AlertRow({ tile }: { tile: AlertTile }) {
  return (
    <Link
      href={tile.href}
      className={cn(
        "group flex items-center justify-between gap-2 rounded-xl border border-border/30 bg-secondary/20 px-3 py-2.5 transition-all hover:border-primary/20 hover:bg-secondary/40",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            tile.variant === "warning"
              ? "bg-warning/15 text-warning"
              : tile.variant === "info"
                ? "bg-info/15 text-info"
                : "bg-muted text-muted-foreground",
          )}
        >
          <tile.icon className="h-3 w-3" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {tile.label}
          </p>
          <p className="truncate text-[9px] uppercase tracking-wider text-muted-foreground">
            {tile.cta}
          </p>
        </div>
      </div>
      {tile.count === undefined ? (
        <SkeletonLine className="h-4 w-6" />
      ) : (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
            tile.variant === "warning" && tile.count > 0
              ? "bg-destructive/15 text-destructive"
              : tile.variant === "info"
                ? "bg-info/15 text-info"
                : "bg-muted text-muted-foreground",
          )}
        >
          {tile.count}
        </span>
      )}
      <ArrowRight className="h-3 w-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// ProjectionStrip — the 3 forward-look tiles, now compact and
// laid out as a horizontal strip in the main column (next to the
// alerts rail). Same data, tighter chrome.
// ---------------------------------------------------------------------------

export interface ProjectionTile {
  label: string;
  basis: string;
  value: number | undefined;
  icon: LucideIcon;
  /** trend direction for the small icon next to the value. */
  trend?: "up" | "down" | "neutral";
}

export function ProjectionStrip({ tiles }: { tiles: ProjectionTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <ProjectionCard key={t.label} tile={t} />
      ))}
    </div>
  );
}

function ProjectionCard({ tile }: { tile: ProjectionTile }) {
  const TrendIcon =
    tile.trend === "down" ? TrendingDown : TrendingUp;
  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-4 shadow-sm shadow-black/5 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <tile.icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold text-foreground">{tile.label}</p>
        </div>
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
          Est.
        </span>
      </div>
      {tile.value === undefined ? (
        <SkeletonLine className="mt-2 h-6 w-24" />
      ) : (
        <p className="mt-2 flex items-baseline gap-1.5 text-xl font-bold tabular-nums text-foreground">
          {ETB.format(tile.value)}
          {tile.trend && (
            <TrendIcon
              className={cn(
                "h-3.5 w-3.5",
                tile.trend === "down"
                  ? "text-destructive"
                  : "text-success",
              )}
            />
          )}
        </p>
      )}
      <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
        {tile.basis}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModuleCard — unchanged in shape from 2O; we just promote the
// icon to a more prominent top-left gradient tile.
// ---------------------------------------------------------------------------

export interface ModuleCardData {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  count: number | undefined;
  countLabel: string;
  colorKey: "primary" | "info" | "success" | "warning" | "destructive";
}

const MODULE_COLOR_TOKENS: Record<
  ModuleCardData["colorKey"],
  { iconBg: string; iconText: string; ring: string; bar: string }
> = {
  primary: {
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    ring: "ring-primary/20",
    bar: "bg-primary",
  },
  info: {
    iconBg: "bg-info/10",
    iconText: "text-info",
    ring: "ring-info/20",
    bar: "bg-info",
  },
  success: {
    iconBg: "bg-success/10",
    iconText: "text-success",
    ring: "ring-success/20",
    bar: "bg-success",
  },
  warning: {
    iconBg: "bg-warning/10",
    iconText: "text-warning",
    ring: "ring-warning/20",
    bar: "bg-warning",
  },
  destructive: {
    iconBg: "bg-destructive/10",
    iconText: "text-destructive",
    ring: "ring-destructive/20",
    bar: "bg-destructive",
  },
};

export function ModuleCard({
  data,
  index,
  onSelect,
}: {
  data: ModuleCardData;
  index: number;
  onSelect: (href: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const color = MODULE_COLOR_TOKENS[data.colorKey];
  const isLoading = data.count === undefined;
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(data.href)}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3, delay: 0.1 + index * 0.04 }
      }
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 text-left shadow-sm shadow-black/5 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg sm:p-6"
    >
      {/* Top accent bar (always-on, color-keyed, 2px) */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100",
          color.bar,
        )}
      />
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110",
            color.iconBg,
            color.iconText,
            color.ring,
          )}
        >
          <data.icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        {data.title}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
        {data.description}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        {isLoading ? (
          <SkeletonLine className="h-6 w-12" />
        ) : (
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {data.count}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground">
          {data.countLabel}
        </span>
      </div>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// QuickCreateRow — a tighter version of the 2O CTA row; the labels
// shrink on small viewports via the existing `grid-cols-2` pattern.
// ---------------------------------------------------------------------------

export function QuickCreateRow({
  ctas,
  onSelect,
}: {
  ctas: { label: string; href: string }[];
  onSelect: (href: string) => void;
}) {
  return (
    <section
      className="rounded-2xl border border-border/40 bg-card/60 p-5 shadow-sm shadow-black/5 backdrop-blur-sm sm:p-6"
      aria-label="Quick create"
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Quick create</h3>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Common documents
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ctas.map((cta) => (
          <Button
            key={cta.label}
            variant="outline"
            className="h-10 rounded-xl text-xs font-medium"
            onClick={() => onSelect(cta.href)}
          >
            {cta.label}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
    </section>
  );
}

// Wallet re-export so the main file's icon import list stays short.
export { Wallet };
