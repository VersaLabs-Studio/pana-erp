// app/sales/quotation/[name]/page.tsx
// Pana ERP v3.0 - Quotation Detail View
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Share2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  useFrappeDoc,
  useFrappeUpdate,
  useFrappeDelete,
} from "@/hooks/generic";
import { PageHeader, LoadingState, ConfirmDialog } from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import type { Quotation } from "@/types/doctype-types";

interface QuotationItem {
  item_code: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState("");

  const { data: quote, isLoading } = useFrappeDoc<Quotation>("Quotation", name);

  const updateMutation = useFrappeUpdate<{ data: Quotation }, any>(
    "Quotation",
    {
      onSuccess: () => setShowLostDialog(false),
    }
  );

  const deleteMutation = useFrappeDelete("Quotation", {
    onSuccess: () => router.push("/sales/quotation"),
  });

  if (isLoading) return <LoadingState type="detail" />;
  if (!quote)
    return <div className="p-4 text-destructive">Quotation not found</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount || 0);
  };

  const isEditable = quote.status === "Draft" && quote.docstatus === 0;

  const handleMarkLost = async () => {
    if (!lostReason) return;
    await updateMutation.mutateAsync({
      name: quote.name,
      data: { status: "Lost", order_lost_reason: lostReason },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <PageHeader
        title={quote.name}
        subtitle={`Status: ${quote.status}`}
        backHref="/sales/quotation"
        actions={
          <div className="flex gap-2">
            {isEditable && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/sales/quotation/${encodeURIComponent(name)}/edit`
                  )
                }
              >
                Edit
              </Button>
            )}
            {quote.status === "Open" && (
              <Button
                variant="destructive"
                onClick={() => setShowLostDialog(true)}
              >
                Mark Lost
              </Button>
            )}
            {quote.status === "Ordered" && (
              <Button
                variant="default"
                onClick={() => alert("Phase 3: Create Sales Order")}
              >
                View Sales Order
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Invoice Header */}
        <div className="p-8 border-b border-border bg-secondary/10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground">QUOTATION</h1>
              <p className="text-muted-foreground mt-1">{quote.name}</p>
            </div>
            <div className="text-right">
              <DataPoint label="Date" value={quote.transaction_date} />
              <DataPoint label="Valid Till" value={quote.valid_till} />
              {quote.valid_till && new Date(quote.valid_till) < new Date() && (
                <Badge variant="destructive" className="mt-2">
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-8 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Bill To:</h2>
          <h3 className="font-bold text-xl">{quote.customer_name}</h3>
          {/* Note: Real address/contact details would need additional fetches via dynamic links or stored on doc */}
          <p className="text-sm text-muted-foreground mt-2">
            Address and Contact details usually printed here or on attached PDF.
          </p>
        </div>

        {/* Items */}
        <div className="p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 text-left">Item</th>
                <th className="py-3 text-left">Technical Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {((quote.items || []) as unknown as QuotationItem[]).map(
                (item, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-3">{item.item_code}</td>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right">{item.qty}</td>
                    <td className="py-3 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency((item.qty || 0) * (item.rate || 0))}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-8 bg-secondary/10">
          <div className="ml-auto w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.total || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Tax</span>
              <span>{formatCurrency(quote.total_taxes_and_charges || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
              <span>Grand Total</span>
              <span>{formatCurrency(quote.grand_total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {quote.terms && (
          <div className="p-8 text-xs text-muted-foreground">
            <h3 className="font-bold text-foreground mb-2">
              Terms & Conditions
            </h3>
            <div className="whitespace-pre-wrap">{quote.terms}</div>
          </div>
        )}
      </div>

      {/* Lost Reason Dialog */}
      <ConfirmDialog
        open={showLostDialog}
        onOpenChange={setShowLostDialog}
        title="Mark Quotation as Lost"
        description="Please select a reason for this quotation being lost."
        confirmText="Confirm"
        variant="destructive"
        onConfirm={handleMarkLost}
        loading={updateMutation.isPending}
      >
        <div className="py-4 space-y-3">
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30">
            <input
              type="radio"
              name="lost_reason"
              value="Competitor Quoted Lower"
              checked={lostReason === "Competitor Quoted Lower"}
              onChange={(e) => setLostReason(e.target.value)}
            />
            <span>Competitor Quoted Lower</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30">
            <input
              type="radio"
              name="lost_reason"
              value="Customer Changed Requirements"
              checked={lostReason === "Customer Changed Requirements"}
              onChange={(e) => setLostReason(e.target.value)}
            />
            <span>Customer Changed Requirements</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30">
            <input
              type="radio"
              name="lost_reason"
              value="Budget Constraints"
              checked={lostReason === "Budget Constraints"}
              onChange={(e) => setLostReason(e.target.value)}
            />
            <span>Budget Constraints</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/30">
            <input
              type="radio"
              name="lost_reason"
              value="Other"
              checked={lostReason === "Other"}
              onChange={(e) => setLostReason(e.target.value)}
            />
            <span>Other</span>
          </label>
        </div>
      </ConfirmDialog>
    </div>
  );
}
