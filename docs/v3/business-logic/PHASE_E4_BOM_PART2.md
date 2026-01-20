# Phase E4: BOM Module - Part 2 (Create, Detail, Edit Pages)

> **Continuation of PHASE_E4_BOM_PART1.md**

---

## 9. Create Page

**File:** `app/manufacturing/bom/new/page.tsx`

```typescript
// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save, Loader2, Layers as BOMIcon, Plus, Trash2, Package,
  Cog, DollarSign, Calculator, AlertTriangle, Clock,
} from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useFrappeCreate, useFrappeDoc, useFrappeList } from "@/hooks/generic";
import { PageHeader, LoadingState } from "@/components/smart";
import { FormInput, FormFrappeSelect, FormSwitch } from "@/components/form";
import { BOMCreateSchema, type BOMFormData } from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Item, Workstation, Operation } from "@/types/doctype-types";

export default function CreateBOMPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFrom = searchParams.get("copy");

  const [withOperations, setWithOperations] = useState(false);

  const form = useForm<BOMFormData>({
    resolver: zodResolver(BOMCreateSchema),
    defaultValues: {
      item: "",
      company: "",
      quantity: 1,
      uom: "Nos",
      currency: "ETB",
      conversion_rate: 1,
      is_active: 1,
      is_default: 0,
      with_operations: 0,
      rm_cost_as_per: "Valuation Rate",
      items: [],
      operations: [],
    },
  });

  // Material items array
  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Operation items array
  const { fields: operationFields, append: appendOperation, remove: removeOperation } = useFieldArray({
    control: form.control,
    name: "operations",
  });

  // Fetch workstations for rate lookup
  const { data: workstations } = useFrappeList<Workstation>("Workstation", {
    fields: ["name", "workstation_name", "hour_rate"],
    limit: 100,
  });

  // Copy BOM data if duplicating
  const { data: sourceBOM } = useFrappeDoc("BOM", copyFrom || "", { enabled: !!copyFrom });

  useEffect(() => {
    if (sourceBOM) {
      form.reset({
        ...form.getValues(),
        item: sourceBOM.item,
        quantity: sourceBOM.quantity,
        uom: sourceBOM.uom,
        company: sourceBOM.company,
        with_operations: sourceBOM.with_operations,
        items: sourceBOM.items?.map((i: any) => ({
          item_code: i.item_code,
          qty: i.qty,
          uom: i.uom,
          rate: i.rate,
        })) || [],
        operations: sourceBOM.operations?.map((o: any) => ({
          operation: o.operation,
          workstation: o.workstation,
          time_in_mins: o.time_in_mins,
        })) || [],
      });
      setWithOperations(sourceBOM.with_operations === 1);
      toast.info(`Copied from ${sourceBOM.name}`);
    }
  }, [sourceBOM]);

  // Calculate costs
  const materials = form.watch("items") || [];
  const operations = form.watch("operations") || [];
  const quantity = form.watch("quantity") || 1;

  const rawMaterialCost = useMemo(() => {
    return materials.reduce((sum, m) => sum + ((m.qty || 0) * (m.rate || 0)), 0);
  }, [materials]);

  const operatingCost = useMemo(() => {
    return operations.reduce((sum, op) => {
      const ws = workstations?.find(w => w.name === op.workstation);
      const hourRate = ws?.hour_rate || op.hour_rate || 0;
      return sum + ((op.time_in_mins || 0) / 60) * hourRate;
    }, 0);
  }, [operations, workstations]);

  const totalCost = rawMaterialCost + operatingCost;
  const costPerUnit = quantity > 0 ? totalCost / quantity : 0;

  // Handle workstation selection to auto-fill rate
  const handleWorkstationChange = (index: number, workstationName: string) => {
    const ws = workstations?.find(w => w.name === workstationName);
    if (ws) {
      form.setValue(`operations.${index}.hour_rate`, ws.hour_rate);
    }
  };

  // Create mutation
  const createMutation = useFrappeCreate("BOM", {
    onSuccess: (data) => {
      toast.success("BOM created successfully");
      router.push(`/manufacturing/bom/${encodeURIComponent(data.name)}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: BOMFormData) => {
    data.with_operations = withOperations ? 1 : 0;
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Bill of Materials"
        subtitle="Define the recipe to manufacture a product"
        backHref="/manufacturing/bom"
        icon={<BOMIcon className="h-5 w-5" />}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Section */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Product Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFrappeSelect control={form.control} name="item" label="Product to Manufacture"
                    doctype="Item" placeholder="Select finished good..." required />
                  <FormFrappeSelect control={form.control} name="company" label="Company"
                    doctype="Company" required />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormInput control={form.control} name="quantity" label="Batch Quantity" type="number" required />
                  <FormFrappeSelect control={form.control} name="uom" label="UOM" doctype="UOM" />
                  <FormFrappeSelect control={form.control} name="currency" label="Currency" doctype="Currency" />
                  <div className="flex items-end pb-2 gap-4">
                    <FormSwitch control={form.control} name="is_default" label="Default BOM" />
                  </div>
                </div>

                {/* Operations Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-medium">Include Operations Costing</p>
                    <p className="text-sm text-muted-foreground">Add machine time costs to BOM</p>
                  </div>
                  <Switch checked={withOperations} onCheckedChange={setWithOperations} />
                </div>
              </div>

              {/* Materials Section */}
              <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-lg">
                    <Package className="h-5 w-5 text-emerald-500" />
                    Raw Materials
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-full"
                    onClick={() => appendMaterial({ item_code: "", qty: 1, uom: "", rate: 0 })}>
                    <Plus className="h-4 w-4 mr-1" /> Add Material
                  </Button>
                </div>

                {materialFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No materials added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materialFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/20 rounded-xl">
                        <div className="col-span-4">
                          <FormFrappeSelect control={form.control} name={`items.${index}.item_code`}
                            label={index === 0 ? "Item" : undefined} doctype="Item" placeholder="Select..." />
                        </div>
                        <div className="col-span-2">
                          <FormInput control={form.control} name={`items.${index}.qty`}
                            label={index === 0 ? "Qty" : undefined} type="number" />
                        </div>
                        <div className="col-span-2">
                          <FormFrappeSelect control={form.control} name={`items.${index}.uom`}
                            label={index === 0 ? "UOM" : undefined} doctype="UOM" />
                        </div>
                        <div className="col-span-2">
                          <FormInput control={form.control} name={`items.${index}.rate`}
                            label={index === 0 ? "Rate" : undefined} type="number" />
                        </div>
                        <div className="col-span-1 text-right font-medium text-sm">
                          {((form.watch(`items.${index}.qty`) || 0) * (form.watch(`items.${index}.rate`) || 0)).toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                            onClick={() => removeMaterial(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Operations Section */}
              {withOperations && (
                <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                      <Cog className="h-5 w-5 text-blue-500" />
                      Operations
                    </div>
                    <Button type="button" variant="outline" size="sm" className="rounded-full"
                      onClick={() => appendOperation({ operation: "", workstation: "", time_in_mins: 0, hour_rate: 0 })}>
                      <Plus className="h-4 w-4 mr-1" /> Add Operation
                    </Button>
                  </div>

                  {operationFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Cog className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No operations added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {operationFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-secondary/20 rounded-xl">
                          <div className="col-span-3">
                            <FormFrappeSelect control={form.control} name={`operations.${index}.operation`}
                              label={index === 0 ? "Operation" : undefined} doctype="Operation" />
                          </div>
                          <div className="col-span-3">
                            <FormFrappeSelect control={form.control} name={`operations.${index}.workstation`}
                              label={index === 0 ? "Workstation" : undefined} doctype="Workstation"
                              onChange={(val) => handleWorkstationChange(index, val)} />
                          </div>
                          <div className="col-span-2">
                            <FormInput control={form.control} name={`operations.${index}.time_in_mins`}
                              label={index === 0 ? "Time (min)" : undefined} type="number" />
                          </div>
                          <div className="col-span-2">
                            <FormInput control={form.control} name={`operations.${index}.hour_rate`}
                              label={index === 0 ? "Rate/hr" : undefined} type="number" disabled />
                          </div>
                          <div className="col-span-1 text-right font-medium text-sm">
                            {(((form.watch(`operations.${index}.time_in_mins`) || 0) / 60) *
                              (form.watch(`operations.${index}.hour_rate`) || 0)).toFixed(2)}
                          </div>
                          <div className="col-span-1">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                              onClick={() => removeOperation(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cost Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-6 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  Cost Summary
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Raw Materials</span>
                    <span className="font-medium">ETB {rawMaterialCost.toFixed(2)}</span>
                  </div>
                  {withOperations && (
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Operations</span>
                      <span className="font-medium">ETB {operatingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 text-lg font-bold">
                    <span>Total Cost</span>
                    <span className="text-primary">ETB {totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-primary/5 rounded-xl px-3">
                    <span className="text-muted-foreground">Cost per Unit</span>
                    <span className="font-bold text-primary">ETB {costPerUnit.toFixed(4)}</span>
                  </div>
                </div>

                {materials.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Add at least one material</span>
                  </div>
                )}

                <Button type="submit" disabled={createMutation.isPending || materials.length === 0}
                  className="w-full rounded-full mt-4">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Create BOM
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

---

## 10. Detail Page

**File:** `app/manufacturing/bom/[name]/page.tsx`

```typescript
// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil, Trash2, Layers as BOMIcon, Package, Cog, DollarSign,
  CheckCircle2, Star, Copy, Play, FileText, Clock,
} from "lucide-react";
import { useFrappeDoc, useFrappeDelete, useFrappeUpdate } from "@/hooks/generic";
import { PageHeader, LoadingState, EmptyState, ConfirmDialog } from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import type { Bom } from "@/types/doctype-types";

export default function BOMDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const bomName = decodeURIComponent(name as string);
  const [showDelete, setShowDelete] = useState(false);

  const { data: bom, isLoading, refetch } = useFrappeDoc<Bom>("BOM", bomName);

  const deleteMutation = useFrappeDelete("BOM", {
    onSuccess: () => { router.push("/manufacturing/bom"); toast.success("BOM deleted"); },
  });

  const submitMutation = useFrappeUpdate("BOM", {
    onSuccess: () => { refetch(); toast.success("BOM submitted"); },
  });

  if (isLoading) return <LoadingState />;
  if (!bom) return <EmptyState icon={BOMIcon} title="BOM not found" />;

  const isSubmitted = bom.docstatus === 1;
  const isDefault = bom.is_default === 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={bom.item_name || bom.item}
        subtitle={bom.name}
        backHref="/manufacturing/bom"
        icon={<BOMIcon className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            {!isSubmitted && (
              <>
                <Button variant="outline" onClick={() => router.push(`${bomName}/edit`)} className="rounded-full">
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button onClick={() => submitMutation.mutate({ name: bomName, data: { docstatus: 1 } })} className="rounded-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Submit
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => router.push(`/manufacturing/bom/new?copy=${bomName}`)} className="rounded-full">
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </Button>
            <Button variant="outline" onClick={() => router.push(`/manufacturing/work-order/new?bom=${bomName}`)} className="rounded-full">
              <Play className="h-4 w-4 mr-2" /> Create Work Order
            </Button>
          </div>
        }
      />

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={isSubmitted ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary"}>
          {isSubmitted ? "Submitted" : "Draft"}
        </Badge>
        {isDefault && <Badge className="bg-amber-500/10 text-amber-600"><Star className="h-3 w-3 mr-1" />Default</Badge>}
        {bom.is_active === 1 && <Badge className="bg-blue-500/10 text-blue-600">Active</Badge>}
        {bom.with_operations === 1 && <Badge className="bg-violet-500/10 text-violet-600"><Cog className="h-3 w-3 mr-1" />With Operations</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <InfoCard title="Product Information" icon={<Package className="h-4 w-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DataPoint label="Item" value={bom.item} link={`/stock/item/${encodeURIComponent(bom.item)}`} />
              <DataPoint label="Item Name" value={bom.item_name} />
              <DataPoint label="Quantity" value={`${bom.quantity} ${bom.uom}`} />
              <DataPoint label="Company" value={bom.company} />
            </div>
          </InfoCard>

          {/* Materials Table */}
          <InfoCard title={`Raw Materials (${bom.items?.length || 0})`} icon={<Package className="h-4 w-4" />}>
            {bom.items?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/30">
                        <td className="py-3">
                          <Link href={`/stock/item/${encodeURIComponent(item.item_code)}`} className="text-primary hover:underline">
                            {item.item_name || item.item_code}
                          </Link>
                        </td>
                        <td className="text-right">{item.qty} {item.uom}</td>
                        <td className="text-right">{bom.currency} {item.rate?.toFixed(2)}</td>
                        <td className="text-right font-medium">{bom.currency} {item.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No materials defined</p>
            )}
          </InfoCard>

          {/* Operations Table */}
          {bom.with_operations === 1 && (
            <InfoCard title={`Operations (${bom.operations?.length || 0})`} icon={<Cog className="h-4 w-4" />}>
              {bom.operations?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left py-2">Operation</th>
                        <th className="text-left py-2">Workstation</th>
                        <th className="text-right py-2">Time</th>
                        <th className="text-right py-2">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bom.operations.map((op: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/30">
                          <td className="py-3">{op.operation}</td>
                          <td>{op.workstation}</td>
                          <td className="text-right">{op.time_in_mins} min</td>
                          <td className="text-right font-medium">{bom.currency} {op.operating_cost?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No operations defined</p>
              )}
            </InfoCard>
          )}
        </div>

        {/* Right Column - Cost Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center gap-2 font-semibold text-lg mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              Cost Breakdown
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Raw Materials</span>
                <span className="font-medium">{bom.currency} {bom.raw_material_cost?.toFixed(2)}</span>
              </div>
              {bom.with_operations === 1 && (
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Operations</span>
                  <span className="font-medium">{bom.currency} {bom.operating_cost?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-xl font-bold">
                <span>Total Cost</span>
                <span className="text-primary">{bom.currency} {bom.total_cost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-background rounded-xl">
                <span className="text-sm text-muted-foreground">Cost per Unit</span>
                <span className="font-bold text-lg">{bom.currency} {((bom.total_cost || 0) / (bom.quantity || 1)).toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <InfoCard title="System Info" icon={<FileText className="h-4 w-4" />}>
            <div className="space-y-2 text-sm">
              <DataPoint label="Created" value={bom.creation ? new Date(bom.creation).toLocaleDateString() : "—"} />
              <DataPoint label="Modified" value={bom.modified ? new Date(bom.modified).toLocaleDateString() : "—"} />
              <DataPoint label="Owner" value={bom.owner} />
            </div>
          </InfoCard>
        </div>
      </div>

      <ConfirmDialog open={showDelete} onOpenChange={setShowDelete} title="Delete BOM?"
        description="This cannot be undone." onConfirm={() => deleteMutation.mutateAsync(bomName)}
        isLoading={deleteMutation.isPending} variant="destructive" />
    </div>
  );
}
```

---

## 11. File Structure Summary

```
app/manufacturing/bom/
├── page.tsx                    # List View with cards
├── new/page.tsx                # Create with child tables
└── [name]/
    ├── page.tsx                # Detail with cost breakdown
    └── edit/page.tsx           # Edit (similar to create)

app/api/manufacturing/bom/
├── route.ts                    # GET list, POST create
└── [name]/route.ts             # GET, PUT, DELETE
```

---

## 12. Key Integration Points

| Action            | Target      | URL Pattern                                |
| ----------------- | ----------- | ------------------------------------------ |
| Duplicate BOM     | Create page | `/manufacturing/bom/new?copy={name}`       |
| Create Work Order | Work Order  | `/manufacturing/work-order/new?bom={name}` |
| View Item         | Item detail | `/stock/item/{item_code}`                  |

---

_End of Phase E4 BOM Module Documentation_
