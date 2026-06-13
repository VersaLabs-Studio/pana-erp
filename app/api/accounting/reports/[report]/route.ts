// app/api/accounting/reports/[report]/route.ts
// Obsidian ERP v4.0 — Financial Report Proxy (2N Part 3.1).
//
// Server-side proxy to Frappe's standard query-report runner. The client
// never talks to Frappe directly for reports — it calls this route, which
// resolves `company` from the active company, normalizes the period filter,
// and proxies to `frappe.desk.query_report.run` (the same runner the
// ERPNext desk uses for the standard reports).
//
// Why a proxy (and not a direct client call):
//   1. The `frappe-client.ts` `call` is a server-side singleton with the
//      admin API token; the browser should never see it.
//   2. The query-report runner returns raw Frappe `columns` + `result` with
//      the doctype metadata the desk uses; we normalize to a typed shape
//      the UI can render without re-parsing.
//   3. Errors come back through the existing `frappeClient.handleError` so
//      failures surface as guided errors, not raw 500s.
//
// Supported `report` values (URL segment):
//   - `profit-and-loss`       → "Profit and Loss Statement"
//   - `balance-sheet`         → "Balance Sheet"
//   - `accounts-receivable`   → "Accounts Receivable"
//   - `accounts-payable`      → "Accounts Payable"

import { NextRequest, NextResponse } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { getActiveCompany } from "@/lib/settings/company";

// ---------------------------------------------------------------------------
// Report name mapping (URL key → Frappe report_name)
// ---------------------------------------------------------------------------
const REPORT_NAME_MAP: Record<string, string> = {
  "profit-and-loss": "Profit and Loss Statement",
  "balance-sheet": "Balance Sheet",
  "accounts-receivable": "Accounts Receivable",
  "accounts-payable": "Accounts Payable",
};

// ---------------------------------------------------------------------------
// Normalized response shape the UI consumes
// ---------------------------------------------------------------------------
export interface ReportColumn {
  fieldname: string;
  label: string;
  fieldtype: string;
  options?: string;
  width?: number;
}

export interface ReportRow {
  /** Cell values keyed by column fieldname. */
  [fieldname: string]: string | number | boolean | null | undefined;
  /** Optional: account name (for indented financial statements) */
  account?: string;
  /** Optional: account indent level (0 = root) */
  indent?: number;
  /** Optional: parent account (for tree reports) */
  parent_account?: string;
  /** Optional: bold/total flag */
  is_total?: boolean;
  /** Optional: aging bucket (0-30, 31-60, etc.) */
  aging_bucket?: string;
}

export interface ReportResponse {
  report_name: string;
  columns: ReportColumn[];
  result: ReportRow[];
  /** Period metadata echoed back to the UI */
  period: {
    company: string;
    from_date?: string;
    to_date?: string;
    fiscal_year?: string;
    periodicity?: string;
  };
  /** When the report returned an empty result (no data for the period) */
  empty: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pickPeriod(searchParams: URLSearchParams) {
  return {
    company: searchParams.get("company") ?? getActiveCompany(),
    from_date: searchParams.get("from_date") ?? undefined,
    to_date: searchParams.get("to_date") ?? undefined,
    fiscal_year: searchParams.get("fiscal_year") ?? undefined,
    periodicity: searchParams.get("periodicity") ?? undefined,
  };
}

function buildReportFilters(period: ReturnType<typeof pickPeriod>): Record<string, unknown> {
  const filters: Record<string, unknown> = { company: period.company };
  if (period.from_date) filters.from_date = period.from_date;
  if (period.to_date) filters.to_date = period.to_date;
  if (period.fiscal_year) filters.fiscal_year = period.fiscal_year;
  if (period.periodicity) filters.periodicity = period.periodicity;
  return filters;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ report: string }> },
) {
  const { report: reportKey } = await params;
  const reportName = REPORT_NAME_MAP[reportKey];

  if (!reportName) {
    return NextResponse.json(
      {
        success: false,
        error: "Unknown report",
        details: `Report '${reportKey}' is not supported. Supported: ${Object.keys(REPORT_NAME_MAP).join(", ")}`,
        statusCode: 404,
      },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const period = pickPeriod(searchParams);
  const filters = buildReportFilters(period);

  try {
    // Frappe's query_report.run returns:
    //   { result: { columns: [...], result: [...], message?, chart? } }
    // Pass filters as a JSON string per Frappe's wire format.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await (frappeClient.call as any).get(
      "frappe.desk.query_report.run",
      {
        report_name: reportName,
        filters: JSON.stringify(filters),
      },
    );

    const inner = raw?.result ?? raw?.message ?? raw ?? {};
    const columns: ReportColumn[] = (inner.columns ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => ({
        fieldname: c.fieldname ?? c.field ?? c.label ?? "",
        label: c.label ?? c.fieldname ?? "",
        fieldtype: c.fieldtype ?? "Data",
        options: c.options,
        width: c.width,
      }),
    );
    // Frappe report result rows are arrays (positional) — map them to
    // objects keyed by column fieldname for the UI.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: ReportRow[] = (inner.result ?? []).map((row: any) => {
      if (Array.isArray(row)) {
        const obj: ReportRow = {};
        columns.forEach((col, i) => {
          obj[col.fieldname] = row[i] ?? null;
        });
        return obj;
      }
      // Already an object (some Frappe versions) — pass through.
      return row as ReportRow;
    });

    const body: ReportResponse = {
      report_name: reportName,
      columns,
      result,
      period,
      empty: result.length === 0,
    };

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    const errorResponse = frappeClient.handleError(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode ?? 500,
    });
  }
}
