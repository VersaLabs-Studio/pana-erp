// app/accounting/reports/accounts-payable/page.tsx
// Obsidian ERP v4.0 — Accounts Payable (2N Part 3.2).

"use client";

import { ArrowUpRight } from "lucide-react";
import { FinancialReportView } from "@/components/accounting/FinancialReportView";
import { useFrappeReport, type ReportFilters } from "@/hooks/accounting/use-frappe-report";

export default function AccountsPayablePage() {
  const filters: ReportFilters = {};
  const { data, isLoading, error } = useFrappeReport(
    "accounts-payable",
    filters,
  );

  return (
    <FinancialReportView
      title="Accounts Payable"
      subtitle="Outstanding supplier bills with aging buckets."
      icon={ArrowUpRight}
      reportKey="accounts-payable"
      data={data}
      isLoading={isLoading}
      error={error}
      showAgingBuckets
    />
  );
}
