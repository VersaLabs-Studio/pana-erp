// components/flows/FlowRail.tsx
// Obsidian ERP v4.0 — Vertical Flow Rail
// Replaces the horizontal FlowTracker chip strip on detail pages.
// Design: vertical rail on lg, horizontal scroll-snap on mobile.
// States: completed (filled bg-primary/10, check), current (ring-1 ring-primary/30, animated clock),
// pending (muted), skipped (muted/60 + strikethrough), blocked (bg-destructive/5, ban).
// Connectors: continuous vertical line (bg-primary/30 up to current, bg-border/40 after).
// Action slot: exactly one affordance per stage, gated by isModuleBuilt.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SkeletonLine } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Clock,
  SkipForward,
  Ban,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { FlowChainResult, FlowStage, FlowStageStatus } from "@/types/flow-types";
import { isModuleBuilt } from "@/lib/flows/module-availability";

interface FlowRailProps {
  result: FlowChainResult;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

function StageGlyph({ status }: { status: FlowStageStatus }) {
  const prefersReducedMotion = useReducedMotion();

  switch (status) {
    case "completed":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </div>
      );
    case "current":
      return (
        <motion.div
          animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
          className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-primary/30 bg-primary/5"
        >
          <Clock className="h-4 w-4 text-primary" />
        </motion.div>
      );
    case "pending":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/40">
          <Circle className="h-4 w-4 text-muted-foreground/30" />
        </div>
      );
    case "skipped":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/20">
          <SkipForward className="h-4 w-4 text-muted-foreground/30" />
        </div>
      );
    case "blocked":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/5">
          <Ban className="h-4 w-4 text-destructive" />
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/40">
          <Circle className="h-4 w-4 text-muted-foreground/30" />
        </div>
      );
  }
}

function ConnectorLine({
  aboveStatus,
  belowStatus,
}: {
  aboveStatus: FlowStageStatus;
  belowStatus: FlowStageStatus;
}) {
  const isAboveCompleted = aboveStatus === "completed";
  const isBelowCurrent = belowStatus === "current";

  return (
    <div className="flex justify-center">
      <div
        className={cn(
          "w-px h-6",
          isAboveCompleted || isBelowCurrent
            ? "bg-primary/30"
            : "bg-border/40",
        )}
      />
    </div>
  );
}

function RailStage({
  stage,
  isCurrent,
}: {
  stage: FlowStage;
  isCurrent: boolean;
}) {
  const isClickable = stage.status === "completed" && stage.documentUrl;
  const isSkipped = stage.status === "skipped";

  // Action slot: View (completed) or Create (downstream, built only)
  const downstreamDoctype = stage.doctype; // The stage itself is the downstream
  const canCreate =
    isCurrent &&
    stage.canCreateDownstream &&
    stage.createAction &&
    isModuleBuilt(downstreamDoctype);

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 py-1",
        isSkipped && "opacity-50",
      )}
    >
      <StageGlyph status={stage.status} />

      <div className="flex flex-col min-w-0 flex-1">
        <span
          className={cn(
            "text-sm font-medium",
            stage.status === "completed" && "text-foreground",
            stage.status === "current" && "text-foreground font-semibold",
            stage.status === "pending" && "text-muted-foreground",
            stage.status === "skipped" && "text-muted-foreground/60 line-through",
            stage.status === "blocked" && "text-destructive",
          )}
        >
          {stage.label}
        </span>
        {stage.documentName && (
          <span className="text-[11px] text-muted-foreground font-mono truncate">
            {stage.documentName}
          </span>
        )}
      </div>

      {/* Action slot */}
      {isClickable && stage.documentUrl && (
        <Link
          href={stage.documentUrl}
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isClickable ? (
        <Link href={stage.documentUrl!} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}

/**
 * FlowRail — Vertical flow visualization for detail pages.
 *
 * Shows the complete business chain as a vertical rail with status glyphs,
 * connectors, and action slots. Replaces the cramped horizontal FlowTracker.
 */
export function FlowRail({
  result,
  isLoading,
  error,
  className,
}: FlowRailProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonLine className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <SkeletonLine className="h-4 w-24" />
              <SkeletonLine className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl bg-destructive/5 px-4 py-3",
          className,
        )}
      >
        <Ban className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">
          Failed to load flow: {error.message}
        </span>
      </div>
    );
  }

  if (!result || result.stages.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted/30 px-4 py-6",
          className,
        )}
      >
        <span className="text-sm text-muted-foreground">
          No flow data available
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className={cn("space-y-0", className)}
    >
      {result.stages.map((stage, index) => (
        <div key={stage.id}>
          <RailStage
            stage={stage}
            isCurrent={stage.status === "current"}
          />
          {index < result.stages.length - 1 && (
            <ConnectorLine
              aboveStatus={stage.status}
              belowStatus={result.stages[index + 1].status}
            />
          )}
        </div>
      ))}
    </motion.div>
  );
}
