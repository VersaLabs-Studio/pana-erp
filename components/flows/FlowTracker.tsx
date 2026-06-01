// components/flows/FlowTracker.tsx
// Obsidian ERP v4.0 - Flow Tracker Component
// Visual tracker showing 8-stage lead-to-cash flow
// OKLCH semantic tokens, Framer Motion, dual theme, skeleton/empty/error states

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  SkipForward,
  Ban,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { FlowChainResult, FlowStage, FlowStageStatus } from "@/types/flow-types";
import Link from "next/link";

interface FlowTrackerProps {
  /** Flow chain result from resolveFlowChain */
  result: FlowChainResult;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Whether to show compact view (mobile) */
  compact?: boolean;
  /** Callback when a create action is triggered */
  onCreateAction?: (stageId: string, action: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Status icon for each stage
 */
function StageIcon({ status, isLoading }: { status: FlowStageStatus; isLoading?: boolean }) {
  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  }

  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
    case "current":
      return (
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Clock className="h-5 w-5 text-primary" />
        </motion.div>
      );
    case "pending":
      return <Circle className="h-5 w-5 text-muted-foreground/40" />;
    case "skipped":
      return <SkipForward className="h-5 w-5 text-muted-foreground/40" />;
    case "blocked":
      return <Ban className="h-5 w-5 text-destructive" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground/40" />;
  }
}

/**
 * Single stage in the flow tracker
 */
function FlowStageCard({
  stage,
  isLast,
  compact,
  onCreateAction,
}: {
  stage: FlowStage;
  isLast: boolean;
  compact?: boolean;
  onCreateAction?: (stageId: string, action: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Stage card */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
          stage.status === "completed" &&
            "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30",
          stage.status === "current" &&
            "border-primary/30 bg-primary/5 dark:bg-primary/10",
          stage.status === "pending" &&
            "border-border bg-muted/30",
          stage.status === "skipped" &&
            "border-border bg-muted/20 opacity-60",
          stage.status === "blocked" &&
            "border-destructive/30 bg-destructive/5"
        )}
      >
        <StageIcon status={stage.status} />

        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-xs font-medium truncate",
              stage.status === "current" && "text-foreground",
              stage.status === "completed" && "text-emerald-700 dark:text-emerald-300",
              stage.status === "pending" && "text-muted-foreground"
            )}
          >
            {stage.label}
          </span>

          {!compact && stage.documentName && (
            <span className="text-[10px] text-muted-foreground truncate">
              {stage.documentName}
            </span>
          )}
        </div>

        {/* Create button for current stage */}
        {stage.status === "current" && stage.canCreateDownstream && stage.createAction && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-6 px-2 text-xs"
            onClick={() => onCreateAction?.(stage.id, stage.createAction!)}
          >
            Create <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        )}

        {/* Link to document if completed */}
        {stage.status === "completed" && stage.documentUrl && (
          <Link
            href={stage.documentUrl}
            className="ml-auto text-[10px] text-primary hover:underline"
          >
            View
          </Link>
        )}
      </motion.div>

      {/* Connector line */}
      {!isLast && (
        <div
          className={cn(
            "h-px w-4 sm:w-8 flex-shrink-0",
            stage.status === "completed"
              ? "bg-emerald-300 dark:bg-emerald-700"
              : "bg-border"
          )}
        />
      )}
    </div>
  );
}

/**
 * FlowTracker — Visual tracker for business process flows
 *
 * Shows the complete chain (Lead → Opportunity → Quotation → Sales Order →
 * Delivery → Invoice → Payment) with status indicators and create actions.
 *
 * @example
 * ```tsx
 * <FlowTracker
 *   result={resolveFlowChain("Sales Order", "SO-001")}
 *   onCreateAction={(stageId, action) => handleCreate(stageId, action)}
 * />
 * ```
 */
export function FlowTracker({
  result,
  isLoading,
  error,
  compact,
  onCreateAction,
  className,
}: FlowTrackerProps) {
  const prefersReducedMotion = useReducedMotion();

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 overflow-x-auto py-2", className)}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
            {i < 6 && <div className="h-px w-8 bg-muted" />}
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3",
          className
        )}
      >
        <Ban className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">
          Failed to load flow status: {error.message}
        </span>
      </div>
    );
  }

  // Empty state
  if (!result || result.stages.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed px-4 py-6",
          className
        )}
      >
        <span className="text-sm text-muted-foreground">No flow data available</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center gap-1 sm:gap-2 overflow-x-auto py-2", className)}
    >
      {result.stages.map((stage, index) => (
        <FlowStageCard
          key={stage.id}
          stage={stage}
          isLast={index === result.stages.length - 1}
          compact={compact}
          onCreateAction={onCreateAction}
        />
      ))}
    </motion.div>
  );
}
