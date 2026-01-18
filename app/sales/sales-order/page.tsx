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
  Eye,
  CalendarDays,
  Clock,
  User,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Ban,
  Package,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFrappeList, useFrappeDelete } from "@/hooks/generic";
import {
  PageHeader,
  EmptyState,
  LoadingState,
  ConfirmDialog,
} from "@/components/smart";
import type { SalesOrder } from "@/types/doctype-types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { color: string; bgColor: string; icon: React.ElementType; label: string }
> = {
  Draft: {
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: Pencil,
    label: "Draft",
  },
  "To Deliver and Bill": {
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    icon: Package,
    label: "Pending Delivery & Bill",
  },
  "To Deliver": {
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
    icon: Clock,
    label: "To Deliver",
  },
  "To Bill": {
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
    icon: DollarSign,
    label: "To Bill",
  },
  Completed: {
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
    icon: CheckCircle2,
    label: "Completed",
  },
  Cancelled: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: Ban,
    label: "Cancelled",
  },
};

function SalesOrderCard({
  order,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  order: SalesOrder;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Draft;
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: order.currency || "ETB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue =
    order.delivery_date &&
    new Date(order.delivery_date) < new Date() &&
    order.status !== "Completed" &&
    order.status !== "Cancelled";

  const isEditable = order.docstatus === 0;
  const isDeletable = order.docstatus === 0;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border/50",
        "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
        "transition-all duration-300 cursor-pointer overflow-hidden",
        "animate-slide-up",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={onView}
    >
      {isOverdue && (
        <div className="absolute top-0 right-0 p-2 z-10">
          <Badge
            variant="destructive"
            className="animate-pulse flex gap-1 items-center py-0 px-2 rounded-full border-0 text-[10px]"
          >
            <AlertCircle className="h-2.5 w-2.5" /> OVERDUE
          </Badge>
        </div>
      )}

      {/* Decorative Status Bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          order.status === "Draft" && "bg-slate-400",
          order.status === "To Deliver and Bill" && "bg-blue-500",
          order.status === "To Deliver" && "bg-amber-500",
          order.status === "Completed" && "bg-emerald-500",
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                {order.name}
              </h3>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {order.customer_name || order.customer}
            </p>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
              statusConfig.bgColor,
              statusConfig.color,
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider">
              Order Date
            </p>
            <p className="text-xs font-medium text-foreground flex items-center justify-center sm:justify-start gap-1">
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
              {formatDate(order.transaction_date)}
            </p>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider">
              Delivery
            </p>
            <p
              className={cn(
                "text-xs font-medium flex items-center justify-center sm:justify-start gap-1",
                isOverdue ? "text-destructive font-bold" : "text-foreground",
              )}
            >
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatDate(order.delivery_date)}
            </p>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider">
              Entity
            </p>
            <p className="text-xs font-medium text-foreground flex items-center justify-center sm:justify-start gap-1 truncate">
              <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{order.company || "—"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-wider font-mono">
                Net Value
              </p>
              <p className="text-lg font-bold text-foreground tracking-tighter">
                {formatCurrency(order.grand_total)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-border/50 shadow-xl bg-popover/95 backdrop-blur-xl p-1.5 min-w-[160px]"
            >
              <DropdownMenuItem
                className="rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {isEditable && (
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Order
                </DropdownMenuItem>
              )}
              {isDeletable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Draft
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function SalesOrdersListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<SalesOrder | null>(null);

  const {
    data: orders,
    isLoading,
    error,
  } = useFrappeList<SalesOrder>("Sales Order", {
    fields: [
      "name",
      "customer",
      "customer_name",
      "transaction_date",
      "delivery_date",
      "grand_total",
      "status",
      "docstatus",
      "company",
      "currency",
    ],
    orderBy: { field: "`tabSales Order`.creation", order: "desc" },
    search,
    limit: 100,
  });

  const deleteMutation = useFrappeDelete("Sales Order", {
    onSuccess: () => setDeleteTarget(null),
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    return result;
  }, [orders, statusFilter]);

  const statusCounts = useMemo(() => {
    if (!orders) return {};
    return orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [orders]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.name);
  };

  if (isLoading) return <LoadingState type="grid" count={6} />;
  if (error)
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load sales orders
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle={`${filteredOrders.length} active order${filteredOrders.length !== 1 ? "s" : ""}`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, customer..."
        actions={
          <Button
            className="rounded-full shadow-lg shadow-primary/20"
            onClick={() => router.push("/sales/sales-order/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sales Order
          </Button>
        }
      />

      <div className="flex gap-2 flex-wrap items-center">
        {[
          { key: "all", label: "All Orders", count: orders?.length || 0 },
          { key: "Draft", label: "Draft", count: statusCounts.Draft || 0 },
          {
            key: "To Deliver and Bill",
            label: "Pending",
            count: statusCounts["To Deliver and Bill"] || 0,
          },
          {
            key: "Completed",
            label: "Completed",
            count: statusCounts.Completed || 0,
          },
        ].map((status) => (
          <Button
            key={status.key}
            variant={statusFilter === status.key ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full gap-2 transition-all",
              statusFilter === status.key
                ? "shadow-lg shadow-primary/20"
                : "hover:bg-secondary",
            )}
            onClick={() => setStatusFilter(status.key)}
          >
            {status.label}
            <Badge
              variant="secondary"
              className={cn(
                "h-5 min-w-[20px] px-1.5 text-[10px] font-bold",
                statusFilter === status.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary",
              )}
            >
              {status.count}
            </Badge>
          </Button>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <EmptyState
          title="No sales orders yet"
          description="Transform your quotations into production orders"
          action={
            <Button
              onClick={() => router.push("/sales/sales-order/new")}
              className="rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sales Order
            </Button>
          }
        />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-3xl border border-dashed">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">No orders match these criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order, index) => (
            <SalesOrderCard
              key={order.name}
              order={order}
              index={index}
              onView={() =>
                router.push(
                  `/sales/sales-order/${encodeURIComponent(order.name)}`,
                )
              }
              onEdit={() =>
                router.push(
                  `/sales/sales-order/${encodeURIComponent(order.name)}/edit`,
                )
              }
              onDelete={() => setDeleteTarget(order)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Order Draft"
        description={`Are you sure you want to delete order "${deleteTarget?.name}"?`}
        confirmText="Delete permanently"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
