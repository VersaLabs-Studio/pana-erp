// components/dashboard/chart-primitives.tsx
// Obsidian ERP v4.0 - Shared chart primitives (B remap).
//
// The 6 module hubs + this dashboard each re-implement the same
// recharts boilerplate (Tooltip contentStyle, Y-axis k-formatter,
// gridline opacity, dot radius, currency formatting, glass
// card chrome). The B remap extracts the most common bits into
// one place so the dashboard upgrade doesn't carry 5 copies of
// the same Tooltip config. Hub pages can adopt these as a
// follow-up — out of scope here.
//
// Premium-UI: OKLCH tokens only, dual-theme, 375px-friendly.

"use client";

import { cn } from "@/lib/utils";
import { Inbox, type LucideIcon } from "lucide-react";
import type { ContentType } from "recharts/types/component/Tooltip";

/**
 * Chart colors — the Tailwind v4 OKLCH design tokens.
 *
 * IMPORTANT: the tokens are `--color-*` (Tailwind v4 `@theme`), NOT
 * `--*`, and each is a full `oklch()` color. Reference them DIRECTLY —
 * never wrapped in `hsl()`. The old `hsl(var(--primary))` referenced an
 * undefined variable inside the wrong color function, so every chart
 * fill/stroke resolved to an invalid color and SVG fell back to black.
 * For an alpha tint, use `color-mix(in oklch, <token> N%, transparent)`.
 */
export const CHART_COLORS = {
  primary: "var(--color-primary)",
  info: "var(--color-info)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  destructive: "var(--color-destructive)",
  border: "var(--color-border)",
  mutedForeground: "var(--color-muted-foreground)",
  popover: "var(--color-popover)",
  foreground: "var(--color-foreground)",
  background: "var(--color-background)",
  muted: "var(--color-muted)",
} as const;

/**
 * Recharts `contentStyle` for a glass tooltip that respects the
 * design-system popover tokens. Apply as:
 *
 *   <Tooltip contentStyle={tooltipContentStyle} formatter={formatETB} />
 */
export const tooltipContentStyle: React.CSSProperties = {
  background: CHART_COLORS.popover,
  border: `1px solid color-mix(in oklch, ${CHART_COLORS.border} 40%, transparent)`,
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 10px",
  boxShadow: `0 6px 24px -8px color-mix(in oklch, ${CHART_COLORS.foreground} 15%, transparent)`,
};

/**
 * Compact k/M formatter for chart Y-axes. Anything ≥ 1M renders
 * `1.2M`, anything ≥ 1k renders `12k`, otherwise the raw number.
 * Use with `tickFormatter` on `<YAxis>`.
 */
export function axisKFormat(v: number): string {
  if (!Number.isFinite(v)) return String(v);
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

/**
 * Standard axis tick props (OKLCH muted-foreground, no axis line,
 * no tick line, tiny font). Apply to every XAxis + YAxis.
 *
 * NOTE: recharts `tick` expects `SVGProps<SVGTextElement>` for a
 * direct render, NOT a `React.CSSProperties`. The shape below is
 * the actual SVG attribute object (not CSS) — recharts passes it
 * to a <text> element. Treated as `Record<string, unknown>` to
 * dodge the strict SVGProps generic which has an
 * `alignmentBaseline` mismatch with our CSS-style values.
 */
export const axisTickStyle: Record<string, unknown> = {
  fontSize: 10,
  fill: CHART_COLORS.mutedForeground,
};

/**
 * Subtle gridline style (3 3 dash, low opacity, OKLCH border token).
 * CartesianGrid accepts partial SVGProps, so we cast through
 * `Record<string, unknown>` to avoid the recharts CartesianGrid
 * requiring a specific SVGElement type.
 */
export const gridLineStyle: Record<string, unknown> = {
  strokeDasharray: "3 3",
  stroke: CHART_COLORS.border,
  opacity: 0.4,
};

/**
 * Glass-card chrome for a chart container. Replaces the inline
 * "rounded-2xl border border-border/40 bg-card p-5 shadow-sm
 * shadow-black/5 sm:p-6" copy across 5+ files.
 */
export function ChartCard({
  title,
  subtitle,
  className,
  toolbar,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/40 bg-card/60 p-5 shadow-sm shadow-black/5 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {toolbar && <div className="shrink-0">{toolbar}</div>}
      </header>
      {children}
    </section>
  );
}

/**
 * Graceful empty state for a chart whose data hasn't materialized yet
 * (a brand-new tenant, or a period with no posted documents). Renders
 * INSIDE a ChartCard in place of the chart body — same height — so the
 * card never collapses into hollow axes. "Simple but graceful": a
 * muted glyph + one honest line, no fake zero-bars.
 */
export function ChartEmpty({
  message,
  icon: Icon = Inbox,
  height = 224,
}: {
  message: string;
  icon?: LucideIcon;
  height?: number;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-center"
      style={{ height }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/40">
        <Icon className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <p className="max-w-[14rem] text-xs leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
