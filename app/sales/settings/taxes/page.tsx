// app/sales/settings/taxes/page.tsx
// Pana ERP v3.0 - Tax Templates List Page
// @ts-nocheck

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Trash2, Percent } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFrappeList, useFrappeDelete } from "@/hooks/generic";
import {
  PageHeader,
  EmptyState,
  LoadingState,
  ConfirmDialog,
} from "@/components/smart";
import type { SalesTaxesandChargesTemplate } from "@/types/doctype-types";

export default function TaxTemplatesListPage() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<SalesTaxesandChargesTemplate | null>(null);

  const { data: taxes, isLoading, error } = useFrappeList<SalesTaxesandChargesTemplate>(
    "Sales Taxes and Charges Template",
    { orderBy: { field: "creation", order: "desc" }, limit: 100 }
  );

  const deleteMutation = useFrappeDelete("Sales Taxes and Charges Template", {
    onSuccess: () => setDeleteTarget(null),
  });

  if (isLoading) return <LoadingState type="list" count={6} />;
  if (error) return <div className="p-4 text-destructive">Failed to load tax templates</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Templates"
        subtitle={`${taxes?.length || 0} total`}
        actions={
          <Button className="rounded-full" onClick={() => router.push("/sales/settings/taxes/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Template
          </Button>
        }
      />

      {!taxes || taxes.length === 0 ? (
        <EmptyState
          title="No tax templates found"
          description="Configure VAT, Sales Tax, etc."
          action={<Button onClick={() => router.push("/sales/settings/taxes/new")}>Create Template</Button>}
        />
      ) : (
        <div className="space-y-2">
          {taxes.map((tax) => (
            <div
              key={tax.name}
              className="group p-4 bg-card hover:bg-card/80 transition-colors rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/30 rounded-lg">
                  <Percent className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{tax.title}</h3>
                  <p className="text-sm text-muted-foreground">{tax.company}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/sales/settings/taxes/${encodeURIComponent(tax.name)}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(tax)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Template"
        description={`Delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={async () => deleteTarget && (await deleteMutation.mutateAsync(deleteTarget.name))}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}