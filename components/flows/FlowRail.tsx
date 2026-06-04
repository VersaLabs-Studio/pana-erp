// components/flows/FlowRail.tsx
// Obsidian ERP v4.0 — Horizontal stepper flow visualization
// Compact journey rail with connected nodes, animated connectors,
// and one surfaced action per flow.

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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type {
  FlowChainResult,
  FlowStage,
  FlowStageStatus,
} from "@/types/flow-types";
import { isModuleBuilt } from "@/lib/flows/module-availability";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FlowRailProps {
  result: FlowChainResult;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Node glyph (28–32px)
// ---------------------------------------------------------------------------
function StageNode({ status }: { status: FlowStageStatus }) {
  const prefersReducedMotion = useReducedMotion();

  switch (status) {
    case "completed":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    case "current":
      return (
        <motion.div
          animate={prefersReducedMotion ? {} : { scale: [1, 1.12, 1] }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
          className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-primary/40 bg-primary/10 shrink-0"
        >
          <Clock className="h-4 w-4 text-primary" />
        </motion.div>
      );
    case "pending":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
          <Circle className="h-3 w-3 text-muted-foreground/30" />
        </div>
      );
    case "skipped":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 shrink-0">
          <SkipForward className="h-4 w-4 text-muted-foreground/30" />
        </div>
      );
    case "blocked":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
          <Ban className="h-4 w-4 text-destructive" />
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
          <Circle className="h-3 w-3 text-muted-foreground/30" />
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Connector segment between nodes
// ---------------------------------------------------------------------------
function Connector({
  filled,
  index,
  prefersReducedMotion,
}: {
  filled: boolean;
  index: number;
  prefersReducedMotion: boolean;
}) {
  return (
    <div className="flex-1 flex items-center min-w-[20px] h-8" aria-hidden>
      <motion.div
        className={cn(
          "h-0.5 w-full rounded-full",
          filled ? "bg-primary" : "bg-border/40"
        )}
        initial={prefersReducedMotion ? {} : { scaleX: 0 }}
        animate={prefersReducedMotion ? {} : { scaleX: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
        }
        style={{ originX: 0 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single stepper node
// ---------------------------------------------------------------------------
function StepperNode({
  stage,
  isCurrent,
  isCompleted,
  isSkipped,
  index,
  prefersReducedMotion,
}: {
  stage: FlowStage;
  isCurrent: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const hasDocLink = isCompleted && stage.documentUrl;
  const tooltipText = isCurrent
    ? `${stage.label} — you are here`
    : isCompleted && stage.documentName
      ? stage.documentName
      : stage.label;

  const node = (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 6 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.25, delay: index * 0.05 }
      }
      className="group relative flex flex-col items-center gap-1.5 min-w-0"
    >
      <StageNode status={stage.status} />

      <span
        className={cn(
          "text-[11px] font-medium truncate max-w-[72px] text-center",
          isCurrent && "font-semibold text-foreground",
          isSkipped && "line-through text-muted-foreground/50",
          !isCurrent && !isSkipped && "text-muted-foreground"
        )}
      >
        {stage.label}
      </span>

      {isCurrent && (
        <span className="text-[10px] text-primary font-medium">
          you are here
        </span>
      )}

      {/* Hover tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {tooltipText}
      </div>
    </motion.div>
  );

  if (hasDocLink) {
    return (
      <Link
        href={stage.documentUrl!}
        className="outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
        aria-label={`View ${stage.documentName ?? stage.label}`}
      >
        {node}
      </Link>
    );
  }

  return (
    <div aria-current={isCurrent ? "step" : undefined}>
      {node}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function FlowRailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl shadow-sm p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="contents">
            <div className="flex flex-col items-center gap-1.5">
              <SkeletonLine className="h-8 w-8 rounded-full" />
              <SkeletonLine className="h-2.5 w-12" />
            </div>
            {i < 5 && <SkeletonLine className="flex-1 h-0.5 min-w-[20px] mx-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowRail
// ---------------------------------------------------------------------------
export function FlowRail({
  result,
  isLoading,
  error,
  className,
}: FlowRailProps) {
  const prefersReducedMotion = useReducedMotion();

  // Loading
  if (isLoading) {
    return <FlowRailSkeleton className={className} />;
  }

  // Error
  if (error) {
    return (
      <div className={cn("bg-card rounded-2xl shadow-sm p-5", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <Ban className="h-4 w-4" />
          <span className="text-sm">Failed to load flow: {error.message}</span>
        </div>
      </div>
    );
  }

  // Empty
  if (!result || result.stages.length === 0) {
    return (
      <div className={cn("bg-card rounded-2xl shadow-sm p-5", className)}>
        <p className="text-sm text-muted-foreground text-center">
          No flow data available
        </p>
      </div>
    );
  }

  const { stages, completedCount } = result;
  const total = stages.length;

  // Find the next buildable stage
  const nextBuildableIndex = stages.findIndex((s, i) => {
    if (s.status !== "pending") return false;
    if (!isModuleBuilt(s.doctype)) return false;
    if (i === 0) return true;
    const upstream = stages[i - 1];
    return upstream.status === "completed" || upstream.status === "current";
  });

  const nextBuildable =
    nextBuildableIndex >= 0 ? stages[nextBuildableIndex] : null;
  const nextBuildableAction =
    nextBuildable?.createAction && isModuleBuilt(nextBuildable.doctype)
      ? nextBuildable.createAction
      : null;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className={cn("bg-card rounded-2xl shadow-sm p-5", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Order Journey</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount} of {total} complete
        </span>
      </div>

      {/* Horizontal stepper band */}
      <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
        <div className="flex items-center min-w-max">
          {stages.map((stage, index) => {
            const isCurrent = stage.status === "current";
            const isCompleted = stage.status === "completed";
            const isSkipped = stage.status === "skipped";

            return (
              <div key={stage.id} className="contents">
                <StepperNode
                  stage={stage}
                  isCurrent={isCurrent}
                  isCompleted={isCompleted}
                  isSkipped={isSkipped}
                  index={index}
                  prefersReducedMotion={!!prefersReducedMotion}
                />
                {index < stages.length - 1 && (
                  <Connector
                    filled={isCompleted}
                    index={index}
                    prefersReducedMotion={!!prefersReducedMotion}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Surfaced action */}
      {nextBuildable && nextBuildableAction && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 4 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.3, delay: 0.3 }
          }
          className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
        >
          <span className="text-sm text-muted-foreground">
            Up next:{" "}
            <span className="font-semibold text-foreground">
              {nextBuildable.label}
            </span>
          </span>
          <Link href={nextBuildableAction}>
            <Button size="sm" className="gap-1.5">
              Create <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </motion.div>
      )}

      {result.isComplete && (
        <div className="mt-4 flex items-center justify-center rounded-lg bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-primary">
            All complete
          </span>
        </div>
      )}
    </motion.div>
  );
}
