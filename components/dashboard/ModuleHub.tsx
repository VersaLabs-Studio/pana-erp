// components/dashboard/ModuleHub.tsx
// Obsidian ERP v4.0 — Generic Module Hub layout (master §4.1).
//
// 2N Part 2.2: shared shell for the 6 module hubs (`/crm`, `/sales`,
// `/stock`, `/manufacturing`, `/buying`, `/accounting`). Each hub page
// supplies: title, subtitle, KPI tiles, quick actions, recent docs, and
// optional alerts. This component renders the B1 chrome + staggered
// entrance and exposes a uniform shape so a future AI Assistant / data
// tool can reason about the layout.
//
// Premium-UI: OKLCH semantic tokens, B1 cards, reduced-motion safe,
// dual-theme, 375px-friendly.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, type LucideIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SkeletonLine } from "@/components/ui/skeleton";
import { KPICard } from "@/components/dashboard/KPICard";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------
export interface HubKpi {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  href?: string;
}

export interface HubAction {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  primary?: boolean;
}

export interface HubRecentItem {
  name: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  href: string;
  timestamp?: string;
}

export interface HubAlert {
  label: string;
  count: number | undefined;
  href: string;
  variant?: "warning" | "info" | "default";
}

interface ModuleHubProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  primaryAction?: { label: string; href: string };
  kpis: HubKpi[];
  actions: HubAction[];
  recent: HubRecentItem[];
  recentTitle?: string;
  alerts?: HubAlert[];
  alertsTitle?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ModuleHub({
  title,
  subtitle,
  icon: Icon,
  primaryAction,
  kpis,
  actions,
  recent,
  recentTitle = "Recent",
  alerts,
  alertsTitle = "Alerts",
}: ModuleHubProps) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {primaryAction && (
          <Button
            className="rounded-full"
            onClick={() => router.push(primaryAction.href)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> {primaryAction.label}
          </Button>
        )}
      </motion.div>

      {/* KPI row */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label={`${title} KPIs`}
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3, delay: i * 0.05 }
            }
          >
            <KPICard
              title={kpi.title}
              value={kpi.value ?? "—"}
              icon={kpi.icon}
              variant={kpi.variant ?? "default"}
            />
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick actions (left, 2/3) */}
        <section className="lg:col-span-2" aria-label="Quick actions">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Quick actions
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={
                  prefersReducedMotion ? {} : { opacity: 0, y: 8 }
                }
                animate={
                  prefersReducedMotion ? {} : { opacity: 1, y: 0 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.25, delay: 0.1 + i * 0.04 }
                }
              >
                <Link
                  href={action.href}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border p-4 transition-all hover:border-primary/20 hover:shadow-md",
                    action.primary
                      ? "border-primary/30 bg-primary/5 shadow-sm shadow-primary/5"
                      : "border-border/40 bg-card shadow-sm shadow-black/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      action.primary
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {action.label}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Right column — Alerts + Recent */}
        <aside className="space-y-6">
          {alerts && alerts.length > 0 && (
            <section
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm shadow-black/5"
              aria-label={alertsTitle}
            >
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {alertsTitle}
              </h2>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Link
                    key={alert.label}
                    href={alert.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border/20 bg-secondary/20 px-3 py-2.5 transition-all hover:border-primary/20 hover:bg-secondary/40"
                  >
                    <span className="truncate text-xs font-medium text-foreground">
                      {alert.label}
                    </span>
                    {alert.count === undefined ? (
                      <SkeletonLine className="h-4 w-6" />
                    ) : (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                          alert.variant === "warning" && alert.count > 0
                            ? "bg-warning/15 text-warning"
                            : alert.variant === "info"
                              ? "bg-info/15 text-info"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {alert.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section
            className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm shadow-black/5"
            aria-label={recentTitle}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {recentTitle}
              </h2>
            </div>
            {recent.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent documents
              </div>
            ) : (
              <ul className="space-y-1">
                {recent.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                          {item.name}
                        </p>
                        {item.subtitle && (
                          <p className="truncate text-[10px] text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            item.badgeVariant === "destructive" &&
                              "bg-destructive/15 text-destructive",
                            item.badgeVariant === "secondary" &&
                              "bg-secondary text-secondary-foreground",
                            (!item.badgeVariant ||
                              item.badgeVariant === "default") &&
                              "bg-primary/10 text-primary",
                            item.badgeVariant === "outline" &&
                              "border border-border/40 text-muted-foreground",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
