// components/smart/InlineStatusChange.tsx
// Obsidian ERP v4.0 - Status Dropdown on List Rows

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface InlineStatusChangeProps {
  /** Current status */
  currentStatus: string;
  /** Available statuses */
  statuses: string[];
  /** Status change callback */
  onStatusChange: (newStatus: string) => Promise<void>;
  /** Status color map */
  statusColors?: Record<string, string>;
  /** Whether the change is loading */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "To Deliver and Bill": "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "To Deliver": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "To Bill": "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  Cancelled: "bg-muted text-muted-foreground",
  Open: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  Submitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  Unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

/**
 * InlineStatusChange — Status dropdown that can be used on list rows
 *
 * @example
 * ```tsx
 * <InlineStatusChange
 *   currentStatus="Draft"
 *   statuses={["Draft", "To Deliver and Bill", "Cancelled"]}
 *   onStatusChange={async (newStatus) => await updateStatus(row.name, newStatus)}
 * />
 * ```
 */
export function InlineStatusChange({
  currentStatus,
  statuses,
  onStatusChange,
  statusColors = DEFAULT_STATUS_COLORS,
  isLoading,
  className,
}: InlineStatusChangeProps) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setIsChanging(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsChanging(false);
    }
  };

  const colorClass = statusColors[currentStatus] || "bg-muted text-muted-foreground";

  if (isLoading || isChanging) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Updating...</span>
      </div>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-7 w-auto border-0 bg-transparent p-0 text-xs font-medium focus:ring-0",
          className
        )}
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            colorClass
          )}
        >
          {currentStatus}
        </span>
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status} className="text-xs">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                statusColors[status] || "bg-muted text-muted-foreground"
              )}
            >
              {status}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
