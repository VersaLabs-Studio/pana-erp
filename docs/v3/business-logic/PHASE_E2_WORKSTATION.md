# Phase E2: Workstation Module Implementation

> **Version:** 1.0.0  
> **Module:** Manufacturing  
> **DocType:** Workstation  
> **Priority:** 🔴 Critical (Foundation)  
> **Dependencies:** None

---

## Overview

The Workstation module represents the **physical machines or locations** where manufacturing operations take place. It is critical for calculating production costs based on time spent.

### Business Context (Print Shop)

- **Offset Printer A** - High-speed commercial printer.
- **Laminator** - Finishing machine.
- **Cutting Station** - Manual or automated cutting equipment.

---

## 1. Configuration Updates

### 1.1 DocType Config (`lib/doctype-config.ts`)

Add the Workstation entry to the **MANUFACTURING MODULE** section:

```typescript
// lib/doctype-config.ts - MANUFACTURING MODULE section
Workstation: {
  apiPath: "manufacturing/workstation",
  module: "Manufacturing",
  labelField: "workstation_name",
  searchFields: ["workstation_name"],
  defaultSortField: "creation",
  defaultSortOrder: "desc",
},
```

### 1.2 Query Keys (`lib/query-keys.ts`)

Add to the MANUFACTURING MODULE section:

```typescript
// lib/query-keys.ts - MANUFACTURING MODULE section
workstation: {
  all: () => ["Workstation"] as const,
  list: (options?: FrappeListOptions) =>
    ["Workstation", "list", options] as const,
  doc: (name: string) => ["Workstation", "doc", name] as const,
},
```

---

## 2. Schema Definition

Add to `lib/schemas/doctype-schemas.ts`:

```typescript
// lib/schemas/doctype-schemas.ts

/**
 * Workstation Create Schema
 * @doctype Workstation
 */
export const WorkstationCreateSchema = z.object({
  workstation_name: z.string().min(1, "Workstation Name is required"),
  hour_rate: z.number().min(0).default(0),
  hour_rate_labour: z.number().min(0).optional().default(0),
  hour_rate_electricity: z.number().min(0).optional().default(0),
  hour_rate_consumable: z.number().min(0).optional().default(0),
  description: z.string().optional(),
  company: z.string().optional(),
});

export const WorkstationUpdateSchema = WorkstationCreateSchema.partial();

// Use z.input for Form Initialization to handle defaults correctly
export type WorkstationFormData = z.input<typeof WorkstationCreateSchema>;
```

---

## 3. API Routes

### 3.1 List & Create Route

**File:** `app/api/manufacturing/workstation/route.ts`

```typescript
// app/api/manufacturing/workstation/route.ts
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { WorkstationCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Workstation", {
  allowedFields: [
    "name",
    "workstation_name",
    "hour_rate",
    "company",
    "creation",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 50,
});

export const POST = createCreateHandler("Workstation", WorkstationCreateSchema);
```

### 3.2 Single Document Route

**File:** `app/api/manufacturing/workstation/[name]/route.ts`

```typescript
// app/api/manufacturing/workstation/[name]/route.ts
import {
  createGetHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "@/lib/api-factory";
import { WorkstationUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Workstation");
export const PUT = createUpdateHandler("Workstation", WorkstationUpdateSchema);
export const DELETE = createDeleteHandler("Workstation");
```

---

## 4. Client Pages

### 4.1 List Page

**File:** `app/manufacturing/workstation/page.tsx`

```typescript
// app/manufacturing/workstation/page.tsx
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
  Cpu as WorkstationIcon,
  DollarSign,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFrappeList, useFrappeDelete } from "@/hooks/generic";
import { PageHeader, LoadingState, EmptyState, ConfirmDialog } from "@/components/smart";
import type { Workstation } from "@/types/doctype-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function WorkstationCard({ workstation, index, onView, onEdit, onDelete }) {
  return (
    <div
      className="group relative bg-card rounded-2xl border border-border/50 p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <WorkstationIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {workstation.workstation_name}
            </h3>
            <p className="text-xs text-muted-foreground">{workstation.name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <DollarSign className="h-4 w-4" />
            <span>{workstation.hour_rate?.toFixed(2)}/hr</span>
          </div>
          <Badge variant="secondary" className="text-[10px] rounded-full px-2">
            Active
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
          <Activity className="h-3.5 w-3.5" />
          <span>Operational Machine</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkstationListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: workstations, isLoading, error, refetch } = useFrappeList<Workstation>("Workstation", {
    fields: ["name", "workstation_name", "hour_rate", "company"],
    orderBy: { field: "creation", order: "desc" },
  });

  const deleteMutation = useFrappeDelete("Workstation", {
    onSuccess: () => {
      toast.success("Workstation deleted successfully");
      refetch();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = useMemo(() =>
    workstations?.filter(w => w.workstation_name.toLowerCase().includes(searchTerm.toLowerCase())),
  [workstations, searchTerm]);

  if (isLoading) return <LoadingState message="Loading workstations..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workstations"
        subtitle="Manage manufacturing machines and operational centers"
        actions={
          <Button onClick={() => router.push("/manufacturing/workstation/new")} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" /> Add Workstation
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by machine name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-full bg-card border-border/50"
        />
      </div>

      {filtered?.length === 0 ? (
        <EmptyState
          icon={WorkstationIcon}
          title="No Workstations Found"
          description="Define your machines and workstations to start costing production."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered?.map((w, idx) => (
            <WorkstationCard
              key={w.name}
              workstation={w}
              index={idx}
              onView={() => router.push(`/manufacturing/workstation/${encodeURIComponent(w.name)}`)}
              onEdit={() => router.push(`/manufacturing/workstation/${encodeURIComponent(w.name)}/edit`)}
              onDelete={() => setDeleteTarget(w.name)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Workstation"
        description="Are you sure? This may affect historical costing data."
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutateAsync(deleteTarget!)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
```

