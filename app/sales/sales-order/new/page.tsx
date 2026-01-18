// @ts-nocheck - React Hook Form + Zod type inference limitations
"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import {
  FormInput,
  FormFrappeSelect,
  FormSelect,
  FormDatePicker,
  FormTextarea,
} from "@/components/form";
import { useFrappeCreate, useFrappeList, useFrappeDoc } from "@/hooks/generic";
import { SalesOrderCreateSchema } from "@/lib/schemas/doctype-schemas";
import type {
  SalesOrderCreateRequest,
  Quotation,
  Customer,
} from "@/types/doctype-types";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  Calculator,
  Users,
  MapPin,
  Package,
  FileText,
  Settings2,
  Briefcase,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * v3.0 Sales Order Creation Logic:
 * - Direct creation or pre-fill from Quotation via URL param ?quotation=QTN-2026-0001
 * - Description workflow included for Technical Specs (GSM, color, size)
 * - Mandatory delivery_date (Due Date) for production scheduling
 * - Context-aware Address/Contact filtering
 * - Tax Template integration
 */

export default function NewSalesOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotation");

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(SalesOrderCreateSchema),
    defaultValues: {
      naming_series: "SAL-ORD-.YYYY.-",
      order_type: "Sales",
      transaction_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      status: "Draft",
      currency: "ETB",
      selling_price_list: "Standard Selling",
      price_list_currency: "ETB",
      conversion_rate: 1,
      plc_conversion_rate: 1,
      company: "",
      customer: "",
      customer_address: "",
      contact_person: "",
      tc_name: "",
      terms: "",
      taxes_and_charges: "",
      items: [
        {
          item_code: "",
          description: "",
          qty: 1,
          rate: 0,
          amount: 0,
          uom: "Nos",
        },
      ],
    },
  });

  const { control, handleSubmit, watch, setValue, reset, getValues } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = useWatch({ control, name: "items" });
  const selectedCustomer = watch("customer");

  // --- Fetch Related Data ---
  const { data: taxTemplates } = useFrappeList<any>(
    "Sales Taxes and Charges Template",
    { limit: 50 },
  );
  const { data: termsTemplates } = useFrappeList<any>("Terms and Conditions", {
    limit: 50,
  });

  // Fetch customer details for auto-selection
  const { data: customerDoc } = useFrappeDoc<Customer>(
    "Customer",
    selectedCustomer || "",
    {
      enabled: !!selectedCustomer,
    },
  );

  // --- Pre-fill Logic from Quotation ---
  useEffect(() => {
    if (quotationId) {
      const loadQuotationData = async () => {
        try {
          // Using a direct fetch for the quotation as it's a specific pre-fill action
          const res = await fetch(
            `/api/sales/quotation/${encodeURIComponent(quotationId)}`,
          );
          const response = await res.json();

          if (response.success && response.data) {
            const quotation = response.data as Quotation;

            // Map quotation data to sales order
            reset({
              ...getValues(),
              customer: quotation.party_name || quotation.customer,
              customer_name: quotation.customer_name,
              company: quotation.company,
              currency: quotation.currency || "ETB",
              selling_price_list:
                quotation.selling_price_list || "Standard Selling",
              customer_address: quotation.customer_address,
              contact_person: quotation.contact_person,
              taxes_and_charges: quotation.taxes_and_charges,
              tc_name: quotation.tc_name,
              terms: quotation.terms,
              items: (quotation.items || []).map((item: any) => ({
                item_code: item.item_code,
                item_name: item.item_name,
                description: item.description,
                qty: item.qty,
                rate: item.rate,
                amount: item.amount,
                uom: item.uom || "Nos",
              })),
              // Note: delivery_date is purposefully left empty as user must specify it
            });

            toast.success(`Loaded data from Quotation ${quotationId}`, {
              description: "Please specify the delivery date to proceed.",
            });
          }
        } catch (error) {
          console.error("Failed to load quotation:", error);
          toast.error("Failed to load Quotation data");
        }
      };
      loadQuotationData();
    }
  }, [quotationId, reset, getValues]);

  // --- Auto-Selection of Address/Contact ---
  useEffect(() => {
    if (customerDoc && !quotationId) {
      // Only auto-select if not pre-filling from quotation
      if (
        customerDoc.customer_primary_address &&
        !getValues("customer_address")
      ) {
        setValue("customer_address", customerDoc.customer_primary_address);
      }
      if (
        customerDoc.customer_primary_contact &&
        !getValues("contact_person")
      ) {
        setValue("contact_person", customerDoc.customer_primary_contact);
      }
    }
  }, [customerDoc, quotationId, setValue, getValues]);

  // --- Calculations ---
  const subtotal = useMemo(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) return 0;
    return watchedItems.reduce((acc, item) => {
      const qty = Number(item?.qty) || 0;
      const rate = Number(item?.rate) || 0;
      return acc + qty * rate;
    }, 0);
  }, [watchedItems]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount || 0);
  }, []);

  // --- Submission ---
  const createMutation = useFrappeCreate<
    { data: { name: string } },
    SalesOrderCreateRequest
  >("Sales Order", {
    onSuccess: (data) => {
      toast.success("Sales Order created successfully");
      router.push(`/sales/sales-order/${encodeURIComponent(data.data.name)}`);
    },
    onError: (error: any) => {
      toast.error("Failed to create Sales Order", {
        description: error.message || "Please check the form for errors.",
      });
    },
  });

  const onSubmit = (data: any) => {
    const validItems = (data.items || []).filter(
      (item) => item.item_code && item.qty > 0,
    );

    if (validItems.length === 0) {
      toast.error("At least one valid item is required");
      return;
    }

    const payload = {
      ...data,
      items: validItems,
      // Fixed values as per architecture
      conversion_rate: 1,
      plc_conversion_rate: 1,
      price_list_currency: "ETB",
      currency: "ETB",
    };

    createMutation.mutate(payload as SalesOrderCreateRequest);
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="New Sales Order"
        subtitle={
          quotationId
            ? `Converting Quotation ${quotationId}`
            : "Create a new order from scratch"
        }
        backHref="/sales/sales-order"
      />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Customer & Core Info */}
              <InfoCard
                title="Customer & Order Details"
                icon={<Users className="h-5 w-5 text-primary" />}
                className="shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormFrappeSelect
                    control={control}
                    name="customer"
                    label="Customer"
                    required
                    doctype="Customer"
                    labelField="customer_name"
                    placeholder="Search customer..."
                  />
                  <FormFrappeSelect
                    control={control}
                    name="company"
                    label="Company"
                    required
                    doctype="Company"
                    labelField="company_name"
                    placeholder="Select company..."
                  />
                  <FormDatePicker
                    control={control}
                    name="transaction_date"
                    label="Order Date"
                    required
                  />
                  <FormDatePicker
                    control={control}
                    name="delivery_date"
                    label="Due Date (Delivery)"
                    required
                    description="Date production must complete"
                  />
                </div>
              </InfoCard>

              {/* Logistics */}
              <InfoCard
                title="Logistics & Point of Contact"
                icon={<MapPin className="h-5 w-5 text-blue-500" />}
                collapsible
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormFrappeSelect
                    control={control}
                    name="customer_address"
                    label="Shipping Address"
                    doctype="Address"
                    labelField="address_title"
                    disabled={!selectedCustomer}
                    filters={
                      selectedCustomer
                        ? [["Dynamic Link", "link_name", "=", selectedCustomer]]
                        : []
                    }
                    placeholder={
                      selectedCustomer
                        ? "Select address..."
                        : "Select customer first"
                    }
                  />
                  <FormFrappeSelect
                    control={control}
                    name="contact_person"
                    label="Contact Person"
                    doctype="Contact"
                    labelField="full_name"
                    disabled={!selectedCustomer}
                    filters={
                      selectedCustomer
                        ? [["Dynamic Link", "link_name", "=", selectedCustomer]]
                        : []
                    }
                    placeholder={
                      selectedCustomer
                        ? "Select contact..."
                        : "Select customer first"
                    }
                  />
                  <FormInput
                    control={control}
                    name="po_no"
                    label="Customer PO No"
                    placeholder="External Reference"
                  />
                  <FormDatePicker
                    control={control}
                    name="po_date"
                    label="PO Date"
                  />
                </div>
              </InfoCard>

              {/* Items Table with Technical Specs */}
              <InfoCard
                title="Line Items & Technical Specs"
                icon={<Package className="h-5 w-5 text-amber-500" />}
              >
                <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/20 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[25%] text-center">
                            Item
                          </th>
                          <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[35%] text-center">
                            Technical Specs (GSM, Color, size)
                          </th>
                          <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[12%] text-right">
                            Qty
                          </th>
                          <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%] text-right">
                            Rate
                          </th>
                          <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[13%] text-right">
                            Total
                          </th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {fields.map((field, index) => {
                          const qty = Number(watchedItems?.[index]?.qty) || 0;
                          const rate = Number(watchedItems?.[index]?.rate) || 0;
                          const amount = qty * rate;

                          return (
                            <tr
                              key={field.id}
                              className="group hover:bg-secondary/10 transition-colors"
                            >
                              <td className="p-3 align-top">
                                <FormFrappeSelect
                                  control={control}
                                  name={`items.${index}.item_code`}
                                  doctype="Item"
                                  placeholder="Item code..."
                                  hideLabel
                                  extraFields={[
                                    "standard_rate",
                                    "stock_uom",
                                    "item_name",
                                    "description",
                                  ]}
                                  className="h-10 rounded-xl bg-secondary/30 border-0"
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
                              </td>
                              <td className="p-3 align-top">
                                <FormField
                                  control={control}
                                  name={`items.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Textarea
                                          {...field}
                                          className="min-h-[70px] rounded-xl bg-secondary/30 border-0 text-sm resize-none focus:bg-card transition-all"
                                          placeholder="Specs..."
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="p-3 align-top">
                                <FormField
                                  control={control}
                                  name={`items.${index}.qty`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          className="h-10 rounded-xl bg-secondary/30 border-0 text-right font-medium"
                                          onChange={(e) =>
                                            field.onChange(
                                              Number(e.target.value),
                                            )
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="p-3 align-top">
                                <FormField
                                  control={control}
                                  name={`items.${index}.rate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          className="h-10 rounded-xl bg-secondary/30 border-0 text-right font-medium"
                                          onChange={(e) =>
                                            field.onChange(
                                              Number(e.target.value),
                                            )
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="p-3 align-top">
                                <div className="h-10 px-3 rounded-xl bg-primary/5 flex items-center justify-end font-semibold text-primary">
                                  {formatCurrency(amount)}
                                </div>
                              </td>
                              <td className="p-3 align-top text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all border-0"
                                  onClick={() => remove(index)}
                                  disabled={fields.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-secondary/5 border-t border-border flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full px-4 border-dashed border-2 hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() =>
                        append({
                          item_code: "",
                          description: "",
                          qty: 1,
                          rate: 0,
                          amount: 0,
                          uom: "Nos",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Line Item
                    </Button>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Subtotal Estimate
                      </p>
                      <p className="text-2xl font-bold tracking-tight text-primary">
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </InfoCard>

              {/* Financial Summary */}
              <InfoCard
                title="Financials & Taxes"
                icon={<Calculator className="h-5 w-5 text-emerald-500" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <FormSelect
                      control={control}
                      name="taxes_and_charges"
                      label="Tax Template"
                      options={
                        taxTemplates?.map((t) => ({
                          label: t.title || t.name,
                          value: t.name,
                        })) || []
                      }
                      placeholder="Select tax template..."
                    />
                    <FormFrappeSelect
                      control={control}
                      name="selling_price_list"
                      label="Price List"
                      doctype="Price List"
                      labelField="name"
                    />
                  </div>
                  <div className="bg-secondary/20 p-6 rounded-3xl space-y-4 border border-border/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Net Order Total
                      </span>
                      <span className="font-bold">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b pb-4">
                      <span className="text-muted-foreground">
                        Taxes & Charges
                      </span>
                      <span className="font-medium">Auto-Calculated</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-bold text-foreground">
                        Grand Total Est.
                      </span>
                      <div className="text-3xl font-black text-primary tracking-tighter">
                        {formatCurrency(subtotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8 lg:sticky lg:top-8 self-start animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
              {/* Actions Sidebar */}
              <InfoCard title="Finish Creation" variant="gradient">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-2" />
                    )}
                    Save Sales Order
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl h-12 bg-card/50 backdrop-blur-sm border-white/20 hover:bg-card/80"
                    onClick={() => router.back()}
                  >
                    Discard Changes
                  </Button>
                </div>
              </InfoCard>

              {/* Terms & Conditions */}
              <InfoCard
                title="Order Terms"
                icon={<FileText className="h-5 w-5 text-purple-500" />}
                collapsible
              >
                <div className="space-y-4">
                  <FormSelect
                    control={control}
                    name="tc_name"
                    label="Terms Template"
                    options={
                      termsTemplates?.map((t) => ({
                        label: t.title || t.name,
                        value: t.name,
                      })) || []
                    }
                    onValueChange={(val, doc) => {
                      if (doc) setValue("terms", doc.terms);
                    }}
                  />
                  <FormTextarea
                    control={control}
                    name="terms"
                    label="Custom Terms"
                    className="min-h-[150px] bg-muted/20 text-xs"
                  />
                </div>
              </InfoCard>

              {/* Sales Team */}
              <InfoCard
                title="Sales Strategy"
                icon={<Briefcase className="h-5 w-5 text-indigo-500" />}
                collapsible="initially-closed"
              >
                <div className="space-y-4">
                  <FormFrappeSelect
                    control={control}
                    name="sales_partner"
                    label="Sales Partner"
                    doctype="Sales Partner"
                    labelField="partner_name"
                    description="Reseller/Designer referral"
                    onValueChange={(val, doc) => {
                      if (doc)
                        setValue("commission_rate", doc.commission_rate || 0);
                    }}
                  />
                  <FormInput
                    control={control}
                    name="commission_rate"
                    label="Commission %"
                    type="number"
                  />
                  <FormFrappeSelect
                    control={control}
                    name="project"
                    label="Project"
                    doctype="Project"
                    labelField="project_name"
                    placeholder="Link to project..."
                  />
                </div>
              </InfoCard>

              {/* Series Configuration */}
              <InfoCard
                title="Configuration"
                icon={<Settings2 className="h-5 w-5 text-gray-500" />}
                collapsible="initially-closed"
              >
                <div className="space-y-4">
                  <FormSelect
                    control={control}
                    name="naming_series"
                    label="Naming Series"
                    options={[
                      { label: "SAL-ORD-.YYYY.-", value: "SAL-ORD-.YYYY.-" },
                    ]}
                  />
                  <FormSelect
                    control={control}
                    name="order_type"
                    label="Order Type"
                    options={[
                      { label: "Sales", value: "Sales" },
                      { label: "Maintenance", value: "Maintenance" },
                      { label: "Shopping Cart", value: "Shopping Cart" },
                    ]}
                  />
                  <FormInput
                    control={control}
                    name="currency"
                    label="Transaction Currency"
                    disabled
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
