// components/dashboard/KPICard.tsx
// Obsidian ERP v4.0 - KPI Metric Card with inline sparkline + trend badge.
//
// 2N Part 2.1 baseline (no sparkline, single trend badge).
// 2P-FINAL remap (this commit) — adds an inline mini AreaChart
// sparkline (`data`, optional) under the value + a "Δ vs. last
// month" trend badge (replaces the older "up/down/neutral" +
// "trendValue" combo — kept for back-compat with the 6 module
// hubs that pass `trend`/`trendValue` instead of the new
// `previousValue`-derived auto-trend). The new prop set is
// additive — the older props still work for the hubs that use
// them via the DashboardShell.
//
// Premium-UI: OKLCH tokens, B1 cards, reduced-motion safe,
// dual-theme, 375px-friendly.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  /** KPI title */
  title: string;
  /** KPI value (formatted by the caller) */
  value: string | number;
  /** Previous-period value (for auto trend). When supplied we
   *  derive trend + percentage automatically. */
  previousValue?: string | number;
  /** Manual trend (older API; takes precedence if supplied). */
  trend?: "up" | "down" | "neutral";
  /** Manual trend percentage label (older API). */
  trendValue?: string;
  /** Icon */
  icon?: LucideIcon;
  /** Color variant */
  variant?: "default" | "success" | "warning" | "danger" | "info";
  /** Whether data is loading */
  isLoading?: boolean;
  /** Optional sparkline data (1-N numbers). When present, renders
   *  a thin AreaChart under the value. The card auto-scales. */
  sparkline?: number[];
  /** Sparkline accent color. Defaults to the variant. */
  sparklineColor?: string;
  /** Optional sub-label rendered under the title (e.g. "this month"). */
  sub?: string;
  /** Optional href to wrap the card in a Link. */
  href?: string;
  /** Additional CSS classes */
  className?: string;
}

const VARIANT_TONE: Record<
  NonNullable<KPICardProps["variant"]>,
  { ring: string; chip: string; chipText: string; sparkline: string }
> = {
  default: {
    ring: "ring-primary/15",
    chip: "bg-primary/10",
    chipText: "text-primary",
    // Tailwind v4 OKLCH token referenced directly (NOT hsl(var(--…)),
    // which pointed at an undefined variable → black sparkline).
    sparkline: "var(--color-primary)",
  },
  success: {
    ring: "ring-success/15",
    chip: "bg-success/10",
    chipText: "text-success",
    sparkline: "var(--color-success)",
  },
  warning: {
    ring: "ring-warning/15",
    chip: "bg-warning/10",
    chipText: "text-warning",
    sparkline: "var(--color-warning)",
  },
  danger: {
    ring: "ring-destructive/15",
    chip: "bg-destructive/10",
    chipText: "text-destructive",
    sparkline: "var(--color-destructive)",
  },
  info: {
    ring: "ring-info/15",
    chip: "bg-info/10",
    chipText: "text-info",
    sparkline: "var(--color-info)",
  },
};

/**
 * KPICard — Dashboard metric card with optional inline sparkline.
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="Revenue (this month)"
 *   value="ETB 1,234,567"
 *   previousValue={monthSalesSixMonthsAgo}
 *   icon={TrendingUp}
 *   variant="default"
 *   sparkline={[100, 120, 150, 130, 180, 200]}
 * />
 * ```
 */
export function KPICard({
  title,
  value,
  previousValue,
  trend,
  trendValue,
  icon: Icon,
  variant = "default",
  isLoading,
  sparkline,
  sparklineColor,
  sub,
  href,
  className,
}: KPICardProps) {
  const prefersReducedMotion = useReducedMotion();
  const tone = VARIANT_TONE[variant];
  const sparklineStroke = sparklineColor ?? tone.sparkline;
  const sparklineFill = `url(#kpiSpark-${variant})`;

  // -- Auto trend derivation from `previousValue` ---------------------------
  let autoTrend: "up" | "down" | "neutral" = "neutral";
  let autoDeltaLabel: string | null = null;
  if (
    trend === undefined &&
    typeof value === "number" &&
    typeof previousValue === "number" &&
    previousValue !== 0
  ) {
    const delta = ((value - previousValue) / Math.abs(previousValue)) * 100;
    if (Math.abs(delta) < 0.5) {
      autoTrend = "neutral";
    } else if (delta > 0) {
      autoTrend = "up";
    } else {
      autoTrend = "down";
    }
    const sign = delta > 0 ? "+" : "";
    autoDeltaLabel = `${sign}${delta.toFixed(1)}%`;
  }
  // -- Manual trend takes precedence ---------------------------------------
  const effectiveTrend = trend ?? autoTrend;
  const effectiveLabel = trendValue ?? autoDeltaLabel;
  const TrendIcon =
    effectiveTrend === "up"
      ? TrendingUp
      : effectiveTrend === "down"
        ? TrendingDown
        : Minus;
  const trendText =
    effectiveTrend === "up"
      ? "text-success"
      : effectiveTrend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  // -- Sparkline data shape (recharts wants { v: number }[]) -------------
  const sparkData =
    sparkline && sparkline.length > 0
      ? sparkline.map((v, i) => ({ i, v }))
      : null;

  // -- Loading skeleton ----------------------------------------------------
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/40 bg-card/60 p-4 shadow-sm shadow-black/5 sm:p-5",
          className,
        )}
        aria-busy
        aria-label={`${title} loading`}
      >
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-3 h-7 w-32 animate-pulse rounded bg-muted" />
        {sparkData && (
          <div className="mt-3 h-10 w-full animate-pulse rounded bg-muted/60" />
        )}
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // -- Render --------------------------------------------------------------
  const cardInner = (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group rounded-2xl border border-border/40 bg-card/60 p-4 shadow-sm shadow-black/5 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-md sm:p-5",
        href && "cursor-pointer",
        className,
      )}
    >
      {/* Title + Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {sub && (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
              {sub}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1",
              tone.chip,
              tone.chipText,
              tone.ring,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Value + trend */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        {effectiveLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              tone.chip,
              trendText,
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {effectiveLabel}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && (
        <div className="mt-2 h-10 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sparkData}
              margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`kpiSpark-${variant}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={sparklineStroke}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={sparklineStroke}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparklineStroke}
                strokeWidth={1.5}
                fill={sparklineFill}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={400}
                dot={false}
                activeDot={{ r: 3, fill: sparklineStroke }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardInner}
      </a>
    );
  }
  return cardInner;
}