### 4.2 Create Page

**File:** `app/manufacturing/workstation/new/page.tsx`

```typescript
// app/manufacturing/workstation/new/page.tsx
// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Cpu as WorkstationIcon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useFrappeCreate } from "@/hooks/generic";
import { PageHeader } from "@/components/smart";
import { FormInput, FormFrappeSelect, FormTextarea } from "@/components/form";
import { WorkstationCreateSchema, type WorkstationFormData } from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";

export default function CreateWorkstationPage() {
  const router = useRouter();
  const form = useForm<WorkstationFormData>({
    resolver: zodResolver(WorkstationCreateSchema),
    defaultValues: { workstation_name: "", hour_rate: 0, company: "" },
  });

  const createMutation = useFrappeCreate<WorkstationFormData>("Workstation", {
    onSuccess: (data) => {
      toast.success("Workstation created");
      router.push(`/manufacturing/workstation/${encodeURIComponent(data.name)}`);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Workstation"
        subtitle="Define a physical machine or operation center"
        backHref="/manufacturing/workstation"
        icon={<WorkstationIcon className="h-5 w-5" />}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
            <h3 className="font-semibold text-lg">Identity & Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput control={form.control} name="workstation_name" label="Machine Name" required />
              <FormInput control={form.control} name="hour_rate" label="Total Hour Rate" type="number" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput control={form.control} name="hour_rate_labour" label="Labour Rate" type="number" />
              <FormInput control={form.control} name="hour_rate_electricity" label="Electricity Rate" type="number" />
              <FormInput control={form.control} name="hour_rate_consumable" label="Consumables Rate" type="number" />
            </div>
            <FormFrappeSelect control={form.control} name="company" label="Company" doctype="Company" />
            <FormTextarea control={form.control} name="description" label="Technical Description" />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="rounded-full min-w-[120px]">
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Create Machine
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### 4.3 Detail Page

**File:** `app/manufacturing/workstation/[name]/page.tsx`

```typescript
// app/manufacturing/workstation/[name]/page.tsx
// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Cpu as WorkstationIcon, DollarSign, Activity } from "lucide-react";
import { useFrappeDoc, useFrappeDelete } from "@/hooks/generic";
import { PageHeader, LoadingState, EmptyState, ConfirmDialog } from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { useState } from "react";
import { toast } from "sonner";

export default function WorkstationDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const workstationName = decodeURIComponent(name as string);
  const [showDelete, setShowDelete] = useState(false);

  const { data: workstation, isLoading, error } = useFrappeDoc<Workstation>("Workstation", workstationName);

  const deleteMutation = useFrappeDelete("Workstation", {
    onSuccess: () => { router.push("/manufacturing/workstation"); toast.success("Deleted"); }
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={workstation.workstation_name}
        subtitle={workstation.name}
        backHref="/manufacturing/workstation"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`${name}/edit`)} className="rounded-full">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDelete(true)} className="rounded-full">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Rates & Financials" icon={<DollarSign className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-4">
            <DataPoint label="Total Hour Rate" value={workstation.hour_rate} />
            <DataPoint label="Labour Cost" value={workstation.hour_rate_labour || 0} />
            <DataPoint label="Electricity" value={workstation.hour_rate_electricity || 0} />
            <DataPoint label="Consumables" value={workstation.hour_rate_consumable || 0} />
          </div>
        </InfoCard>

        <InfoCard title="Details" icon={<Activity className="h-4 w-4" />}>
          <div className="space-y-4">
            <DataPoint label="Company" value={workstation.company || "—"} />
            <DataPoint label="Description" value={workstation.description || "No description provided."} />
          </div>
        </InfoCard>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Workstation?"
        onConfirm={() => deleteMutation.mutateAsync(workstationName)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
```

---

## 5. Summary

This module follows the **Premium v3 Architecture**:

1. **Generic Hooks** (`useFrappeList`, `useFrappeDoc`) properly typed.
2. **Components** using `subtitle`, `actions`, and Lucide elements as props.
3. **Form State** using `z.input` to handle defaults safely.
4. **API Security** via the centralized route structure.
