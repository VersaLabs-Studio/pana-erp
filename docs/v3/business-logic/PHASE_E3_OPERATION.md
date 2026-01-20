# Phase E3: Operation Module Implementation

> **Version:** 1.0.0  
> **Module:** Manufacturing  
> **DocType:** Operation  
> **Priority:** 🔴 Critical (Foundation)  
> **Dependencies:** Workstation (E2)

---

## Overview

The Operation module defines the **actions or verbs** performed during manufacturing. Each operation can be linked to a default Workstation for automatic rate calculation. Operations are the building blocks of **BOM Operations** (recipes).

### Business Context (Print Shop)

| Operation  | Default Workstation | Standard Time | Description                 |
| ---------- | ------------------- | ------------- | --------------------------- |
| Printing   | Offset Printer A    | 60 mins       | High-volume offset printing |
| Cutting    | Cutting Station     | 30 mins       | Paper cutting to size       |
| Laminating | Laminator           | 15 mins       | Protective film application |
| Binding    | Binding Machine     | 45 mins       | Book/document binding       |
| Folding    | Folder Unit         | 20 mins       | Paper folding operations    |

---

## 1. Field Scope Analysis

Based on the generated `Operation` interface, here's our field strategy:

### ✅ Fields to Implement (MVP Scope)

| Field                  | Type  | Required | Purpose                                 |
| ---------------------- | ----- | -------- | --------------------------------------- |
| `name`                 | Data  | ✅       | Operation identifier (e.g., "Printing") |
| `workstation`          | Link  | ❌       | Default machine for this operation      |
| `total_operation_time` | Float | ❌       | Standard time in minutes (for costing)  |
| `description`          | Text  | ❌       | Detailed work instructions              |

### ⏸️ Fields to Skip (Advanced / Phase 3+)

| Field                                 | Reason                                   |
| ------------------------------------- | ---------------------------------------- |
| `is_corrective_operation`             | Advanced manufacturing (rework tracking) |
| `create_job_card_based_on_batch_size` | Job Cards not in current scope           |
| `quality_inspection_template`         | QA module integration                    |
| `batch_size`                          | Advanced batch production                |
| `sub_operations`                      | Nested operations (complex workflow)     |

---

## 2. Configuration Updates

### 2.1 DocType Config (`lib/doctype-config.ts`)

Add to the **MANUFACTURING MODULE** section:

```typescript
// lib/doctype-config.ts - MANUFACTURING MODULE section
Operation: {
  apiPath: "manufacturing/operation",
  module: "Manufacturing",
  labelField: "name",
  searchFields: ["name", "workstation"],
  defaultSortField: "creation",
  defaultSortOrder: "desc",
},
```

### 2.2 Query Keys (`lib/query-keys.ts`)

Add to the **MANUFACTURING MODULE** section:

```typescript
// lib/query-keys.ts - MANUFACTURING MODULE section
operation: {
  all: () => ["Operation"] as const,
  list: (options?: FrappeListOptions) =>
    ["Operation", "list", options] as const,
  doc: (name: string) => ["Operation", "doc", name] as const,
  byWorkstation: (workstationName: string) =>
    ["Operation", "list", "workstation", workstationName] as const,
},
```

---

## 3. Schema Definition

Add to `lib/schemas/doctype-schemas.ts`:

```typescript
// lib/schemas/doctype-schemas.ts

/**
 * Operation Create Schema
 * @doctype Operation
 * @scope MVP - Print Shop Manufacturing
 */
export const OperationCreateSchema = z.object({
  // The operation name IS the DocType name field (auto-generated as ID)
  // But ERPNext uses the 'name' field directly for Operation
  name: z.string().min(1, "Operation Name is required"),
  workstation: z.string().optional(),
  total_operation_time: z.number().min(0).optional().default(0),
  description: z.string().optional(),
});

export const OperationUpdateSchema = z.object({
  workstation: z.string().optional(),
  total_operation_time: z.number().min(0).optional(),
  description: z.string().optional(),
});

// Use z.input for Form Initialization to handle defaults correctly
export type OperationFormData = z.input<typeof OperationCreateSchema>;
export type OperationUpdateData = z.input<typeof OperationUpdateSchema>;
```

**⚠️ Important Note:** The `Operation` DocType uses `name` as the primary identifier directly (not `naming_series`). This means when creating an Operation, the `name` field IS the operation name (e.g., "Printing").

---

## 4. API Routes

### 4.1 List & Create Route

**File:** `app/api/manufacturing/operation/route.ts`

