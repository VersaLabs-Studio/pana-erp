# Phase E4: Bill of Materials (BOM) Module Implementation

> **Version:** 1.0.0  
> **Module:** Manufacturing  
> **DocType:** BOM  
> **Priority:** 🔴 Critical (Core Engineering)  
> **Dependencies:** Item, Operation, Workstation

---

## Overview

The **Bill of Materials (BOM)** is the **recipe** for manufacturing. It defines exactly what raw materials and operations are needed to produce a finished product. This is the most critical module in Manufacturing.

### Business Context (Print Shop)

**Example BOM: "1000 Business Cards"**

```
MATERIALS:
├── Paper Card Stock 300gsm    × 5 sheets    @ ETB 50    = ETB 250
├── Ink Black                  × 0.1 L       @ ETB 200   = ETB 20
└── Ink Color (CMYK)           × 0.05 L      @ ETB 400   = ETB 20
                                           Subtotal: ETB 290

OPERATIONS:
├── Printing (Offset Printer)  × 30 min      @ ETB 100/hr = ETB 50
└── Cutting (Cutting Station)  × 15 min      @ ETB 60/hr  = ETB 15
                                           Subtotal: ETB 65

TOTAL COST: ETB 355 for 1000 units = ETB 0.355 per card
```

---

## 1. Field Scope Analysis

### ✅ MVP Fields (Implement Now)

| Field               | Type        | Required | Purpose                   |
| ------------------- | ----------- | -------- | ------------------------- |
| `item`              | Link (Item) | ✅       | Product to manufacture    |
| `item_name`         | Data        | Auto     | Display name              |
| `company`           | Link        | ✅       | Owning company            |
| `quantity`          | Float       | ✅       | Batch size (e.g., 1000)   |
| `uom`               | Link        | ✅       | Unit of measure           |
| `currency`          | Link        | ✅       | Costing currency          |
| `is_active`         | Check       | ❌       | Available for production  |
| `is_default`        | Check       | ❌       | Default BOM for this item |
| `with_operations`   | Check       | ❌       | Include operation costing |
| `items`             | Table       | ✅       | Raw materials child table |
| `operations`        | Table       | ❌       | Operations child table    |
| `raw_material_cost` | Currency    | Read     | Calculated                |
| `operating_cost`    | Currency    | Read     | Calculated                |
| `total_cost`        | Currency    | Read     | Calculated                |
| `rm_cost_as_per`    | Select      | ❌       | Valuation method          |

### ⏸️ Skip for MVP

- `scrap_items` - Waste tracking (Phase 2)
- `routing` - Advanced workflow routing
- `quality_inspection_template` - QA module
- `show_in_website` - E-commerce integration
- `exploded_items` - Multi-level BOM explosion

---

## 2. Configuration Updates

### 2.1 DocType Config (`lib/doctype-config.ts`)

```typescript
// MANUFACTURING MODULE section
BOM: {
  apiPath: "manufacturing/bom",
  module: "Manufacturing",
  labelField: "name",
  searchFields: ["name", "item", "item_name"],
  defaultSortField: "creation",
  defaultSortOrder: "desc",
},
"BOM Item": {
  apiPath: "manufacturing/bom-item",
  module: "Manufacturing",
  labelField: "item_code",
  isSettings: true,
},
"BOM Operation": {
  apiPath: "manufacturing/bom-operation",
  module: "Manufacturing",
  labelField: "operation",
  isSettings: true,
},
```

### 2.2 Query Keys (`lib/query-keys.ts`)

```typescript
// MANUFACTURING MODULE section
bom: {
  all: () => ["BOM"] as const,
  list: (options?: FrappeListOptions) => ["BOM", "list", options] as const,
  doc: (name: string) => ["BOM", "doc", name] as const,
  byItem: (itemCode: string) => ["BOM", "list", "item", itemCode] as const,
  defaultForItem: (itemCode: string) => ["BOM", "default", itemCode] as const,
},
```

---

## 3. Schema Definition

