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
  Layers as BOMIcon,
  Package,
  DollarSign,
  CheckCircle2,
  XCircle,
  Copy,
  Star,
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
import type { Bom } from "@/types/doctype-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatCurrency(amount: number | undefined, currency = "ETB"): string {
  if (amount === undefined || amount === null) return "—";
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function BOMCard({ bom, index, onView, onEdit, onDelete, onDuplicate }) {
  const isActive = bom.is_active === 1;
  const isDefault = bom.is_default === 1;
  const isSubmitted = bom.docstatus === 1;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border/50 p-6",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
        "transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4",
        !isActive && "opacity-60",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      {/* Default Badge */}
      {isDefault && (
        <div className="absolute -top-3 -right-3 h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-background">
          <Star className="h-5 w-5 text-white fill-white" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
            <BOMIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {bom.item_name || bom.item}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 h-4 border-primary/20 bg-primary/5"
              >
                {bom.name}
              </Badge>
              <span className="text-[10px] text-muted-foreground truncate">
                • {bom.company}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-secondary/80 translate-x-2 -translate-y-2"
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-2xl p-2 shadow-2xl border-primary/10"
          >
            <DropdownMenuItem
              disabled={isSubmitted}
              className="rounded-xl focus:bg-primary/5"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4 mr-3 text-blue-500" /> Edit Recipe
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl focus:bg-primary/5"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-4 w-4 mr-3 text-emerald-500" /> Duplicate BOM
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isSubmitted}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive rounded-xl focus:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4 mr-3" /> Delete BOM
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-secondary/20 rounded-xl p-3 border border-border/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
            Batch Size
          </p>
          <p className="font-semibold text-sm">
            {bom.quantity}{" "}
            <span className="text-muted-foreground font-normal">
              {bom.uom || "Nos"}
            </span>
          </p>
        </div>
        <div className="bg-secondary/20 rounded-xl p-3 border border-border/30 text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
            Status
          </p>
          {isSubmitted ? (
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
            Materials
          </span>
          <span className="font-bold">
            {formatCurrency(bom.raw_material_cost, bom.currency)}
          </span>
        </div>

        {bom.with_operations === 1 && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />{" "}
              Operations
            </span>
            <span className="font-bold">
              {formatCurrency(bom.operating_cost, bom.currency)}
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-border/50">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
              Total Cost
            </span>
            <span className="text-xl font-black text-primary drop-shadow-sm font-mono tracking-tight">
              {formatCurrency(bom.total_cost, bom.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BOMListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "default"
  >("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    data: boms,
    isLoading,
    refetch,
    error,
  } = useFrappeList<Bom>("BOM", {
    fields: [
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
      "docstatus",
    ],
    orderBy: { field: "creation", order: "desc" },
    limit: 100,
  });

  const deleteMutation = useFrappeDelete("BOM", {
    onSuccess: () => {
      toast.success("BOM deleted successfully");
      refetch();
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error("Failed to delete BOM", { description: err.message });
    },
  });

  const filtered = useMemo(() => {
    if (!boms) return [];
    return boms.filter((b) => {
      const matchesSearch =
        !searchTerm ||
        b.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
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
        primaryAction={{
          label: "Create BOM",
          onClick: () => router.push("/manufacturing/bom/new"),
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full bg-card border-border/50 focus:bg-card transition-all"
          />
        </div>
        <div className="flex gap-2 bg-secondary/20 p-1 rounded-full border border-border/50">
          {["all", "active", "default"].map((f) => (
            <Button
              key={f}
              variant={filterStatus === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus(f as typeof filterStatus)}
              className={cn(
                "rounded-full capitalize px-4",
                filterStatus === f
                  ? "shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BOMIcon}
          title={searchTerm ? "No results found" : "No BOMs found"}
          description={
            searchTerm
              ? "Try a different search term"
              : "Create your first recipe to get started"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((bom, idx) => (
            <BOMCard
              key={bom.name}
              bom={bom}
              index={idx}
              onView={() =>
                router.push(
                  `/manufacturing/bom/${encodeURIComponent(bom.name)}`,
                )
              }
              onEdit={() => {
                if (bom.docstatus === 1) {
                  toast.error("Submitted BOMs cannot be edited");
                  return;
                }
                router.push(
                  `/manufacturing/bom/${encodeURIComponent(bom.name)}/edit`,
                );
              }}
              onDelete={() => {
                if (bom.docstatus === 1) {
                  toast.error("Submitted BOMs cannot be deleted");
                  return;
                }
                setDeleteTarget(bom.name);
              }}
              onDuplicate={() =>
                router.push(
                  `/manufacturing/bom/new?copy=${encodeURIComponent(bom.name)}`,
                )
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Delete Bill of Materials"
        description="Are you sure you want to delete this BOM? This action cannot be undone."
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
