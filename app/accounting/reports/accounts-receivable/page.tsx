// app/accounting/reports/accounts-receivable/page.tsx
// Obsidian ERP v4.0 — Accounts Receivable (2N Part 3.2).

"use client";

import { ArrowDownLeft } from "lucide-react";
import { FinancialReportView } from "@/components/accounting/FinancialReportView";
import { useFrappeReport, type ReportFilters } from "@/hooks/accounting/use-frappe-report";

export default function AccountsReceivablePage() {
  const filters: ReportFilters = {};
  const { data, isLoading, error } = useFrappeReport(
    "accounts-receivable",
    filters,
  );

  return (
    <FinancialReportView
      title="Accounts Receivable"
      subtitle="Outstanding customer invoices with aging buckets."
      icon={ArrowDownLeft}
      reportKey="accounts-receivable"
      data={data}
      isLoading={isLoading}
      error={error}
      showAgingBuckets
    />
  );
}