```typescript
// lib/schemas/doctype-schemas.ts

// BOM Item (Child Table Row)
export const BOMItemSchema = z.object({
  item_code: z.string().min(1, "Item is required"),
  item_name: z.string().optional(),
  qty: z.number().min(0.001, "Quantity must be greater than 0"),
  uom: z.string().optional(),
  rate: z.number().min(0).optional(),
  amount: z.number().optional(),
  source_warehouse: z.string().optional(),
});

// BOM Operation (Child Table Row)
export const BOMOperationSchema = z.object({
  operation: z.string().min(1, "Operation is required"),
  workstation: z.string().optional(),
  time_in_mins: z.number().min(0).default(0),
  operating_cost: z.number().optional(),
  hour_rate: z.number().optional(),
});

// BOM Create Schema
export const BOMCreateSchema = z.object({
  item: z.string().min(1, "Item is required"),
  company: z.string().min(1, "Company is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  uom: z.string().optional(),
  currency: z.string().default("ETB"),
  conversion_rate: z.number().default(1),
  is_active: z.union([z.literal(0), z.literal(1)]).default(1),
  is_default: z.union([z.literal(0), z.literal(1)]).default(0),
  with_operations: z.union([z.literal(0), z.literal(1)]).default(0),
  rm_cost_as_per: z
    .enum(["Valuation Rate", "Last Purchase Rate", "Price List"])
    .default("Valuation Rate"),
  items: z.array(BOMItemSchema).min(1, "At least one material is required"),
  operations: z.array(BOMOperationSchema).optional(),
});

export const BOMUpdateSchema = BOMCreateSchema.partial();

export type BOMFormData = z.input<typeof BOMCreateSchema>;
export type BOMItemData = z.input<typeof BOMItemSchema>;
export type BOMOperationData = z.input<typeof BOMOperationSchema>;
```

---

## 4. API Routes

### 4.1 List & Create

**File:** `app/api/manufacturing/bom/route.ts`

```typescript
// @ts-nocheck
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { BOMCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("BOM", {
  allowedFields: [
    "name",
    "item",
    "item_name",
    "company",
    "quantity",
    "uom",
    "is_active",
    "is_default",
    "with_operations",
    "raw_material_cost",
    "operating_cost",
    "total_cost",
    "currency",
    "creation",
    "docstatus",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 50,
});

export const POST = createCreateHandler("BOM", BOMCreateSchema);
```

### 4.2 Single Document

**File:** `app/api/manufacturing/bom/[name]/route.ts`

```typescript
// @ts-nocheck
import {
  createGetHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "@/lib/api-factory";
import { BOMUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("BOM");
export const PUT = createUpdateHandler("BOM", BOMUpdateSchema);
export const DELETE = createDeleteHandler("BOM");
```

---

## 5. Client Pages

### 5.1 List Page (`app/manufacturing/bom/page.tsx`)

```typescript
// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, MoreVertical, Pencil, Trash2, Search, Layers as BOMIcon,
  Package, DollarSign, CheckCircle2, XCircle, Copy, Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFrappeList, useFrappeDelete } from "@/hooks/generic";
import { PageHeader, LoadingState, EmptyState, ConfirmDialog } from "@/components/smart";
import type { Bom } from "@/types/doctype-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatCurrency(amount: number | undefined, currency = "ETB"): string {
  if (!amount) return "—";
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function BOMCard({ bom, index, onView, onEdit, onDelete, onDuplicate }) {
  const isActive = bom.is_active === 1;
  const isDefault = bom.is_default === 1;
  const isSubmitted = bom.docstatus === 1;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border/50 p-5",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
        "transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4",
        !isActive && "opacity-60"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      {/* Default Badge */}
      {isDefault && (
        <div className="absolute -top-2 -right-2 h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <Star className="h-4 w-4 text-white fill-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <BOMIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {bom.item_name || bom.item}
            </h3>
            <p className="text-xs text-muted-foreground">{bom.name}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] rounded-full">
            Qty: {bom.quantity} {bom.uom}
          </Badge>
          {isSubmitted ? (
            <Badge className="text-[10px] rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] rounded-full">Draft</Badge>
          )}
          {bom.with_operations === 1 && (
            <Badge className="text-[10px] rounded-full bg-blue-500/10 text-blue-600">
              + Operations
            </Badge>
          )}
        </div>

        {/* Costs */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Materials</p>
            <p className="font-semibold text-sm">{formatCurrency(bom.raw_material_cost, bom.currency)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Total</p>
            <p className="font-bold text-sm text-primary">{formatCurrency(bom.total_cost, bom.currency)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BOMListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "default">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: boms, isLoading, refetch } = useFrappeList<Bom>("BOM", {
    fields: ["name", "item", "item_name", "company", "quantity", "uom", "is_active", "is_default",
      "with_operations", "raw_material_cost", "operating_cost", "total_cost", "currency", "docstatus"],
    orderBy: { field: "creation", order: "desc" },
    limit: 100,
  });

  const deleteMutation = useFrappeDelete("BOM", {
    onSuccess: () => { toast.success("BOM deleted"); refetch(); setDeleteTarget(null); },
  });

  const filtered = useMemo(() => {
    if (!boms) return [];
    return boms.filter(b => {
      const matchesSearch = !searchTerm ||
        b.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" ||
        (filterStatus === "active" && b.is_active === 1) ||
        (filterStatus === "default" && b.is_default === 1);
      return matchesSearch && matchesFilter;
    });
  }, [boms, searchTerm, filterStatus]);

  if (isLoading) return <LoadingState message="Loading BOMs..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        subtitle="Define recipes for manufacturing products"
        actions={
          <Button onClick={() => router.push("/manufacturing/bom/new")} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" /> Create BOM
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by item..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full bg-card" />
        </div>
        <div className="flex gap-2">
          {["all", "active", "default"].map((f) => (
            <Button key={f} variant={filterStatus === f ? "default" : "outline"} size="sm"
              onClick={() => setFilterStatus(f as typeof filterStatus)} className="rounded-full capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={BOMIcon} title="No BOMs found" description="Create your first recipe" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((bom, idx) => (
            <BOMCard key={bom.name} bom={bom} index={idx}
              onView={() => router.push(`/manufacturing/bom/${encodeURIComponent(bom.name)}`)}
              onEdit={() => router.push(`/manufacturing/bom/${encodeURIComponent(bom.name)}/edit`)}
              onDuplicate={() => router.push(`/manufacturing/bom/new?copy=${encodeURIComponent(bom.name)}`)}
              onDelete={() => setDeleteTarget(bom.name)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete BOM?" description="This will remove the recipe. Work Orders using this BOM will be affected."
        onConfirm={() => deleteMutation.mutateAsync(deleteTarget!)} isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}
```