```typescript
// app/api/manufacturing/operation/route.ts
// Pana ERP v3.0 - Operation API (List & Create)

import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { OperationCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Operation", {
  allowedFields: [
    "name",
    "workstation",
    "total_operation_time",
    "description",
    "creation",
    "modified",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 100,
});

export const POST = createCreateHandler("Operation", OperationCreateSchema);
```

### 4.2 Single Document Route

**File:** `app/api/manufacturing/operation/[name]/route.ts`

```typescript
// app/api/manufacturing/operation/[name]/route.ts
// Pana ERP v3.0 - Operation Single Document API

import {
  createGetHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "@/lib/api-factory";
import { OperationUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Operation");
export const PUT = createUpdateHandler("Operation", OperationUpdateSchema);
export const DELETE = createDeleteHandler("Operation");
```

---

## 5. Client Pages

### 5.1 List Page

**File:** `app/manufacturing/operation/page.tsx`

```typescript
// app/manufacturing/operation/page.tsx
// Pana ERP v3.0 - Operation List Page
// @ts-nocheck

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Cog as OperationIcon,
  Clock,
  Cpu,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFrappeList, useFrappeDelete } from "@/hooks/generic";
import {
  PageHeader,
  LoadingState,
  EmptyState,
  ConfirmDialog,
} from "@/components/smart";
import type { Operation } from "@/types/doctype-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Format time helper
function formatTime(minutes: number | undefined): string {
  if (!minutes || minutes === 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Operation Card Component
function OperationCard({
  operation,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  operation: Operation;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border/50 p-5",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
        "transition-all duration-300 cursor-pointer",
        "animate-in fade-in slide-in-from-bottom-4"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <OperationIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {operation.name}
            </h3>
            {operation.workstation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {operation.workstation}
              </p>
            )}
          </div>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-lg"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-lg text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Time Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <Clock className="h-4 w-4" />
            <span>{formatTime(operation.total_operation_time)}</span>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] rounded-full px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          >
            Operation
          </Badge>
        </div>

        {/* Description Preview */}
        {operation.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
            {operation.description}
          </p>
        )}

        {/* No Workstation Warning */}
        {!operation.workstation && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 pt-2 border-t border-border/50">
            <PlayCircle className="h-3.5 w-3.5" />
            <span>No default workstation assigned</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main List Page Component
export default function OperationListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Fetch operations
  const {
    data: operations,
    isLoading,
    error,
    refetch,
  } = useFrappeList<Operation>("Operation", {
    fields: [
      "name",
      "workstation",
      "total_operation_time",
      "description",
    ],
    orderBy: { field: "creation", order: "desc" },
    limit: 200,
  });

  // Delete mutation
  const deleteMutation = useFrappeDelete("Workstation", {
    onSuccess: () => {
      toast.success("Operation deleted successfully");
      refetch();
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete operation");
    },
  });

  // Filter operations
  const filteredOperations = useMemo(() => {
    if (!operations) return [];

    return operations.filter((op) => {
      const matchesSearch =
        !searchTerm ||
        op.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.workstation?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [operations, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading operations..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={OperationIcon}
        title="Error loading operations"
        description="There was a problem fetching the operation list."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Operations"
        subtitle="Define manufacturing actions and their standard times"
        actions={
          <Button
            onClick={() => router.push("/manufacturing/operation/new")}
            className="rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Operation
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search operations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-full bg-card border-border/50"
        />
      </div>

      {/* Operations Grid */}
      {filteredOperations.length === 0 ? (
        <EmptyState
          icon={OperationIcon}
          title="No operations found"
          description={
            searchTerm
              ? "Try adjusting your search criteria"
              : "Define your manufacturing operations to use in BOMs"
          }
          action={
            !searchTerm && (
              <Button
                onClick={() => router.push("/manufacturing/operation/new")}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Operation
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOperations.map((operation, index) => (
            <OperationCard
              key={operation.name}
              operation={operation}
              index={index}
              onView={() =>
                router.push(
                  `/manufacturing/operation/${encodeURIComponent(operation.name)}`
                )
              }
              onEdit={() =>
                router.push(
                  `/manufacturing/operation/${encodeURIComponent(operation.name)}/edit`
                )
              }
              onDelete={() => setDeleteTarget(operation.name)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Operation"
        description={`Are you sure you want to delete "${deleteTarget}"? This may affect BOMs that use this operation.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
