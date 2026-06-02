// app/sales/sales-order/[name]/page.tsx
// Obsidian ERP v4.0 - Sales Order Detail Page (V3 Golden Template)

"use client";

import { useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Printer,
  Share2,
  Send,
  Ban,
  Truck,
  FileCheck,
  MoreVertical,
  Check,
  Package,
  DollarSign,
  FileText,
  Activity,
  ArrowRight,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import type {
  SalesOrder,
  Address,
  Contact,
  Company,
} from "@/types/doctype-types";
import { useFrappeDoc, useFrappeUpdate, useFrappeDelete } from "@/hooks/generic";
import { PageHeader, LoadingState, ConfirmDialog } from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { FlowTracker } from "@/components/flows/FlowTracker";
import { resolveFlowChain } from "@/lib/flows/flow-chain-resolver";
import { WhatsNext } from "@/components/smart/WhatsNext";
import { ActivityTimeline } from "@/components/smart/ActivityTimeline";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================================
// Helpers
// ============================================================================

interface SalesOrderItem {
  item_code: string;
  item_name?: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
  uom?: string;
}

function getStatusVariant(
  status: string,
): "success" | "warning" | "destructive" | "default" {
  switch (status) {
    case "Draft":
      return "default";
    case "To Deliver and Bill":
      return "warning";
    case "To Deliver":
      return "warning";
    case "To Bill":
      return "warning";
    case "Completed":
      return "success";
    case "Cancelled":
      return "destructive";
    case "Closed":
      return "destructive";
    default:
      return "default";
  }
}

function formatCurrency(amount: number, currency = "ETB"): string {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
  }).format(amount || 0);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function SalesOrderDetailPage() {
  const params = useParams<{ name: string }>();
  const router = useRouter();
  const name = decodeURIComponent(params.name);
  const printRef = useRef<HTMLDivElement>(null);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Data fetching
  const {
    data: order,
    isLoading,
    refetch,
  } = useFrappeDoc<SalesOrder>("Sales Order", name);

  const { data: company } = useFrappeDoc<Company>(
    "Company",
    order?.company || "",
    { enabled: !!order?.company },
  );

  const { data: addressDoc } = useFrappeDoc<Address>(
    "Address",
    order?.customer_address || "",
    { enabled: !!order?.customer_address },
  );

  const { data: contactDoc } = useFrappeDoc<Contact>(
    "Contact",
    order?.contact_person || "",
    { enabled: !!order?.contact_person },
  );

  // Mutations
  const updateMutation = useFrappeUpdate<
    { data: SalesOrder },
    { name: string; data: Record<string, unknown> }
  >("Sales Order", {
    onSuccess: () => {
      refetch();
      setShowSubmitDialog(false);
      setShowCancelDialog(false);
    },
  });

  const deleteMutation = useFrappeDelete("Sales Order", {
    onSuccess: () => router.push("/sales/sales-order"),
  });

  // Flow chain
  const flowResult = useMemo(() => {
    if (!order) return null;
    const so = order as SalesOrder;
    const soRecord = order as unknown as Record<string, unknown>;
    const quotationName = soRecord.against_quotation as string | undefined;

    const stageStatuses: Record<
      string,
      {
        status: "completed" | "current" | "pending";
        documentName?: string;
        documentUrl?: string;
      }
    > = {
      "Sales Order": {
        status: "current",
        documentName: name,
        documentUrl: `/sales/sales-order/${name}`,
      },
      "Delivery Note": {
        status: (so.per_delivered ?? 0) >= 100 ? "completed" : "pending",
      },
      "Sales Invoice": {
        status: (so.per_billed ?? 0) >= 100 ? "completed" : "pending",
      },
      "Payment Entry": { status: "pending" },
    };

    if (quotationName) {
      stageStatuses["Quotation"] = {
        status: "completed",
        documentName: quotationName,
        documentUrl: `/sales/quotation/${quotationName}`,
      };
    }

    return resolveFlowChain("Sales Order", name, stageStatuses);
  }, [order, name]);

  // What's Next actions
  const whatsNextActions = useMemo(() => {
    if (!order) return [];
    const so = order as SalesOrder;
    const actions = [];

    if (so.docstatus === 0) {
      actions.push({
        label: "Submit Order",
        description: "Submit this order for processing",
        onClick: () => setShowSubmitDialog(true),
        isPrimary: true,
      });
    }

    if (so.docstatus === 1) {
      actions.push({
        label: "Create Work Order",
        description: "Start manufacturing for this order",
        onClick: () => {},
        disabled: true,
        disabledReason: "Available in Phase 2 — Module Completeness",
      });
    }

    if (so.docstatus === 1 && (so.per_delivered ?? 0) < 100) {
      actions.push({
        label: "Create Delivery Note",
        description: "Ship items to customer",
        onClick: () => {},
        disabled: true,
        disabledReason: "Available in Phase 2 — Module Completeness",
      });
    }

    if (so.docstatus === 1 && (so.per_billed ?? 0) < 100) {
      actions.push({
        label: "Create Sales Invoice",
        description: "Generate invoice for this order",
        onClick: () => {},
        disabled: true,
        disabledReason: "Available in Phase 2 — Module Completeness",
      });
    }

    return actions;
  }, [order]);

  // Activity timeline
  const activityItems = useMemo(() => {
    if (!order) return [];
    const so = order as unknown as Record<string, unknown>;
    return [
      {
        id: "1",
        type: "created" as const,
        description: `Sales Order ${name} created`,
        user: String(so.owner || "Administrator"),
        timestamp: String(so.creation || new Date().toISOString()),
      },
      ...((so.docstatus as number) === 1
        ? [
            {
              id: "2",
              type: "submitted" as const,
              description: "Order submitted for processing",
              user: String(so.modified_by || "Administrator"),
              timestamp: String(so.modified || new Date().toISOString()),
            },
          ]
        : []),
    ];
  }, [order, name]);

  // Handlers
  const handleSubmit = async () => {
    await updateMutation.mutateAsync({
      name: name,
      data: { docstatus: 1 },
    });
  };

  const handleCancel = async () => {
    await updateMutation.mutateAsync({
      name: name,
      data: { docstatus: 2 },
    });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(name);
  };

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Order - ${name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1a1a1a;
              line-height: 1.6;
              padding: 40px;
            }
            .print-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e5e5; }
            .company-info h1 { font-size: 24px; font-weight: 700; color: #1a1a1a; }
            .company-info p { font-size: 12px; color: #666; margin-top: 4px; }
            .order-info { text-align: right; }
            .order-info h2 { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 8px; }
            .order-info p { font-size: 12px; color: #666; }
            .order-info .order-id { font-size: 14px; font-weight: 600; color: #1a1a1a; }
            .parties { display: flex; gap: 40px; margin-bottom: 40px; }
            .party { flex: 1; }
            .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 8px; }
            .party h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
            .party p { font-size: 12px; color: #666; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .items-table th { background: #f8f9fa; padding: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; letter-spacing: 0.5px; text-align: left; border-bottom: 2px solid #e5e5e5; }
            .items-table th.right { text-align: right; }
            .items-table td { padding: 12px; font-size: 12px; border-bottom: 1px solid #eee; vertical-align: top; }
            .items-table td.right { text-align: right; }
            .items-table .item-name { font-weight: 600; }
            .items-table .description { color: #666; font-size: 11px; margin-top: 4px; white-space: pre-wrap; }
            .totals { margin-left: auto; width: 280px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
            .totals-row.subtotal { border-bottom: 1px solid #eee; }
            .totals-row.grand { font-size: 18px; font-weight: 700; color: #1a1a1a; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
            .terms { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
            .terms h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 12px; }
            .terms p { font-size: 11px; color: #666; white-space: pre-wrap; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; }
            @media print {
              body { padding: 20px; }
              .print-container { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Loading
  if (isLoading) return <LoadingState type="detail" />;
  if (!order)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Sales Order not found</p>
      </div>
    );

  const so = order as SalesOrder;
  const items = (so.items || []) as unknown as SalesOrderItem[];
  const displayStatus =
    so.docstatus === 2 ? "Cancelled" : so.status || "Draft";
  const statusVariant = getStatusVariant(displayStatus);
  const isDraft = so.docstatus === 0;
  const isSubmitted = so.docstatus === 1;
  const isCancelled = so.docstatus === 2;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        title="Submit Sales Order"
        description="Once submitted, this order will be locked and processed. You won't be able to edit it. Continue?"
        confirmText="Submit"
        onConfirm={handleSubmit}
        loading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Sales Order"
        description="This action is permanent. The order will be cancelled and cannot be recovered. Continue?"
        confirmText="Cancel Order"
        variant="destructive"
        onConfirm={handleCancel}
        loading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Sales Order"
        description={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      {/* Page Header */}
      <PageHeader
        backUrl="/sales/sales-order"
        label="Sales Order"
        title={name}
        status={{ label: displayStatus, variant: statusVariant }}
      >
        {isDraft && (
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() =>
              router.push(
                `/sales/sales-order/${encodeURIComponent(name)}/edit`,
              )
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}

        {isDraft && (
          <Button
            className="rounded-full"
            onClick={() => setShowSubmitDialog(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        )}

        {isSubmitted && (
          <Button
            variant="outline"
            className="rounded-full"
            disabled
            title="Available in Phase 2"
          >
            <Truck className="h-4 w-4 mr-2" />
            Create DN
          </Button>
        )}

        {isSubmitted && (
          <Button
            variant="outline"
            className="rounded-full"
            disabled
            title="Available in Phase 2"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl border-none shadow-xl bg-popover/90 backdrop-blur-xl p-2 w-48"
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem className="rounded-xl" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl" onClick={handleShare}>
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied!" : "Share Link"}
            </DropdownMenuItem>
            {isSubmitted && !isCancelled && (
              <>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="rounded-xl text-destructive focus:bg-destructive/10"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <Ban className="mr-2 h-4 w-4" /> Cancel Order
                </DropdownMenuItem>
              </>
            )}
            {isDraft && (
              <>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="rounded-xl text-destructive focus:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Center Panel */}
        <div className="lg:col-span-8 space-y-8">
          {/* Order Details */}
          <InfoCard
            title={
              <>
                <Package className="h-4 w-4" /> Order Details
              </>
            }
            delay={100}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <DataPoint
                label="Customer"
                value={so.customer_name || so.customer}
              />
              <DataPoint
                label="Order Date"
                value={formatDate(so.transaction_date)}
              />
              <DataPoint
                label="Delivery Date"
                value={formatDate(so.delivery_date)}
              />
              <DataPoint label="PO Number" value={so.po_no} />
              <DataPoint label="Company" value={so.company} />
              {contactDoc && (
                <DataPoint
                  label="Contact"
                  value={`${contactDoc.first_name || ""} ${contactDoc.last_name || ""}`.trim() || contactDoc.name}
                />
              )}
            </div>
          </InfoCard>

          {/* Line Items */}
          <InfoCard
            title={
              <>
                <Layers className="h-4 w-4" /> Line Items
              </>
            }
            delay={200}
          >
            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/20 rounded-2xl p-4 border border-border/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-primary">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-foreground">
                        {item.item_code}
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded-full">
                      {item.qty} {item.uom || "Nos"}
                    </span>
                  </div>
                  {item.item_name && item.item_name !== item.item_code && (
                    <p className="text-xs text-foreground/80 mb-2">
                      {item.item_name}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-border/50">
                    <div>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold">
                        Rate
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.rate, so.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase text-muted-foreground font-bold">
                        Total
                      </p>
                      <p className="text-base font-bold text-foreground">
                        {formatCurrency(
                          item.amount || item.qty * item.rate,
                          so.currency,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border text-muted-foreground">
                    <th className="py-3 text-left font-bold uppercase text-[10px] tracking-wider">
                      #
                    </th>
                    <th className="py-3 text-left font-bold uppercase text-[10px] tracking-wider">
                      Item
                    </th>
                    <th className="py-3 text-left font-bold uppercase text-[10px] tracking-wider">
                      Description
                    </th>
                    <th className="py-3 text-right font-bold uppercase text-[10px] tracking-wider">
                      Qty
                    </th>
                    <th className="py-3 text-right font-bold uppercase text-[10px] tracking-wider">
                      Rate
                    </th>
                    <th className="py-3 text-right font-bold uppercase text-[10px] tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-4 text-muted-foreground">{idx + 1}</td>
                      <td className="py-4">
                        <span className="font-semibold text-foreground">
                          {item.item_code}
                        </span>
                        {item.item_name &&
                          item.item_name !== item.item_code && (
                            <p className="text-xs text-muted-foreground">
                              {item.item_name}
                            </p>
                          )}
                      </td>
                      <td className="py-4 text-muted-foreground max-w-xs">
                        <p className="whitespace-pre-wrap text-xs">
                          {item.description || "—"}
                        </p>
                      </td>
                      <td className="py-4 text-right font-medium">
                        {item.qty} {item.uom || "Nos"}
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(item.rate, so.currency)}
                      </td>
                      <td className="py-4 text-right font-semibold text-foreground">
                        {formatCurrency(
                          item.amount || item.qty * item.rate,
                          so.currency,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoCard>

          {/* Totals */}
          <InfoCard
            title={
              <>
                <DollarSign className="h-4 w-4" /> Totals
              </>
            }
            delay={300}
          >
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(so.total || 0, so.currency)}
                </span>
              </div>
              {(so.total_taxes_and_charges ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax ({so.taxes_and_charges || "Applied"})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      so.total_taxes_and_charges ?? 0,
                      so.currency,
                    )}
                  </span>
                </div>
              )}
              {(so.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(so.discount_amount ?? 0, so.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-foreground border-t-2 border-foreground pt-4 mt-2">
                <span>Grand Total</span>
                <span className="text-primary">
                  {formatCurrency(so.grand_total || 0, so.currency)}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Terms */}
          {so.terms && (
            <InfoCard
              title={
                <>
                  <FileText className="h-4 w-4" /> Terms & Conditions
                </>
              }
              delay={400}
            >
              <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/20 p-4 rounded-xl">
                {so.terms}
              </div>
            </InfoCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Status */}
          <InfoCard
            title={
              <>
                <Activity className="h-4 w-4" /> Status
              </>
            }
            delay={300}
            variant="gradient"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Doc Status</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                    statusVariant === "success" &&
                      "bg-emerald-500/10 text-emerald-600",
                    statusVariant === "warning" &&
                      "bg-amber-500/10 text-amber-600",
                    statusVariant === "destructive" &&
                      "bg-destructive/10 text-destructive",
                    statusVariant === "default" &&
                      "bg-secondary text-muted-foreground",
                  )}
                >
                  {displayStatus}
                </span>
              </div>
              <div className="h-[1px] bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Docstatus</span>
                <span className="font-mono text-sm">{so.docstatus}</span>
              </div>
              {isSubmitted && (
                <>
                  <div className="h-[1px] bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">% Delivered</span>
                    <span className="font-mono text-sm font-bold">
                      {so.per_delivered ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">% Billed</span>
                    <span className="font-mono text-sm font-bold">
                      {so.per_billed ?? 0}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </InfoCard>

          {/* Flow Tracker */}
          {flowResult && (
            <InfoCard
              title={
                <>
                  <ArrowRight className="h-4 w-4" /> Flow Tracker
                </>
              }
              delay={400}
              variant="transparent"
            >
              <FlowTracker
                result={flowResult}
                compact
                onCreateAction={() => {}}
              />
            </InfoCard>
          )}

          {/* What's Next */}
          <InfoCard
            title={
              <>
                <ArrowRight className="h-4 w-4" /> What&apos;s Next
              </>
            }
            delay={500}
            variant="transparent"
          >
            <WhatsNext actions={whatsNextActions} />
          </InfoCard>

          {/* Activity */}
          <InfoCard
            title={
              <>
                <Activity className="h-4 w-4" /> Activity
              </>
            }
            delay={600}
            variant="transparent"
          >
            <ActivityTimeline items={activityItems} />
          </InfoCard>
        </div>
      </div>

      {/* Hidden Print Template */}
      <div ref={printRef} className="hidden">
        <div className="print-container">
          <div className="header">
            <div className="flex items-start gap-4">
              <img
                src="/logo.png"
                style={{ height: "60px", width: "60px", objectFit: "contain" }}
                alt="Logo"
              />
              <div className="company-info">
                <h1>{company?.company_name || "Obsidian ERP"}</h1>
                {company?.address_html && <p>{company.address_html}</p>}
                {company?.phone_no && <p>Tel: {company.phone_no}</p>}
                {company?.email && <p>Email: {company.email}</p>}
              </div>
            </div>
            <div className="order-info">
              <h2>SALES ORDER</h2>
              <p className="order-id">{name}</p>
              <p>Date: {formatDate(so.transaction_date)}</p>
              {so.delivery_date && (
                <p>Delivery: {formatDate(so.delivery_date)}</p>
              )}
            </div>
          </div>

          <div className="parties">
            <div className="party">
              <p className="party-label">Bill To</p>
              <h3>{so.customer_name || so.customer}</h3>
              {addressDoc && (
                <>
                  {addressDoc.address_line1 && (
                    <p>{addressDoc.address_line1}</p>
                  )}
                  {addressDoc.address_line2 && (
                    <p>{addressDoc.address_line2}</p>
                  )}
                  <p>
                    {[addressDoc.city, addressDoc.state, addressDoc.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {addressDoc.country && <p>{addressDoc.country}</p>}
                </>
              )}
            </div>
            <div className="party">
              <p className="party-label">Contact</p>
              {contactDoc ? (
                <>
                  <h3>
                    {contactDoc.first_name} {contactDoc.last_name}
                  </h3>
                  {contactDoc.email_id && <p>Email: {contactDoc.email_id}</p>}
                  {(contactDoc.phone || contactDoc.mobile_no) && (
                    <p>Phone: {contactDoc.phone || contactDoc.mobile_no}</p>
                  )}
                </>
              ) : (
                <p>—</p>
              )}
            </div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item / Service</th>
                <th>Description</th>
                <th className="right">Qty</th>
                <th className="right">Rate</th>
                <th className="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <span className="item-name">{item.item_code}</span>
                    {item.item_name && item.item_name !== item.item_code && (
                      <div className="description">{item.item_name}</div>
                    )}
                  </td>
                  <td>
                    <span className="description">
                      {item.description || "—"}
                    </span>
                  </td>
                  <td className="right">
                    {item.qty} {item.uom || ""}
                  </td>
                  <td className="right">
                    {formatCurrency(item.rate, so.currency)}
                  </td>
                  <td className="right">
                    {formatCurrency(
                      item.amount || item.qty * item.rate,
                      so.currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="totals-row subtotal">
              <span>Subtotal</span>
              <span>{formatCurrency(so.total || 0, so.currency)}</span>
            </div>
            {(so.total_taxes_and_charges ?? 0) > 0 && (
              <div className="totals-row">
                <span>Tax</span>
                <span>
                  {formatCurrency(
                    so.total_taxes_and_charges ?? 0,
                    so.currency,
                  )}
                </span>
              </div>
            )}
            <div className="totals-row grand">
              <span>Grand Total</span>
              <span>{formatCurrency(so.grand_total || 0, so.currency)}</span>
            </div>
          </div>

          {so.terms && (
            <div className="terms">
              <h4>Terms & Conditions</h4>
              <p>{so.terms}</p>
            </div>
          )}

          <div className="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