---

## 6. Create Page Structure

The Create page is the most complex. Key features:

### 6.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Product Selection & Settings                           │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ Item (Product)          │ │ Company                         │ │
│ │ [Select finished good]  │ │ [Select company]                │ │
│ └─────────────────────────┘ └─────────────────────────────────┘ │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐ │
│ │ Quantity  │ │ UOM       │ │ Currency  │ │ □ With Operations │ │
│ │ [1000]    │ │ [Nos]     │ │ [ETB]     │ │ □ Is Default      │ │
│ └───────────┘ └───────────┘ └───────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MATERIALS (Child Table)                            [+ Add Item] │
│ ┌───────────────────────────────────────────────────────────────┤
│ │ Item         │ Qty  │ UOM  │ Rate    │ Amount   │ Actions    │
│ ├──────────────┼──────┼──────┼─────────┼──────────┼────────────┤
│ │ Paper 300gsm │ 5    │ Sheet│ 50.00   │ 250.00   │ [x]        │
│ │ Ink Black    │ 0.1  │ L    │ 200.00  │ 20.00    │ [x]        │
│ └───────────────────────────────────────────────────────────────┤
├─────────────────────────────────────────────────────────────────┤
│ OPERATIONS (Child Table - if enabled)         [+ Add Operation] │
│ ┌───────────────────────────────────────────────────────────────┤
│ │ Operation  │ Workstation    │ Time (min) │ Rate/hr │ Cost     │
│ ├────────────┼────────────────┼────────────┼─────────┼──────────┤
│ │ Printing   │ Offset Printer │ 30         │ 100.00  │ 50.00    │
│ │ Cutting    │ Cutting Station│ 15         │ 60.00   │ 15.00    │
│ └───────────────────────────────────────────────────────────────┤
├─────────────────────────────────────────────────────────────────┤
│ COST SUMMARY (Sticky Sidebar on Desktop)                        │
│ ┌───────────────────────────────────────────────────────────────┤
│ │ Raw Material Cost:        ETB 290.00                          │
│ │ Operating Cost:           ETB 65.00                           │
│ │ ─────────────────────────────────────                         │
│ │ TOTAL COST:               ETB 355.00                          │
│ │ Cost per Unit:            ETB 0.355                           │
│ └───────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Testing Checklist

- [ ] Create BOM for "1000 Business Cards" with paper and ink
- [ ] Add operations (Printing, Cutting)
- [ ] Verify cost calculations update in real-time
- [ ] Set BOM as default for item
- [ ] Duplicate existing BOM
- [ ] Edit BOM materials
- [ ] Submit BOM (docstatus = 1)
- [ ] Verify submitted BOM cannot be edited
- [ ] Delete draft BOM
- [ ] Test filters (all, active, default)
- [ ] Test search by item name

---

## 8. Integration Points

| Module          | Integration                              |
| --------------- | ---------------------------------------- |
| **Item**        | Select finished goods to manufacture     |
| **Workstation** | Fetch hour rates for operations          |
| **Operation**   | Select from predefined operations        |
| **Work Order**  | Uses BOM to create production commands   |
| **Stock Entry** | BOM items determine material consumption |

---

_See Part 2 for complete Create/Edit/Detail page implementations._
