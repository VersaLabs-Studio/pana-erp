// app/accounting/reports/profit-and-loss/page.tsx
// Obsidian ERP v4.0 — Profit & Loss Statement (2N Part 3.2).

"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { FinancialReportView } from "@/components/accounting/FinancialReportView";
import {
  useFrappeReport,
  type ReportFilters,
} from "@/hooks/accounting/use-frappe-report";

const PERIOD_PRESETS = (() => {
  const now = new Date();
  const year = now.getFullYear();
  return [
    { label: "This month", from_date: `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, to_date: now.toISOString().split("T")[0] },
    { label: "This year", from_date: `${year}-01-01`, to_date: `${year}-12-31` },
    { label: "Last year", from_date: `${year - 1}-01-01`, to_date: `${year - 1}-12-31` },
  ];
})();

export default function ProfitAndLossPage() {
  const [period] = useState(PERIOD_PRESETS[1]);
  const filters: ReportFilters = {
    from_date: period.from_date,
    to_date: period.to_date,
  };
  const { data, isLoading, error } = useFrappeReport("profit-and-loss", filters);

  return (
    <FinancialReportView
      title="Profit & Loss"
      subtitle="Revenue, costs, and net profit for the period."
      icon={TrendingUp}
      reportKey="profit-and-loss"
      data={data}
      isLoading={isLoading}
      error={error}
      indented
    />
  );
}
