// components/ui/skeleton.tsx
// Obsidian ERP v4.0 — Shared skeleton primitives with shimmer animation.
// Three composed variants: list-card, detail, wizard-step.
// Replaces all ad-hoc animate-pulse blocks and spinners (except button mid-submit).

"use client";

import { cn } from "@/lib/utils";

/**
 * Base skeleton line — a single shimmering rectangle.
 */
function SkeletonLine({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-muted/60 skeleton-shimmer", className)}
      {...props}
    />
  );
}

/**
 * List-card skeleton — mirrors the Sales Order card layout.
 * Use with <LoadingState type="cards" />.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-5 space-y-4",
        className,
      )}
    >
      {/* Status bar */}
      <div className="h-1 w-full rounded-full bg-muted/60 skeleton-shimmer" />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonLine className="h-5 w-32" />
          <SkeletonLine className="h-3 w-24" />
        </div>
        <SkeletonLine className="h-6 w-20 rounded-full" />
      </div>
      {/* Info grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <SkeletonLine className="h-2 w-10" />
          <SkeletonLine className="h-4 w-16" />
        </div>
        <div className="space-y-1.5">
          <SkeletonLine className="h-2 w-12" />
          <SkeletonLine className="h-4 w-14" />
        </div>
        <div className="space-y-1.5">
          <SkeletonLine className="h-2 w-10" />
          <SkeletonLine className="h-4 w-20" />
        </div>
      </div>
      {/* Footer */}
      <div className="pt-4 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonLine className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonLine className="h-2 w-16" />
            <SkeletonLine className="h-5 w-24" />
          </div>
        </div>
        <SkeletonLine className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Detail skeleton — mirrors the 12-col detail page layout.
 */
export function SkeletonDetail({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* PageHeader */}
      <div className="flex items-center gap-4">
        <SkeletonLine className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-48" />
          <SkeletonLine className="h-3 w-32" />
        </div>
      </div>
      {/* Flow tracker */}
      <SkeletonLine className="h-16 w-full rounded-2xl" />
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* InfoCard 1 */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <SkeletonLine className="h-3 w-24" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <SkeletonLine className="h-2 w-16" />
                  <SkeletonLine className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          {/* InfoCard 2 — table */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <SkeletonLine className="h-3 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLine key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 space-y-3">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-8 w-full rounded-lg" />
              <SkeletonLine className="h-8 w-3/4 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Wizard-step skeleton — mirrors a FlowWizard step.
 */
export function SkeletonWizardStep({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Step heading */}
      <div className="flex items-start gap-3">
        <SkeletonLine className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <SkeletonLine className="h-5 w-40" />
          <SkeletonLine className="h-3 w-56" />
        </div>
      </div>
      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { SkeletonLine };
