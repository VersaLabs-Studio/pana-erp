// components/accounting/FinancialReportView.tsx
// Obsidian ERP v4.0 — Financial Report Layout (2N Part 3.2).
//
// Shared shell for the 4 financial report pages (P&L, BS, AR, AP). Renders
// a period/company selector, a financial-statement table with totals row,
// and an Export (CSV) action. P&L and BS render an indented account tree
// with `is_total` rows bolded; AR/AP render aging buckets (0-30 / 31-60 /
// 61-90 / 90+).
//
// Premium-UI: OKLCH semantic tokens, B1 cards, staggered entrance,
// reduced-motion safe, dual-theme, 375px-friendly.

"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonLine } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  ReportColumn,
  ReportRow,
  ReportResponse,
} from "@/app/api/accounting/reports/[report]/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

function fmtAmount(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined || v === "" || typeof v === "boolean") return "—";
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return String(v);
  return ETB.format(n);
}

function exportCsv(filename: string, columns: ReportColumn[], rows: ReportRow[]) {
  const header = columns.map((c) => c.label).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const v = r[c.fieldname];
          if (v === null || v === undefined) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Period selector
// ---------------------------------------------------------------------------
interface PeriodOption {
  label: string;
  from_date?: string;
  to_date?: string;
  fiscal_year?: string;
  periodicity?: string;
}

const PERIOD_PRESETS: PeriodOption[] = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const yyyy = (n: number) => `${n}-01-01`;
  const yEnd = (n: number) => `${n}-12-31`;
  return [
    { label: "This month", from_date: `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, to_date: now.toISOString().split("T")[0] },
    { label: "This quarter", from_date: `${year}-${String(Math.floor(now.getMonth() / 3) * 3 + 1).padStart(2, "0")}-01`, to_date: now.toISOString().split("T")[0] },
    { label: "This year", from_date: yyyy(year), to_date: yEnd(year) },
    { label: "Last year", from_date: yyyy(year - 1), to_date: yEnd(year - 1) },
  ];
})();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export interface FinancialReportViewProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  reportKey: string;
  data: ReportResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  /** Optional: if true, render indented account tree (P&L, BS). */
  indented?: boolean;
  /** Optional: if true, render aging buckets column (AR, AP). */
  showAgingBuckets?: boolean;
}

export function FinancialReportView({
  title,
  subtitle,
  icon: Icon,
  reportKey,
  data,
  isLoading,
  error,
  indented = false,
  showAgingBuckets = false,
}: FinancialReportViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [period, setPeriod] = useState<PeriodOption>(PERIOD_PRESETS[0]);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Find the amount column (anything matching amount / debit / credit /
  // balance / total / value) and the label column (the first non-numeric
  // column). P&L / BS use "account" + "amount" by convention; AR / AP use
  // "party" + "outstanding_amount" / "invoice_amount".
  const layout = useMemo(() => {
    if (!data) return { labelKey: "account", amountKey: "amount", columns: [] as ReportColumn[] };
    const cols = data.columns;
    const labelCandidate = cols.find(
      (c) => /account|party|particulars|description/i.test(c.fieldname),
    );
    const amountCandidate = cols.find((c) =>
      /amount|balance|debit|credit|total|outstanding/i.test(c.fieldname),
    );
    return {
      labelKey: labelCandidate?.fieldname ?? cols[0]?.fieldname ?? "account",
      amountKey:
        amountCandidate?.fieldname ?? cols[cols.length - 1]?.fieldname ?? "amount",
      columns: cols,
    };
  }, [data]);

  // Toggle a row's children in the indented view.
  const toggleRow = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Total row = sum of amount column (Frappe already returns the
  // total/grand_total row when present; we just sum as a fallback).
  const totalAmount = useMemo(() => {
    if (!data) return 0;
    return data.result.reduce(
      (s, r) => s + (Number(r[layout.amountKey]) || 0),
      0,
    );
  }, [data, layout.amountKey]);

  return (
    <div className="space-y-6 pb-12">
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="relative">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowPeriodMenu((v) => !v)}
            >
              {period.label}
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            {showPeriodMenu && (
              <div
                className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-border/40 bg-popover/95 p-1 shadow-xl backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {PERIOD_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/60"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() =>
              data &&
              exportCsv(
                `${reportKey}-${period.from_date ?? "fy"}-${period.to_date ?? ""}.csv`,
                data.columns,
                data.result,
              )
            }
            disabled={!data || data.result.length === 0}
          >
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Period metadata */}
      {data && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-md border border-border/40 bg-secondary/20 px-2 py-0.5">
            Company: <strong className="text-foreground">{data.period.company}</strong>
          </span>
          {data.period.from_date && (
            <span className="rounded-md border border-border/40 bg-secondary/20 px-2 py-0.5">
              From: <strong className="text-foreground">{data.period.from_date}</strong>
            </span>
          )}
          {data.period.to_date && (
            <span className="rounded-md border border-border/40 bg-secondary/20 px-2 py-0.5">
              To: <strong className="text-foreground">{data.period.to_date}</strong>
            </span>
          )}
        </div>
      )}

      {/* Report body */}
      <section
        className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm shadow-black/5"
        aria-label={title}
      >
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLine key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">
            <strong>Failed to load report.</strong> {error.message}
          </div>
        ) : !data || data.empty ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
              ?
            </div>
            <p className="text-sm text-muted-foreground">
              No data for the selected period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/30 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  {indented && (
                    <th className="w-8 px-4 py-3" aria-label="Toggle" />
                  )}
                  <th className="px-4 py-3">{layout.columns.find((c) => c.fieldname === layout.labelKey)?.label ?? "Account"}</th>
                  {showAgingBuckets && (
                    <th className="px-4 py-3 text-right">0–30</th>
                  )}
                  {showAgingBuckets && (
                    <th className="px-4 py-3 text-right">31–60</th>
                  )}
                  {showAgingBuckets && (
                    <th className="px-4 py-3 text-right">61–90</th>
                  )}
                  {showAgingBuckets && (
                    <th className="px-4 py-3 text-right">90+</th>
                  )}
                  <th className="px-4 py-3 text-right">
                    {layout.columns.find((c) => c.fieldname === layout.amountKey)?.label ?? "Amount"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.result.map((row, i) => {
                  const labelVal = String(row[layout.labelKey] ?? "");
                  const amountVal = row[layout.amountKey];
                  const indent = Number(row.indent ?? 0);
                  const isTotal = Boolean(row.is_total);
                  const collapsedKey = `${row.parent_account ?? ""}/${labelVal}`;
                  const isCollapsed = collapsed.has(collapsedKey);
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/20 last:border-0",
                        isTotal && "bg-secondary/30 font-semibold",
                        !isTotal && indent > 0 && "text-muted-foreground",
                      )}
                    >
                      {indented && (
                        <td className="px-4 py-2.5 align-middle">
                          {indent > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleRow(collapsedKey)}
                              className="text-muted-foreground hover:text-foreground"
                              aria-label={
                                isCollapsed ? "Expand children" : "Collapse children"
                              }
                            >
                              {isCollapsed ? (
                                <ChevronRight className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </td>
                      )}
                      <td
                        className="px-4 py-2.5"
                        style={indented ? { paddingLeft: `${4 + indent * 16}px` } : undefined}
                      >
                        {labelVal || "(unlabeled)"}
                      </td>
                      {showAgingBuckets && (
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {fmtAmount(row["0-30"] ?? row["range1"])}
                        </td>
                      )}
                      {showAgingBuckets && (
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {fmtAmount(row["31-60"] ?? row["range2"])}
                        </td>
                      )}
                      {showAgingBuckets && (
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {fmtAmount(row["61-90"] ?? row["range3"])}
                        </td>
                      )}
                      {showAgingBuckets && (
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {fmtAmount(row["90+"] ?? row["range4"])}
                        </td>
                      )}
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums",
                          isTotal && "text-primary",
                        )}
                      >
                        {fmtAmount(amountVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border/40 bg-secondary/30 font-semibold">
                  <td
                    colSpan={indented ? 2 : 1 + (showAgingBuckets ? 4 : 0)}
                    className="px-4 py-3 text-foreground"
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-primary">
                    {fmtAmount(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
