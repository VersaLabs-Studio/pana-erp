// components/flows/FlowRail.tsx
// Obsidian ERP v4.0 — "Journey Rail" premium flow visualization
// Part C: Progress header, continuous spine, status eyebrows,
// current-row emphasis, one real action per row.
// Replaces the old flat list of disconnected glyph stubs.

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
type StageEyebrow = "Completed" | "In progress" | "Up next" | "Pending" | "Blocked" | "Skipped";

function getEyebrow(status: FlowStageStatus, isNextBuildable: boolean): StageEyebrow {
  if (status === "completed") return "Completed";
  if (status === "current") return "In progress";
  if (isNextBuildable) return "Up next";
  if (status === "pending") return "Pending";
  if (status === "blocked") return "Blocked";
  if (status === "skipped") return "Skipped";
  return "Pending";
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ---------------------------------------------------------------------------
// Node glyph (32px)
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
// Single row
// ---------------------------------------------------------------------------
function RailRow({
  stage,
  isCurrent,
  isNextBuildable,
  eyebrow,
  index,
  total,
  upstreamDocId,
}: {
  stage: FlowStage;
  isCurrent: boolean;
  isNextBuildable: boolean;
  eyebrow: StageEyebrow;
  index: number;
  total: number;
  upstreamDocId?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isSkipped = stage.status === "skipped";
  const isCompleted = stage.status === "completed";
  const isPending = stage.status === "pending";

  // Action slot
  const hasViewLink = isCompleted && stage.documentUrl;
  const hasCreateLink =
    isNextBuildable &&
    stage.createAction &&
    isModuleBuilt(stage.doctype);

  const metaLine = isCurrent
    ? "you are here"
    : isCompleted && stage.documentName
      ? stage.documentName
      : isPending
        ? "Not created yet"
        : undefined;

  const timeLine = isCompleted ? "" : undefined;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.25, delay: index * 0.05 }
      }
      className={cn(
        "relative flex items-start gap-3 py-3",
        isSkipped && "opacity-50",
        isCurrent && "-mx-2 rounded-xl bg-primary/[0.04] px-2",
      )}
    >
      {/* Node */}
      <StageNode status={stage.status} />

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Eyebrow */}
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider font-medium",
            eyebrow === "Completed" && "text-muted-foreground",
            eyebrow === "In progress" && "text-primary",
            eyebrow === "Up next" && "text-muted-foreground",
            eyebrow === "Pending" && "text-muted-foreground/50",
            eyebrow === "Blocked" && "text-destructive",
            eyebrow === "Skipped" && "text-muted-foreground/40",
          )}
        >
          {eyebrow}
        </span>

        {/* Label */}
        <p
          className={cn(
            "text-sm",
            isCurrent ? "font-semibold text-foreground" : "font-medium text-foreground",
            isSkipped && "line-through text-muted-foreground",
          )}
        >
          {stage.label}
        </p>

        {/* Meta line */}
        {metaLine && (
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
            {metaLine}
            {timeLine && ` · ${timeLine}`}
          </p>
        )}
      </div>

      {/* Action slot — exactly one, right-aligned */}
      <div className="shrink-0 pt-5">
        {hasViewLink && (
          <Link
            href={stage.documentUrl!}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        {hasCreateLink && stage.createAction && (
          <Link
            href={stage.createAction}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Create <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </motion.div>
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
    return (
      <div className={cn("bg-card shadow-sm rounded-2xl p-6 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="h-3 w-20" />
        </div>
        <SkeletonLine className="h-1.5 w-full rounded-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <SkeletonLine className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <SkeletonLine className="h-3 w-16" />
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        className={cn(
          "bg-card shadow-sm rounded-2xl p-6",
          className,
        )}
      >
        <div className="flex items-center gap-2 text-destructive">
          <Ban className="h-4 w-4" />
          <span className="text-sm">Failed to load flow: {error.message}</span>
        </div>
      </div>
    );
  }

  // Empty / standalone
  if (!result || result.stages.length === 0) {
    return (
      <div className={cn("bg-card shadow-sm rounded-2xl p-6", className)}>
        <p className="text-sm text-muted-foreground text-center">
          No flow data available
        </p>
      </div>
    );
  }

  const { stages, completedCount } = result;
  const total = stages.length;

  // Find the next buildable stage (first pending whose upstream is completed + module built)
  const nextBuildableIndex = stages.findIndex((s, i) => {
    if (s.status !== "pending") return false;
    if (!isModuleBuilt(s.doctype)) return false;
    // Upstream must be completed or current
    if (i === 0) return true;
    const upstream = stages[i - 1];
    return upstream.status === "completed" || upstream.status === "current";
  });

  // Progress percentage
  const progressPct = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className={cn("bg-card shadow-sm rounded-2xl p-6", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Order Journey</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount} of {total} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, ease: "easeOut" }
          }
        />
      </div>

      {/* Spine + rows */}
      <div className="relative">
        {/* Continuous spine — absolute positioned */}
        <div
          className="absolute left-4 top-4 bottom-4 w-px"
          style={{
            background: `linear-gradient(to bottom, var(--color-primary) ${progressPct}%, var(--color-border) ${progressPct}%)`,
            opacity: 0.4,
          }}
        />

        {/* Rows */}
        <div className="space-y-0">
          {stages.map((stage, index) => {
            const isCurrent = stage.status === "current";
            const isNextBuildable = index === nextBuildableIndex;
            const eyebrow = getEyebrow(stage.status, isNextBuildable);

            return (
              <RailRow
                key={stage.id}
                stage={stage}
                isCurrent={isCurrent}
                isNextBuildable={isNextBuildable}
                eyebrow={eyebrow}
                index={index}
                total={total}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
