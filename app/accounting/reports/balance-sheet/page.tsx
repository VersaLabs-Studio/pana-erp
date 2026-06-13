// app/accounting/reports/balance-sheet/page.tsx
// Obsidian ERP v4.0 — Balance Sheet (2N Part 3.2).

"use client";

import { Scale } from "lucide-react";
import { FinancialReportView } from "@/components/accounting/FinancialReportView";
import { useFrappeReport, type ReportFilters } from "@/hooks/accounting/use-frappe-report";

export default function BalanceSheetPage() {
  const filters: ReportFilters = { periodicity: "Yearly" };
  const { data, isLoading, error } = useFrappeReport("balance-sheet", filters);

  return (
    <FinancialReportView
      title="Balance Sheet"
      subtitle="Assets, liabilities, and equity as of today."
      icon={Scale}
      reportKey="balance-sheet"
      data={data}
      isLoading={isLoading}
      error={error}
      indented
    />
  );
}
