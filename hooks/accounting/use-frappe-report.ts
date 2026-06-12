// hooks/accounting/use-frappe-report.ts
// Obsidian ERP v4.0 — Financial Report Query Hook (2N Part 3.2).
//
// Thin TanStack Query wrapper over the `/api/accounting/reports/[report]`
// route. The UI calls this and renders `data.columns` + `data.result`.
// Period/company filters are passed as URL search params; the route
// resolves the active company on the server.

"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  ReportResponse,
} from "@/app/api/accounting/reports/[report]/route";

export type ReportKey =
  | "profit-and-loss"
  | "balance-sheet"
  | "accounts-receivable"
  | "accounts-payable";

export interface ReportFilters {
  from_date?: string;
  to_date?: string;
  fiscal_year?: string;
  periodicity?: string;
  company?: string;
}

function buildQueryString(filters?: ReportFilters): string {
  if (!filters) return "";
  const sp = new URLSearchParams();
  if (filters.company) sp.set("company", filters.company);
  if (filters.from_date) sp.set("from_date", filters.from_date);
  if (filters.to_date) sp.set("to_date", filters.to_date);
  if (filters.fiscal_year) sp.set("fiscal_year", filters.fiscal_year);
  if (filters.periodicity) sp.set("periodicity", filters.periodicity);
  return sp.toString();
}

/**
 * Fetch a financial report from the server-side proxy route.
 *
 * @example
 *   const { data, isLoading } = useFrappeReport("profit-and-loss", {
 *     from_date: "2026-01-01",
 *     to_date: "2026-12-31",
 *   });
 */
export function useFrappeReport(
  report: ReportKey,
  filters?: ReportFilters,
  queryOptions?: Omit<
    UseQueryOptions<ReportResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const qs = buildQueryString(filters);
  return useQuery<ReportResponse, Error>({
    queryKey: ["accounting-report", report, filters],
    queryFn: async (): Promise<ReportResponse> => {
      const url = `/api/accounting/reports/${report}${qs ? `?${qs}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        const details =
          typeof json.details === "string"
            ? json.details
            : JSON.stringify(json.details);
        throw new Error(details || `Failed to load ${report} report`);
      }
      return json.data as ReportResponse;
    },
    // Reports are stable for a given period — let them cache for 5 min.
    staleTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

export default useFrappeReport;