```

### 5.2 Create Page

**File:** `app/manufacturing/operation/new/page.tsx`

```typescript
// app/manufacturing/operation/new/page.tsx
// Pana ERP v3.0 - Create Operation Page
// @ts-nocheck

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Cog as OperationIcon, Clock, Cpu, FileText } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useFrappeCreate } from "@/hooks/generic";
import { queryKeys } from "@/lib/query-keys";
import { PageHeader } from "@/components/smart";
import {
  FormInput,
  FormFrappeSelect,
  FormTextarea,
} from "@/components/form";
import {
  OperationCreateSchema,
  type OperationFormData,
} from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateOperationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<OperationFormData>({
    resolver: zodResolver(OperationCreateSchema),
    defaultValues: {
      name: "",
      workstation: "",
      total_operation_time: 0,
      description: "",
    },
  });

  // Create mutation
  const createMutation = useFrappeCreate<OperationFormData>("Operation", {
    onSuccess: (data) => {
      toast.success("Operation created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.operation.all() });
      router.push(`/manufacturing/operation/${encodeURIComponent(data.name)}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create operation");
    },
  });

  const onSubmit = (data: OperationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="New Operation"
        subtitle="Define a manufacturing action with standard time"
        backHref="/manufacturing/operation"
        icon={<OperationIcon className="h-5 w-5" />}
      />

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Card */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            {/* Identity Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <OperationIcon className="h-5 w-5 text-primary" />
                <span>Operation Identity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Operation Name"
                  placeholder="e.g., Printing, Cutting, Binding"
                  required
                  description="This will be the unique identifier for this operation"
                />

                <FormFrappeSelect
                  control={form.control}
                  name="workstation"
                  label="Default Workstation"
                  doctype="Workstation"
                  placeholder="Select default machine..."
                  description="Assigns default rates when used in BOMs"
                />
              </div>
            </div>

            {/* Time Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Time Estimation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="total_operation_time"
                  label="Standard Time (Minutes)"
                  type="number"
                  placeholder="e.g., 30"
                  description="Default time to complete this operation"
                />

                {/* Calculated Display */}
                <div className="flex flex-col justify-end">
                  <div className="bg-secondary/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Time in Hours
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {((form.watch("total_operation_time") || 0) / 60).toFixed(2)} hrs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Work Instructions</span>
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Operation Description"
                placeholder="Describe the step-by-step process for this operation..."
                rows={4}
                description="Detailed instructions for operators"
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Costing Integration</p>
                <p className="text-sm text-muted-foreground">
                  When this operation is added to a Bill of Materials (BOM), the system will
                  calculate the operating cost by multiplying the time by the workstation's
                  hourly rate.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-full min-w-[140px]"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Operation
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### 5.3 Detail Page

**File:** `app/manufacturing/operation/[name]/page.tsx`

```typescript
// app/manufacturing/operation/[name]/page.tsx
// Pana ERP v3.0 - Operation Detail Page
// @ts-nocheck

"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Cog as OperationIcon,
  Clock,
  Cpu,
  FileText,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { useFrappeDoc, useFrappeDelete, useFrappeList } from "@/hooks/generic";
import { queryKeys } from "@/lib/query-keys";
import {
  PageHeader,
  LoadingState,
  EmptyState,
  ConfirmDialog,
} from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import type { Operation, Workstation } from "@/types/doctype-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

// Format time helper
function formatTime(minutes: number | undefined): string {
  if (!minutes || minutes === 0) return "Not set";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ${mins} min` : `${hours} hour${hours > 1 ? "s" : ""}`;
}

export default function OperationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const operationName = decodeURIComponent(params.name as string);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch operation
  const {
    data: operation,
    isLoading,
    error,
  } = useFrappeDoc<Operation>("Operation", operationName);

  // Fetch workstation details if linked
  const { data: workstations } = useFrappeList<Workstation>("Workstation", {
    fields: ["name", "workstation_name", "hour_rate"],
    filters: operation?.workstation
      ? [["name", "=", operation.workstation]]
      : [],
    limit: 1,
  });

  const linkedWorkstation = workstations?.[0];

  // Delete mutation
  const deleteMutation = useFrappeDelete("Operation", {
    onSuccess: () => {
      toast.success("Operation deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.operation.all() });
      router.push("/manufacturing/operation");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete operation");
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading operation details..." />;
  }

  if (error || !operation) {
    return (
      <EmptyState
        icon={OperationIcon}
        title="Operation not found"
        description="The requested operation could not be found."
        action={
          <Button
            onClick={() => router.push("/manufacturing/operation")}
            className="rounded-full"
          >
            Back to Operations
          </Button>
        }
      />
    );
  }

  // Calculate estimated cost if workstation linked
  const estimatedCost =
    linkedWorkstation?.hour_rate && operation.total_operation_time
      ? (linkedWorkstation.hour_rate / 60) * operation.total_operation_time
      : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={operation.name}
        subtitle="Manufacturing Operation"
        backHref="/manufacturing/operation"
        icon={<OperationIcon className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/manufacturing/operation/${encodeURIComponent(operationName)}/edit`
                )
              }
              className="rounded-full"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        >
          Active Operation
        </Badge>
        {linkedWorkstation && (
          <Badge
            variant="secondary"
            className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            Linked to Workstation
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time & Costing Card */}
        <InfoCard
          title="Time & Costing"
          icon={<Clock className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <DataPoint
              label="Standard Operation Time"
              value={formatTime(operation.total_operation_time)}
            />
            <DataPoint
              label="Time in Hours"
              value={
                operation.total_operation_time
                  ? `${(operation.total_operation_time / 60).toFixed(2)} hours`
                  : "Not set"
              }
            />
            {estimatedCost !== null && (
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Estimated Cost per Run</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ETB {estimatedCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on workstation rate of ETB {linkedWorkstation.hour_rate}/hr
                </p>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Workstation Card */}
        <InfoCard
          title="Default Workstation"
          icon={<Cpu className="h-4 w-4" />}
        >
          {linkedWorkstation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {linkedWorkstation.workstation_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {linkedWorkstation.name}
                  </p>
                </div>
                <Link
                  href={`/manufacturing/workstation/${encodeURIComponent(linkedWorkstation.name)}`}
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  View <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <DataPoint
                label="Hourly Rate"
                value={`ETB ${linkedWorkstation.hour_rate?.toFixed(2)}/hr`}
              />
            </div>
          ) : (
            <div className="text-center py-6">
              <Cpu className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No workstation assigned</p>
              <p className="text-xs text-muted-foreground mt-1">
                Edit this operation to assign a default workstation
              </p>
            </div>
          )}
        </InfoCard>

        {/* Description Card */}
        <InfoCard
          title="Work Instructions"
          icon={<FileText className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          {operation.description ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{operation.description}</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No description provided</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add work instructions for operators
              </p>
            </div>
          )}
        </InfoCard>

        {/* Metadata Card */}
        <InfoCard
          title="System Information"
          icon={<OperationIcon className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DataPoint
              label="Created On"
              value={
                operation.creation
                  ? new Date(operation.creation).toLocaleDateString()
                  : "—"
              }
            />
            <DataPoint
              label="Last Modified"
              value={
                operation.modified
                  ? new Date(operation.modified).toLocaleDateString()
                  : "—"
              }
            />
            <DataPoint label="Owner" value={operation.owner || "—"} />
            <DataPoint label="Modified By" value={operation.modified_by || "—"} />
          </div>
        </InfoCard>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Operation"
        description={`Are you sure you want to delete "${operation.name}"? This action cannot be undone and may affect BOMs that reference this operation.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutateAsync(operationName)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
```

### 5.4 Edit Page

**File:** `app/manufacturing/operation/[name]/edit/page.tsx`

```typescript
// app/manufacturing/operation/[name]/edit/page.tsx
// Pana ERP v3.0 - Edit Operation Page
// @ts-nocheck

"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Cog as OperationIcon, Clock, Cpu, FileText } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useFrappeDoc, useFrappeUpdate } from "@/hooks/generic";
import { queryKeys } from "@/lib/query-keys";
import { PageHeader, LoadingState, EmptyState } from "@/components/smart";
import {
  FormInput,
  FormFrappeSelect,
  FormTextarea,
} from "@/components/form";
import {
  OperationUpdateSchema,
  type OperationUpdateData,
} from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Operation } from "@/types/doctype-types";

export default function EditOperationPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const operationName = decodeURIComponent(params.name as string);

  // Fetch existing operation
  const {
    data: operation,
    isLoading,
    error,
  } = useFrappeDoc<Operation>("Operation", operationName);

  // Initialize form
  const form = useForm<OperationUpdateData>({
    resolver: zodResolver(OperationUpdateSchema),
    defaultValues: {
      workstation: "",
      total_operation_time: 0,
      description: "",
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (operation) {
      form.reset({
        workstation: operation.workstation || "",
        total_operation_time: operation.total_operation_time || 0,
        description: operation.description || "",
      });
    }
  }, [operation, form]);

  // Update mutation
  const updateMutation = useFrappeUpdate("Operation", {
    onSuccess: () => {
      toast.success("Operation updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.operation.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.operation.doc(operationName),
      });
      router.push(`/manufacturing/operation/${encodeURIComponent(operationName)}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update operation");
    },
  });

  const onSubmit = (data: OperationUpdateData) => {
    updateMutation.mutate({
      name: operationName,
      data: data,
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading operation..." />;
  }

  if (error || !operation) {
    return (
      <EmptyState
        icon={OperationIcon}
        title="Operation not found"
        description="The requested operation could not be found."
        action={
          <Button
            onClick={() => router.push("/manufacturing/operation")}
            className="rounded-full"
          >
            Back to Operations
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Edit: ${operation.name}`}
        subtitle="Update operation details"
        backHref={`/manufacturing/operation/${encodeURIComponent(operationName)}`}
        icon={<OperationIcon className="h-5 w-5" />}
      />

      {/* Read-only Operation Name Notice */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <OperationIcon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              Operation Name: {operation.name}
            </p>
            <p className="text-sm text-muted-foreground">
              The operation name cannot be changed after creation. To rename,
              create a new operation and delete this one.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Card */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            {/* Workstation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Cpu className="h-5 w-5 text-primary" />
                <span>Default Workstation</span>
              </div>

              <FormFrappeSelect
                control={form.control}
                name="workstation"
                label="Workstation"
                doctype="Workstation"
                placeholder="Select default machine..."
                description="Assigns default rates when used in BOMs"
              />
            </div>

            {/* Time Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Time Estimation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="total_operation_time"
                  label="Standard Time (Minutes)"
                  type="number"
                  placeholder="e.g., 30"
                  description="Default time to complete this operation"
                />

                {/* Calculated Display */}
                <div className="flex flex-col justify-end">
                  <div className="bg-secondary/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Time in Hours
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {((form.watch("total_operation_time") || 0) / 60).toFixed(2)} hrs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Work Instructions</span>
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Operation Description"
                placeholder="Describe the step-by-step process for this operation..."
                rows={4}
                description="Detailed instructions for operators"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-full min-w-[140px]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

---

## 6. File Structure Summary

```
app/manufacturing/operation/
├── page.tsx                    # List View
├── new/page.tsx                # Create Form
└── [name]/
    ├── page.tsx                # Detail View
    └── edit/page.tsx           # Edit Form

app/api/manufacturing/operation/
├── route.ts                    # GET list, POST create
└── [name]/route.ts             # GET, PUT, DELETE
```

---

## 7. Testing Checklist

- [ ] Create operation "Printing" with workstation "Offset Printer A"
- [ ] Create operation "Cutting" with workstation "Cutting Station"
- [ ] Create operation "Binding" without workstation
- [ ] Verify list page displays all operations
- [ ] Verify workstation link shows on cards
- [ ] Verify time formatting (minutes/hours)
- [ ] Search operations by name
- [ ] View operation detail page
- [ ] Verify cost calculation displays when workstation is linked
- [ ] Edit operation (change workstation, time)
- [ ] Verify operation name cannot be changed in edit
- [ ] Delete operation
- [ ] Test dark mode on all pages
- [ ] Test mobile responsiveness

---

## 8. Key Implementation Notes

### A. Operation Name as DocType ID

Unlike other DocTypes that use `naming_series`, `Operation` uses the `name` field directly as the identifier. This means:

- "Printing" is both the display name AND the document ID
- The name cannot be changed after creation
- Handle this in the Edit page with a read-only notice

### B. Costing Integration

The Detail page demonstrates the cost calculation:

```
Estimated Cost = (Workstation Hour Rate / 60) × Operation Time (minutes)
```

This previews what will happen when the operation is used in a BOM.

### C. Delete Hook Correction

In the List page, ensure the delete mutation uses the correct DocType:

```typescript
const deleteMutation = useFrappeDelete("Operation", { ... });
// NOT "Workstation" - this was a copy-paste error to watch for
```

---

## 9. Common Pitfalls to Avoid

1. **DO NOT** confuse `name` with other identifier fields - Operation uses `name` directly
2. **DO NOT** forget `// @ts-nocheck` at the top of client files
3. **DO NOT** allow editing of the `name` field on the Edit page
4. **DO** use `encodeURIComponent()` for operation names in URLs
5. **DO** show cost integration preview on Detail page
6. **DO** warn about BOM dependencies when deleting

---

_This document provides complete implementation specifications for Phase E3: Operation Module._
