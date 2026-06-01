// @ts-nocheck
"use client";

import { useMemo, useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  MapPin,
  Calculator,
  Briefcase,
  Building2,
  Package,
  AlertTriangle,
  Settings2,
  Users,
  Check,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useFrappeDoc, useFrappeUpdate, useFrappeList } from "@/hooks/generic";
import { PageHeader, LoadingState } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import {
  FormInput,
  FormSelect,
  FormFrappeSelect,
  FormDatePicker,
  FormTextarea,
} from "@/components/form";
import { SalesOrderUpdateSchema } from "@/lib/schemas/doctype-schemas";
import type { SalesOrder } from "@/types/doctype-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EditSalesOrderPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);
  const [dataInitialized, setDataInitialized] = useState(false);

  // --- Fetch Original Data ---
  const {
    data: order,
    isLoading: isOrderLoading,
    refetch,
  } = useFrappeDoc<SalesOrder>("Sales Order", name);

  // --- Fetch Related Data ---
  const { data: taxTemplates } = useFrappeList<any>(
    "Sales Taxes and Charges Template",
    { limit: 50 },
  );
  const { data: termsTemplates } = useFrappeList<any>("Terms and Conditions", {
    limit: 50,
  });

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(SalesOrderUpdateSchema),
    defaultValues: {
      naming_series: "",
      customer: "",
      order_type: "Sales",
      transaction_date: "",
      delivery_date: "",
      company: "",
      currency: "ETB",
      selling_price_list: "",
      customer_address: "",
      contact_person: "",
      taxes_and_charges: "",
      tc_name: "",
      terms: "",
      po_no: "",
      po_date: "",
      sales_partner: "",
      commission_rate: 0,
      project: "",
      items: [],
    },
  });

  const { control, handleSubmit, watch, setValue, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });
  const selectedCustomer = watch("customer");

  // --- Populate Form When Data Loads ---
  useEffect(() => {
    if (order && !dataInitialized) {
      if (order.docstatus !== 0) {
        toast.error("Only draft orders can be edited");
        router.replace(`/sales/sales-order/${encodeURIComponent(name)}`);
        return;
      }

      console.log("Initializing Edit Form with:", order);

      const items =
        order.items?.map((i) => ({
          item_code: i.item_code,
          item_name: i.item_name,
          description: i.description || "",
          qty: i.qty,
          rate: i.rate,
          uom: i.uom || "Nos",
          amount: i.amount,
        })) || [];

      reset({
        naming_series: order.naming_series || "SAL-ORD-.YYYY.-",
        customer: order.customer,
        customer_name: order.customer_name,
        order_type: order.order_type || "Sales",
        transaction_date: order.transaction_date,
        delivery_date: order.delivery_date,
        company: order.company,
        currency: order.currency || "ETB",
        selling_price_list: order.selling_price_list || "Standard Selling",
        customer_address: order.customer_address,
        contact_person: order.contact_person,
        taxes_and_charges: order.taxes_and_charges,
        tc_name: order.tc_name,
        terms: order.terms,
        po_no: order.po_no,
        po_date: order.po_date,
        sales_partner: order.sales_partner,
        commission_rate: order.commission_rate || 0,
        project: order.project,
        items,
      });
      setDataInitialized(true);
    }
  }, [order, reset, dataInitialized, router, name]);

  // --- Calculations ---
  const totals = useMemo(() => {
    if (!watchedItems || !Array.isArray(watchedItems))
      return { subtotal: 0, itemsCount: 0 };
    const subtotal = watchedItems.reduce((acc, item) => {
      const qty = Number(item?.qty) || 0;
      const rate = Number(item?.rate) || 0;
      return acc + qty * rate;
    }, 0);
    return { subtotal, itemsCount: watchedItems.length };
  }, [watchedItems]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  // --- Submission ---
  const updateMutation = useFrappeUpdate("Sales Order", {
    onSuccess: () => {
      toast.success("Sales Order updated successfully");
      router.push(`/sales/sales-order/${encodeURIComponent(name)}`);
    },
    onError: (error: any) => {
      toast.error("Update failed", { description: error.message });
    },
  });

  const onSubmit = async (values: any) => {
    const validItems = (values.items || []).filter(
      (item) => item.item_code && item.qty > 0,
    );
    if (validItems.length === 0) {
      toast.error("Please add at least one item with quantity");
      return;
    }

    // Prepare payload
    const payload = {
      ...values,
      items: validItems.map((item) => ({
        ...item,
        amount: item.qty * item.rate,
      })),
    };

    await updateMutation.mutateAsync({ name, data: payload });
  };

  if (isOrderLoading) return <LoadingState type="detail" />;
  if (!order) return null;

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Edit ${order.name}`}
          subtitle={order.customer_name}
          backHref={`/sales/sales-order/${encodeURIComponent(name)}`}
        />
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Order Core */}
              <InfoCard
                title="Primary Identity"
                icon={<Users className="h-5 w-5 text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                  <FormFrappeSelect
                    control={control}
                    name="customer"
                    label="Customer"
                    required
                    doctype="Customer"
                    labelField="customer_name"
                    disabled
                  />
                  <FormFrappeSelect
                    control={control}
                    name="company"
                    label="Company"
                    required
                    doctype="Company"
                    labelField="company_name"
                  />
                  <FormDatePicker
                    control={control}
                    name="transaction_date"
                    label="Booking Date"
                    required
                  />
                  <FormDatePicker
                    control={control}
                    name="delivery_date"
                    label="Delivery Deadline"
                    required
                  />
                </div>
              </InfoCard>

              {/* Items Section */}
              <InfoCard
                title="Line Items & Technical Specs"
                icon={<Package className="h-5 w-5 text-amber-500" />}
              >
                <div className="rounded-[2rem] border border-border/50 overflow-hidden bg-card shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b-2 border-border/50">
                      <tr>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground w-1/4">
                          Design / Item
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground w-1/3 text-center">
                          Specifications
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground text-right">
                          Quantity
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground text-right w-24">
                          Rate
                        </th>
                        <th className="px-5 py-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {fields.map((field, index) => (
                        <tr
                          key={field.id}
                          className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="px-4 py-4 align-top">
                            <FormFrappeSelect
                              control={control}
                              name={`items.${index}.item_code`}
                              doctype="Item"
                              hideLabel
                              extraFields={[
                                "standard_rate",
                                "stock_uom",
                                "item_name",
                                "description",
                              ]}
                              className="h-10 rounded-xl bg-secondary/30 border-0 font-bold"
                              onValueChange={(val, doc) => {
                                if (doc) {
                                  setValue(
                                    `items.${index}.rate`,
                                    doc.standard_rate || 0,
                                  );
                                  setValue(
                                    `items.${index}.uom`,
                                    doc.stock_uom || "Nos",
                                  );
                                  setValue(
                                    `items.${index}.item_name`,
                                    doc.item_name,
                                  );
                                  setValue(
                                    `items.${index}.description`,
                                    doc.description,
                                  );
                                }
                              }}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1 px-1">
                              {watch(`items.${index}.item_name`)}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <FormTextarea
                              control={control}
                              name={`items.${index}.description`}
                              hideLabel
                              className="min-h-[80px] rounded-xl bg-secondary/30 border-0 text-[11px] leading-relaxed resize-none font-medium"
                              placeholder="Describe technical details, colors, GSM..."
                            />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-col items-end gap-1">
                              <FormInput
                                control={control}
                                name={`items.${index}.qty`}
                                type="number"
                                hideLabel
                                className="h-10 w-24 rounded-xl bg-secondary/30 border-0 text-right font-black"
                              />
                              <span className="text-[10px] text-muted-foreground font-bold px-1 uppercase">
                                {watch(`items.${index}.uom`) || "Nos"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <FormInput
                              control={control}
                              name={`items.${index}.rate`}
                              type="number"
                              hideLabel
                              className="h-10 w-24 rounded-xl bg-secondary/30 border-0 text-right font-bold text-primary"
                            />
                          </td>
                          <td className="px-2 py-4 align-top">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-6 bg-slate-50/50 dark:bg-muted/10 flex justify-between items-center border-t border-border/10">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-dashed bg-card"
                      onClick={() =>
                        append({
                          item_code: "",
                          description: "",
                          qty: 1,
                          rate: 0,
                          uom: "Nos",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Line Item
                    </Button>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                        Gross Estimate
                      </p>
                      <p className="text-2xl font-black text-primary tracking-tighter">
                        {formatCurrency(totals.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
              {/* Actions */}
              <InfoCard title="Update Directive" variant="gradient">
                <div className="space-y-3 p-2">
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    Commit Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-bold bg-card"
                    onClick={() => router.back()}
                  >
                    <X className="h-4 w-4 mr-2" /> Discard Edits
                  </Button>
                </div>
              </InfoCard>

              {/* System Logic */}
              <InfoCard
                title="System Configuration"
                icon={<Settings2 className="h-5 w-5 text-muted-foreground" />}
                collapsible="initially-closed"
              >
                <div className="space-y-4 p-2">
                  <FormSelect
                    control={control}
                    name="naming_series"
                    label="Series"
                    options={[
                      { label: "SAL-ORD-.YYYY.-", value: "SAL-ORD-.YYYY.-" },
                      { label: "SO-.####", value: "SO-.####" },
                    ]}
                  />
                  <FormSelect
                    control={control}
                    name="order_type"
                    label="Order Type"
                    options={[
                      { label: "Sales", value: "Sales" },
                      { label: "Maintenance", value: "Maintenance" },
                    ]}
                  />
                </div>
              </InfoCard>

              {/* Additional Context */}
              <InfoCard
                title="Fiscal & Terms"
                icon={<Calculator className="h-5 w-5 text-emerald-500" />}
                collapsible
              >
                <div className="space-y-4 p-2">
                  <FormFrappeSelect
                    control={control}
                    name="taxes_and_charges"
                    label="Tax Template"
                    doctype="Sales Taxes and Charges Template"
                    labelField="title"
                  />
                  <FormFrappeSelect
                    control={control}
                    name="tc_name"
                    label="Terms Template"
                    doctype="Terms and Conditions"
                    labelField="title"
                    onValueChange={(val, doc) =>
                      doc && setValue("terms", doc.terms)
                    }
                  />
                  <FormTextarea
                    control={control}
                    name="terms"
                    label="Contractual Terms"
                    className="min-h-[120px] text-xs leading-relaxed font-medium"
                  />
                </div>
              </InfoCard>

              <InfoCard
                title="Business Metrics"
                icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
                collapsible="initially-closed"
              >
                <div className="space-y-4 p-2">
                  <FormFrappeSelect
                    control={control}
                    name="sales_partner"
                    label="Sales Partner"
                    doctype="Sales Partner"
                    labelField="partner_name"
                  />
                  <FormInput
                    control={control}
                    name="commission_rate"
                    label="Commission (%)"
                    type="number"
                  />
                  <FormFrappeSelect
                    control={control}
                    name="project"
                    label="Linked Project"
                    doctype="Project"
                    labelField="project_name"
                  />
                </div>
              </InfoCard>

              <InfoCard
                title="Shipping Details"
                icon={<MapPin className="h-5 w-5 text-blue-500" />}
                collapsible="initially-closed"
              >
                <div className="space-y-4 p-2">
                  <FormFrappeSelect
                    control={control}
                    name="customer_address"
                    label="Address"
                    doctype="Address"
                    labelField="address_title"
                    filters={
                      selectedCustomer
                        ? [["Dynamic Link", "link_name", "=", selectedCustomer]]
                        : []
                    }
                  />
                  <FormFrappeSelect
                    control={control}
                    name="contact_person"
                    label="Point of Contact"
                    doctype="Contact"
                    labelField="full_name"
                    filters={
                      selectedCustomer
                        ? [["Dynamic Link", "link_name", "=", selectedCustomer]]
                        : []
                    }
                  />
                  <FormInput
                    control={control}
                    name="po_no"
                    label="Client PO #"
                  />
                  <FormDatePicker
                    control={control}
                    name="po_date"
                    label="PO Date"
                  />
                </div>
              </InfoCard>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
