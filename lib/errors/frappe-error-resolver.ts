// lib/errors/frappe-error-resolver.ts
// Obsidian ERP v4.0 — Server-Error Guided Resolution
// B5: No raw Frappe error may reach the user as a toast.
// All errors pass through resolveFrappeError → typed Resolution.
// Each future phase adds strategies as it meets new error classes.

export interface ResolutionAction {
  label: string;
  kind: "navigate" | "prefill" | "mutate" | "dismiss";
  variant?: "default" | "secondary" | "ghost";
  run: () => void | Promise<void>;
}

export interface Resolution {
  code: string;
  title: string;
  explanation: string;
  details?: string[];
  severity: "warning" | "error";
  actions: ResolutionAction[];
}

// ---------------------------------------------------------------------------
// Strategy: a regex/keyword signature + a resolver function
// ---------------------------------------------------------------------------
interface ErrorStrategy {
  code: string;
  match: (msg: string) => boolean;
  resolve: (
    msg: string,
    ctx: { doctype: string; values?: unknown },
  ) => Omit<Resolution, "code">;
}

// ---------------------------------------------------------------------------
// Known strategies (ordered — first match wins)
// ---------------------------------------------------------------------------
const strategies: ErrorStrategy[] = [
  // INSUFFICIENT_STOCK
  {
    code: "INSUFFICIENT_STOCK",
    match: (m) =>
      /units?\s+of\s+.+\s+needed\s+in\s+Warehouse/i.test(m) ||
      /insufficient\s+stock/i.test(m),
    resolve: (msg, ctx) => {
      // Parse: "1.0 units of Item P-001: Raw Paper needed in Warehouse Stores - P"
      const itemMatch = msg.match(
        /units?\s+of\s+(?:Item\s+)?(.+?)(?:\s+needed|\s+:\s+)/i,
      );
      const qtyMatch = msg.match(/([\d.]+)\s+units?/i);
      const whMatch = msg.match(/Warehouse\s+(.+?)(?:\s+to\s+complete|$)/i);

      const rawItem = itemMatch?.[1]?.trim() ?? "Unknown item";
      const qty = qtyMatch?.[1] ?? "?";
      const warehouse = whMatch?.[1]?.trim() ?? "unknown warehouse";

      const [itemCode, itemName] = rawItem.includes(": ")
        ? rawItem.split(": ", 2)
        : [rawItem, rawItem];

      return {
        title: "Not enough stock to deliver",
        explanation: `You need ${qty} more units of ${itemCode} in ${warehouse} to complete this transaction.`,
        details: [
          `Item: ${itemCode}`,
          `Short by: ${qty} units`,
          `Warehouse: ${warehouse}`,
        ],
        severity: "warning",
        actions: [
          {
            label: "Create Material Request",
            kind: "prefill",
            variant: "default",
            run: () => {
              const params = new URLSearchParams({
                item_code: itemCode,
                item_name: itemName || itemCode,
                qty: qty,
                warehouse: warehouse,
              });
              window.location.href = `/stock/material-request/new?${params.toString()}`;
            },
          },
          {
            label: "Reduce quantity",
            kind: "dismiss",
            variant: "secondary",
            run: () => {},
          },
          {
            label: "Dismiss",
            kind: "dismiss",
            variant: "ghost",
            run: () => {},
          },
        ],
      };
    },
  },

  // MANDATORY_MISSING
  {
    code: "MANDATORY_MISSING",
    match: (m) =>
      /is mandatory/i.test(m) ||
      /Mandatory\s+fields?\s+required/i.test(m) ||
      /missing\s+required/i.test(m),
    resolve: (msg) => {
      // Try to extract field name
      const fieldMatch = msg.match(/(?:Field\s+)?['"]?(.+?)['"]?\s+is mandatory/i);
      const field = fieldMatch?.[1] ?? "A required field";

      return {
        title: "Missing required information",
        explanation: `${field} is required before you can continue. Please fill it in and try again.`,
        details: [`Field: ${field}`],
        severity: "warning",
        actions: [
          {
            label: "Go to field",
            kind: "prefill",
            variant: "default",
            run: () => {
              // The page-level handler focuses the specific field
            },
          },
          {
            label: "Dismiss",
            kind: "dismiss",
            variant: "ghost",
            run: () => {},
          },
        ],
      };
    },
  },

  // LINK_VALIDATION
  {
    code: "LINK_VALIDATION",
    match: (m) =>
      /Could not find/i.test(m) || /not found/i.test(m) || /does not exist/i.test(m),
    resolve: (msg) => {
      const linkMatch = msg.match(
        /Could not find ['"]?(.+?)['"]?(?:;|\.|$)/i,
      );
      const link = linkMatch?.[1] ?? "The referenced record";

      return {
        title: "Record not found",
        explanation: `${link} could not be found. It may have been deleted or you may need to create it first.`,
        details: [`Missing: ${link}`],
        severity: "error",
        actions: [
          {
            label: "Pick another",
            kind: "dismiss",
            variant: "default",
            run: () => {},
          },
          {
            label: "Dismiss",
            kind: "dismiss",
            variant: "ghost",
            run: () => {},
          },
        ],
      };
    },
  },

  // DUPLICATE
  {
    code: "DUPLICATE",
    match: (m) =>
      /Duplicate/i.test(m) || /already exists/i.test(m),
    resolve: (msg) => {
      const dupMatch = msg.match(/['"]?(.+?)['"]?\s+already exists/i);
      const existing = dupMatch?.[1] ?? "A record with these details";

      return {
        title: "Duplicate entry",
        explanation: `${existing} already exists. You can open the existing record or change your entry to avoid the conflict.`,
        details: [`Existing: ${existing}`],
        severity: "warning",
        actions: [
          {
            label: "Open existing",
            kind: "navigate",
            variant: "default",
            run: () => {},
          },
          {
            label: "Change entry",
            kind: "dismiss",
            variant: "secondary",
            run: () => {},
          },
          {
            label: "Dismiss",
            kind: "dismiss",
            variant: "ghost",
            run: () => {},
          },
        ],
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function resolveFrappeError(
  err: unknown,
  ctx: { doctype: string; values?: unknown },
): Resolution {
  const rawMessage =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "An unexpected error occurred";

  // Try each strategy in order
  for (const strategy of strategies) {
    if (strategy.match(rawMessage)) {
      return { code: strategy.code, ...strategy.resolve(rawMessage, ctx) };
    }
  }

  // GENERIC_FALLBACK
  return {
    code: "GENERIC_FALLBACK",
    title: "Something went wrong",
    explanation:
      "The server rejected this action. See the technical details below or try again.",
    details: [rawMessage],
    severity: "error",
    actions: [
      {
        label: "Dismiss",
        kind: "dismiss",
        variant: "ghost",
        run: () => {},
      },
    ],
  };
}

/**
 * Get all known strategy codes (for testing).
 */
export const KNOWN_ERROR_CODES = strategies.map((s) => s.code);
