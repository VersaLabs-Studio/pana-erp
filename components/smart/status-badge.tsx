// components/smart/status-badge.tsx
// Obsidian ERP v4.0 - Auto-colored Status Badge Component
// Uses semantic OKLCH tokens only — no raw Tailwind color classes.

import { cn } from "@/lib/utils";

type Accent = "neutral" | "info" | "warning" | "success" | "danger";

/**
 * Accent → CSS class mapping using semantic tokens.
 */
const ACCENT_CLASSES: Record<Accent, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

/**
 * Status → accent mapping.
 */
const STATUS_ACCENT: Record<string, { accent: Accent; label: string }> = {
  // Document status (docstatus)
  draft: { accent: "neutral", label: "Draft" },
  submitted: { accent: "info", label: "Submitted" },
  cancelled: { accent: "danger", label: "Cancelled" },

  // Sales Order statuses
  "to deliver and bill": { accent: "warning", label: "To Deliver & Bill" },
  "to deliver": { accent: "warning", label: "To Deliver" },
  "to bill": { accent: "warning", label: "To Bill" },
  completed: { accent: "success", label: "Completed" },
  closed: { accent: "neutral", label: "Closed" },

  // Quotation statuses
  open: { accent: "info", label: "Open" },
  "partially ordered": { accent: "warning", label: "Partially Ordered" },
  ordered: { accent: "success", label: "Ordered" },
  lost: { accent: "danger", label: "Lost" },
  expired: { accent: "danger", label: "Expired" },

  // Material Request statuses
  pending: { accent: "warning", label: "Pending" },
  "partially received": { accent: "warning", label: "Partially Received" },
  received: { accent: "success", label: "Received" },
  issued: { accent: "success", label: "Issued" },
  transferred: { accent: "success", label: "Transferred" },
  stopped: { accent: "danger", label: "Stopped" },

  // Delivery Note
  "return": { accent: "danger", label: "Return" },
  "return issued": { accent: "danger", label: "Return Issued" },

  // Payment / Invoice
  unpaid: { accent: "warning", label: "Unpaid" },
  paid: { accent: "success", label: "Paid" },
  "partly paid": { accent: "warning", label: "Partly Paid" },
  overdue: { accent: "danger", label: "Overdue" },

  // Generic
  active: { accent: "success", label: "Active" },
  enabled: { accent: "success", label: "Enabled" },
  disabled: { accent: "neutral", label: "Disabled" },
  inactive: { accent: "neutral", label: "Inactive" },
  approved: { accent: "success", label: "Approved" },
  rejected: { accent: "danger", label: "Rejected" },
  "in progress": { accent: "info", label: "In Progress" },
  "in stock": { accent: "success", label: "In Stock" },
  "out of stock": { accent: "danger", label: "Out of Stock" },
  "low stock": { accent: "warning", label: "Low Stock" },

  // Work Order
  "not started": { accent: "neutral", label: "Not Started" },
  "in process": { accent: "info", label: "In Process" },
};

interface StatusBadgeProps {
  status: string | number;
  label?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

/**
 * Auto-colored Status Badge using semantic OKLCH tokens.
 *
 * @example
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status={item.docstatus} />
 * <StatusBadge status="custom" label="Custom Label" />
 * ```
 */
export function StatusBadge({
  status,
  label,
  className,
  size = "default",
}: StatusBadgeProps) {
  let normalizedStatus: string;
  if (typeof status === "number") {
    switch (status) {
      case 0: normalizedStatus = "draft"; break;
      case 1: normalizedStatus = "submitted"; break;
      case 2: normalizedStatus = "cancelled"; break;
      default: normalizedStatus = String(status);
    }
  } else {
    normalizedStatus = status.toLowerCase();
  }

  const config = STATUS_ACCENT[normalizedStatus] ?? {
    accent: "neutral" as Accent,
    label: label || String(status),
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        sizeClasses[size],
        ACCENT_CLASSES[config.accent],
        className,
      )}
    >
      {label || config.label}
    </span>
  );
}

export default StatusBadge;
