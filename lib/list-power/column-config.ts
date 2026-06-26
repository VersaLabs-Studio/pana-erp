// lib/list-power/column-config.ts
// Obsidian ERP v4.0 - Column Configuration Helper for Enhanced List Pages

import type React from "react";

/**
 * A standalone column definition for list power features.
 * NOT extending @tanstack/react-table's ColumnDef (which is a complex union).
 * The EnhancedDataTable converts these to ColumnDef internally.
 */
export interface ListColumn<T> {
  /** Unique key matching the data field */
  key: string;
  /** Human-readable label */
  label: string;
  /** Whether this column is sortable server-side */
  sortable?: boolean;
  /** Whether this column is visible by default */
  defaultVisible?: boolean;
  /** Whether this column can be toggled visible/hidden */
  toggleable?: boolean;
  /** Category group for the column toggle UI */
  category?: "identity" | "financial" | "status" | "dates" | "progress" | "other";
  /** Custom cell renderer */
  cell?: (value: unknown, row: T, index: number) => React.ReactNode;
}

/**
 * A set of columns configured for a specific doctype list view.
 */
export interface ColumnConfig<T> {
  /** Doctype these columns are for */
  doctype: string;
  /** All available columns */
  columns: ListColumn<T>[];
  /** Default visible column keys (order matters for display) */
  defaultVisibleKeys: string[];
}

// ---------------------------------------------------------------------------
// Default column sets per doctype
// ---------------------------------------------------------------------------

export const SO_COLUMNS: ColumnConfig<Record<string, unknown>> = {
  doctype: "Sales Order",
  defaultVisibleKeys: ["name", "customer_name", "transaction_date", "delivery_date", "grand_total", "per_delivered", "per_billed", "status"],
  columns: [
    { key: "name", label: "Order #", sortable: true, defaultVisible: true, toggleable: false, category: "identity" },
    { key: "customer_name", label: "Customer", sortable: true, defaultVisible: true, toggleable: true, category: "identity" },
    { key: "transaction_date", label: "Order Date", sortable: true, defaultVisible: true, toggleable: true, category: "dates" },
    { key: "delivery_date", label: "Delivery Date", sortable: true, defaultVisible: true, toggleable: true, category: "dates" },
    { key: "grand_total", label: "Grand Total", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "per_delivered", label: "% Delivered", sortable: true, defaultVisible: true, toggleable: true, category: "progress" },
    { key: "per_billed", label: "% Billed", sortable: true, defaultVisible: true, toggleable: true, category: "progress" },
    { key: "status", label: "Status", sortable: true, defaultVisible: true, toggleable: true, category: "status" },
    { key: "company", label: "Company", sortable: true, defaultVisible: false, toggleable: true, category: "other" },
  ],
};

export const SI_COLUMNS: ColumnConfig<Record<string, unknown>> = {
  doctype: "Sales Invoice",
  defaultVisibleKeys: ["name", "customer_name", "posting_date", "grand_total", "outstanding_amount", "status"],
  columns: [
    { key: "name", label: "Invoice #", sortable: true, defaultVisible: true, toggleable: false, category: "identity" },
    { key: "customer_name", label: "Customer", sortable: true, defaultVisible: true, toggleable: true, category: "identity" },
    { key: "posting_date", label: "Date", sortable: true, defaultVisible: true, toggleable: true, category: "dates" },
    { key: "grand_total", label: "Grand Total", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "outstanding_amount", label: "Outstanding", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "status", label: "Status", sortable: true, defaultVisible: true, toggleable: true, category: "status" },
    { key: "company", label: "Company", sortable: true, defaultVisible: false, toggleable: true, category: "other" },
  ],
};

export const PI_COLUMNS: ColumnConfig<Record<string, unknown>> = {
  doctype: "Purchase Invoice",
  defaultVisibleKeys: ["name", "supplier_name", "posting_date", "grand_total", "outstanding_amount", "status"],
  columns: [
    { key: "name", label: "Invoice #", sortable: true, defaultVisible: true, toggleable: false, category: "identity" },
    { key: "supplier_name", label: "Supplier", sortable: true, defaultVisible: true, toggleable: true, category: "identity" },
    { key: "posting_date", label: "Date", sortable: true, defaultVisible: true, toggleable: true, category: "dates" },
    { key: "grand_total", label: "Grand Total", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "outstanding_amount", label: "Outstanding", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "status", label: "Status", sortable: true, defaultVisible: true, toggleable: true, category: "status" },
    { key: "company", label: "Company", sortable: true, defaultVisible: false, toggleable: true, category: "other" },
  ],
};

export const DN_COLUMNS: ColumnConfig<Record<string, unknown>> = {
  doctype: "Delivery Note",
  defaultVisibleKeys: ["name", "customer_name", "posting_date", "grand_total", "per_billed", "status"],
  columns: [
    { key: "name", label: "DN #", sortable: true, defaultVisible: true, toggleable: false, category: "identity" },
    { key: "customer_name", label: "Customer", sortable: true, defaultVisible: true, toggleable: true, category: "identity" },
    { key: "posting_date", label: "Date", sortable: true, defaultVisible: true, toggleable: true, category: "dates" },
    { key: "grand_total", label: "Grand Total", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "per_billed", label: "% Billed", sortable: true, defaultVisible: true, toggleable: true, category: "progress" },
    { key: "status", label: "Status", sortable: true, defaultVisible: true, toggleable: true, category: "status" },
    { key: "company", label: "Company", sortable: true, defaultVisible: false, toggleable: true, category: "other" },
  ],
};

export const QTN_COLUMNS: ColumnConfig<Record<string, unknown>> = {
  doctype: "Quotation",
  defaultVisibleKeys: ["name", "customer_name", "transaction_date", "grand_total", "status"],
  columns: [
    { key: "name", label: "Quotation #", sortable: true, defaultVisible: true, toggleable: false, category: "identity" },
    { key: "customer_name", label: "Customer", sortable: true, defaultVisible: true, toggleable: true, category: "identity" },
    { key: "transaction_date", label: "Date", sortable: true, defaultVisible: true, toggleable: true, category: "dates" },
    { key: "grand_total", label: "Grand Total", sortable: true, defaultVisible: true, toggleable: true, category: "financial" },
    { key: "status", label: "Status", sortable: true, defaultVisible: true, toggleable: true, category: "status" },
    { key: "company", label: "Company", sortable: true, defaultVisible: false, toggleable: true, category: "other" },
  ],
};

/**
 * Get a default column config for a given doctype.
 * Returns undefined if no default exists (caller builds custom columns).
 */
export function getDefaultColumnConfig(
  doctype: string
): ColumnConfig<Record<string, unknown>> | undefined {
  const map: Record<string, ColumnConfig<Record<string, unknown>>> = {
    "Sales Order": SO_COLUMNS,
    "Sales Invoice": SI_COLUMNS,
    "Purchase Invoice": PI_COLUMNS,
    "Delivery Note": DN_COLUMNS,
    "Quotation": QTN_COLUMNS,
  };
  return map[doctype];
}
