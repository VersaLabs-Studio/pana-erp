// @ts-nocheck
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  ArrowRightLeft,
  Plus,
  Trash2,
  Package,
  LogIn,
  LogOut,
  Factory,
  Cog,
  Truck,
  Building2,
  AlertTriangle,
  Info,
  Layers,
  Badge,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  useFrappeCreate,
  useFrappeDoc,
  useFrappeList,
  useFrappeUpdate,
} from "@/hooks/generic";
import { PageHeader, LoadingState } from "@/components/smart";
import {
  FormInput,
  FormFrappeSelect,
  FormSelect,
  FormTextarea,
} from "@/components/form";
import {
  StockEntryCreateSchema,
  StockEntryFormData,
} from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { WorkOrder, Bom, MaterialRequest } from "@/types/doctype-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PURPOSES = [
  {
    value: "Material Receipt",
    label: "Receipt",
    icon: LogIn,
    color: "emerald",
    desc: "Stock In",
  },
  {
    value: "Material Issue",
    label: "Issue",
    icon: LogOut,
    color: "red",
    desc: "Stock Out",
  },
  {
    value: "Material Transfer",
    label: "Transfer",
    icon: ArrowRightLeft,
    color: "blue",
    desc: "Internal Move",
  },
  {
    value: "Material Transfer for Manufacture",
    label: "Issue for Mfg",
    icon: Factory,
    color: "indigo",
    desc: "Move to WIP",
  },
  {
    value: "Manufacture",
    label: "Finish Product",
    icon: Cog,
    color: "violet",
    desc: "WIP to FG",
  },
  {
    value: "Repack",
    label: "Repack",
    icon: Package,
    color: "amber",
    desc: "Asm/Dasm",
  },
];

function CreateStockEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prePurpose = searchParams.get("purpose") || "Material Transfer";
  const preWorkOrder = searchParams.get("work_order");
  const preMaterialRequest = searchParams.get("material_request");

  const form = useForm<StockEntryFormData>({
    resolver: zodResolver(StockEntryCreateSchema),
    defaultValues: {
      naming_series: "MAT-STE-.YYYY.-",
      stock_entry_type: prePurpose,
      purpose: prePurpose,
      company: "",
      posting_date: new Date().toISOString().split("T")[0],
      posting_time: new Date().toTimeString().slice(0, 5),
      work_order: preWorkOrder || "",
      material_request: preMaterialRequest || "",
      from_warehouse: "",
      to_warehouse: "",
      fg_completed_qty: 0,
      items: [],
      remarks: "",
    },
  });

  const purpose = form.watch("purpose");
  const workOrder = form.watch("work_order");
  const fgQty = form.watch("fg_completed_qty");

  // State to track whether to submit (docstatus=1) after creation
  const [submitAfterCreate, setSubmitAfterCreate] = useState(true);

  const isManufacture = purpose === "Manufacture";
  const isTransferForMfg = purpose === "Material Transfer for Manufacture";
  const needsSource = [
    "Material Issue",
    "Material Transfer",
    "Material Transfer for Manufacture",
    "Send to Subcontractor",
  ].includes(purpose);
  const needsTarget = [
    "Material Receipt",
    "Material Transfer",
    "Manufacture",
  ].includes(purpose);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch Work Order details
  const { data: woDetails } = useFrappeDoc<WorkOrder>(
    "Work Order",
    workOrder || "",
    { enabled: !!workOrder },
  );

  // Auto-populate items from Work Order for manufacturing flows
  useEffect(() => {
    if (woDetails && (isManufacture || isTransferForMfg)) {
      // Set company
      form.setValue("company", woDetails.company);

      // Determine source warehouse: source_warehouse (raw materials) -> wip_warehouse fallback
      const sourceWH =
        woDetails.source_warehouse || woDetails.wip_warehouse || "";
      // Determine target warehouse based on purpose
      const targetWH = isManufacture
        ? woDetails.fg_warehouse
        : woDetails.wip_warehouse || "";

      form.setValue("from_warehouse", sourceWH);
      form.setValue("to_warehouse", targetWH);

      // Calculate remaining quantity to produce/transfer
      const remainingQty = Math.max(
        0,
        woDetails.qty - (woDetails.produced_qty || 0),
      );
      form.setValue("fg_completed_qty", remainingQty);
      form.setValue("bom_no", woDetails.bom_no);

      // Populate items from Work Order required_items
      if (woDetails.required_items?.length > 0) {
        const items = woDetails.required_items.map((item: any) => {
          // For Transfer for Mfg: only transfer what hasn't been transferred yet
          // For other purposes: use full required qty
          const pendingQty = isTransferForMfg
            ? Math.max(
                0,
                (item.required_qty || 0) - (item.transferred_qty || 0),
              )
            : item.required_qty || 0;

          return {
            item_code: item.item_code,
            item_name: item.item_name || item.item_code,
            qty: pendingQty,
            uom: item.uom || item.stock_uom || "Nos",
            // Source warehouse: item's source or work order's source
            s_warehouse: item.source_warehouse || sourceWH,
            // Target warehouse: WIP for transfer, FG for manufacture
            t_warehouse: isTransferForMfg ? woDetails.wip_warehouse : undefined,
            work_order: woDetails.name,
            bom_no: woDetails.bom_no,
            basic_rate: item.rate || item.valuation_rate || 0,
            doctype: "Stock Entry Detail",
          };
        });

        // Only include items with pending quantity
        replace(items.filter((i) => i.qty > 0));
      }
    }
  }, [woDetails, isManufacture, isTransferForMfg, replace, form]);

  // Add finished goods item for Manufacture
  useEffect(() => {
    if (isManufacture && woDetails && fgQty > 0) {
      const existingFG = fields.find((f) => f.is_finished_item);
      if (!existingFG) {
        append({
          item_code: woDetails.production_item,
          item_name: woDetails.item_name,
          qty: fgQty,
          uom: woDetails.stock_uom || "Nos",
          t_warehouse: woDetails.fg_warehouse,
          work_order: woDetails.name,
          bom_no: woDetails.bom_no,
          is_finished_item: true,
          basic_rate: 0,
          doctype: "Stock Entry Detail",
        });
      }
    }
  }, [fgQty, isManufacture, woDetails, fields, append]);

  const workOrderUpdateMutation = useFrappeUpdate("Work Order", {
    onSuccess: () => {
      console.log("Work Order status updated to In Process");
    },
    onError: (err) =>
      console.error("Failed to update Work Order status:", err.message),
  });

  const createMutation = useFrappeCreate("Stock Entry", {
    onSuccess: (response) => {
      const docstatus = response.data?.docstatus ?? response.docstatus;
      const wasSubmitted = docstatus === 1;

      // Proactively update Work Order status if material is transferred
      if (
        wasSubmitted &&
        workOrder &&
        (purpose === "Material Transfer for Manufacture" ||
          purpose === "Manufacture")
      ) {
        workOrderUpdateMutation.mutate({
          name: workOrder,
          data: { status: "In Process" },
        });
      }

      toast.success(
        wasSubmitted
          ? "Stock Entry submitted successfully! Work Order status updated."
          : "Stock Entry saved as draft.",
      );
      router.push(
        `/stock/stock-entry/${encodeURIComponent(response.data?.name || response.name)}`,
      );
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data: StockEntryFormData) => {
    // Ensure stock_entry_type is never null - use purpose or default
    const stockEntryType =
      data.stock_entry_type || data.purpose || "Material Transfer";

    const payload = {
      ...data,
      // docstatus: 1 = submitted (updates Work Order status), 0 = draft
      docstatus: submitAfterCreate ? 1 : 0,
      stock_entry_type: stockEntryType,
      from_bom: data.bom_no ? 1 : 0,
      // Also set purpose to match for ERPNext compatibility
      purpose: data.purpose || stockEntryType,
      items: data.items.map((item) => ({
        ...item,
        work_order: data.work_order,
        bom_no: data.bom_no,
        s_warehouse:
          item.s_warehouse || (needsSource ? data.from_warehouse : undefined),
        t_warehouse:
          item.t_warehouse || (needsTarget ? data.to_warehouse : undefined),
        basic_amount: (Number(item.qty) || 0) * (Number(item.basic_rate) || 0),
        doctype: "Stock Entry Detail",
      })),
    };
    createMutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Purpose Selector */}
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">
                    Logistics Purpose
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select the type of inventory movement to record
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {PURPOSES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      form.setValue("purpose", p.value);
                      form.setValue("stock_entry_type", p.value);
                    }}
                    className={cn(
                      "group p-4 rounded-[2rem] border-2 transition-all text-center flex flex-col items-center justify-center gap-2",
                      purpose === p.value
                        ? `border-${p.color}-500 bg-${p.color}-500/5`
                        : "border-border/50 hover:border-primary/30 bg-secondary/20",
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                        purpose === p.value
                          ? `bg-${p.color}-500 text-white shadow-lg`
                          : "bg-background text-muted-foreground",
                      )}
                    >
                      <p.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-black text-[10px] uppercase tracking-tighter",
                          purpose === p.value
                            ? `text-${p.color}-600`
                            : "text-foreground",
                        )}
                      >
                        {p.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-medium">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Info */}
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">
                    Registry Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Company, warehouse and timing configuration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormFrappeSelect
                  control={form.control}
                  name="company"
                  label="Company"
                  doctype="Company"
                  required
                />
                <FormInput
                  control={form.control}
                  name="posting_date"
                  label="Posting Date"
                  type="date"
                  required
                />
                <FormInput
                  control={form.control}
                  name="posting_time"
                  label="Posting Time"
                  type="time"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6 px-8 rounded-[2rem] bg-secondary/20 border border-border/50 relative overflow-hidden">
                {needsSource && (
                  <FormFrappeSelect
                    control={form.control}
                    name="from_warehouse"
                    label="Master Source Warehouse"
                    doctype="Warehouse"
                    placeholder="Auto-pull from..."
                    filters={[["is_group", "=", 0]]}
                    required
                  />
                )}
                {needsTarget && (
                  <FormFrappeSelect
                    control={form.control}
                    name="to_warehouse"
                    label="Master Target Warehouse"
                    doctype="Warehouse"
                    placeholder="Auto-push to..."
                    filters={[["is_group", "=", 0]]}
                    required
                  />
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 hidden md:block">
                  <ArrowRightLeft className="h-32 w-32" />
                </div>
              </div>

              {(isManufacture || isTransferForMfg) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                  <div className="space-y-4">
                    <FormFrappeSelect
                      control={form.control}
                      name="work_order"
                      label="Linked Work Order"
                      doctype="Work Order"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground italic px-1 flex gap-2">
                      <Info className="h-3 w-3" /> Materials and completion
                      targets will sync from this order.
                    </p>
                  </div>
                  {isManufacture && (
                    <FormInput
                      control={form.control}
                      name="fg_completed_qty"
                      label="Finished Quantity"
                      type="number"
                      placeholder="Amount produced now"
                    />
                  )}
                </div>
              )}

              <FormTextarea
                control={form.control}
                name="remarks"
                label="Movement Remarks"
                rows={3}
                placeholder="Internal audit notes or reason for movement..."
              />
            </div>

            {/* Items Table */}
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-lg shadow-primary/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight">
                      Movement Log
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Physical items involved in this entry
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full font-bold h-9"
                  onClick={() =>
                    append({
                      item_code: "",
                      qty: 1,
                      uom: "Nos",
                      basic_rate: 0,
                      doctype: "Stock Entry Detail",
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-2" /> Add Item
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-[2.5rem] bg-secondary/5">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-sm font-bold text-muted-foreground">
                    Items will appear here based on selected Work Order
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Or click "Add Item" to record manual movements
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={cn(
                        "group relative grid grid-cols-12 gap-4 items-end p-6 rounded-[2rem] border transition-all shadow-inner",
                        field.is_finished_item
                          ? "bg-violet-500/5 border-violet-500/20 shadow-violet-500/5"
                          : "bg-secondary/10 border-border/50 hover:bg-secondary/20",
                      )}
                    >
                      <div className="col-span-12 md:col-span-4">
                        <FormFrappeSelect
                          control={form.control}
                          name={`items.${index}.item_code`}
                          label={
                            field.is_finished_item
                              ? "Finished Product"
                              : "Item Code"
                          }
                          doctype="Item"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <FormInput
                          control={form.control}
                          name={`items.${index}.qty`}
                          label="Quantity"
                          type="number"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <FormFrappeSelect
                          control={form.control}
                          name={`items.${index}.uom`}
                          label="UOM"
                          doctype="UOM"
                        />
                      </div>
                      <div className="col-span-10 md:col-span-3">
                        <FormInput
                          control={form.control}
                          name={`items.${index}.basic_rate`}
                          label="Unit Cost (ETB)"
                          type="number"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-end pb-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.is_finished_item && (
                        <div className="absolute top-4 right-6 flex items-center gap-2 px-3 py-1 bg-violet-500/10 rounded-full border border-violet-500/20">
                          <Layers className="h-3 w-3 text-violet-600" />
                          <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">
                            Post-Manufacturing Output
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 sticky top-6 space-y-8 shadow-xl shadow-primary/5">
              <h3 className="font-bold text-lg tracking-tight border-b border-border/50 pb-4">
                Entry Analysis
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Purpose
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-lg font-black uppercase text-[10px] h-7 px-3 border-current/20"
                  >
                    {purpose}
                  </Badge>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Inventory Lines
                  </span>
                  <span className="font-black text-lg">{fields.length}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Total Qty
                  </span>
                  <span className="font-black text-xl text-primary">
                    {form
                      .watch("items")
                      ?.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)}
                  </span>
                </div>
              </div>

              {woDetails && (
                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <Factory className="h-5 w-5" />
                    <p className="font-black text-[11px] uppercase tracking-widest">
                      Production Context
                    </p>
                  </div>
                  <div>
                    <p className="font-black text-sm text-indigo-600 truncate">
                      {woDetails.name}
                    </p>
                    <p className="text-[11px] text-indigo-600/70 font-medium">
                      Item: {woDetails.item_name || woDetails.production_item}
                    </p>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold border-t border-indigo-500/10 pt-3">
                    <span className="text-muted-foreground">Target Qty</span>
                    <span>
                      {woDetails.qty} {woDetails.stock_uom}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Option */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <Checkbox
                  id="submitAfterCreate"
                  checked={submitAfterCreate}
                  onCheckedChange={(checked) => setSubmitAfterCreate(!!checked)}
                  className="h-5 w-5 border-2 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="submitAfterCreate"
                    className="font-bold text-sm cursor-pointer"
                  >
                    Submit Entry
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    {submitAfterCreate
                      ? "Entry will be submitted and update linked Work Order status"
                      : "Entry will be saved as draft (won't update Work Order)"}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending || fields.length === 0}
                className={cn(
                  "w-full rounded-2xl h-14 font-black uppercase tracking-[0.1em] text-xs shadow-lg transition-all",
                  submitAfterCreate
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/30"
                    : "shadow-primary/20 hover:shadow-primary/30",
                )}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-3" />
                )}
                {submitAfterCreate ? "Submit & Post Entry" : "Save as Draft"}
              </Button>

              <div className="p-5 rounded-3xl bg-secondary/30 text-[11px] text-muted-foreground font-medium border border-border/50 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                {submitAfterCreate
                  ? "Submitting will update Stock Ledger, Work Order status, and affect weighted average costs immediately."
                  : "Draft entries won't affect stock levels until submitted."}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default function CreateStockEntryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Stock Journal"
        subtitle="Authorize physical inventory movement across locations"
        backHref="/stock/stock-entry"
      />
      <Suspense fallback={<LoadingState />}>
        <CreateStockEntryForm />
      </Suspense>
    </div>
  );
}
