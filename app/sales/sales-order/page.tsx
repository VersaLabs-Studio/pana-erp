"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, AlertCircle, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { SalesOrder } from "@/types/doctype-types";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "Draft" },
  { label: "To Deliver", value: "To Deliver and Bill" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case "Draft":
      return "bg-secondary text-secondary-foreground";
    case "To Deliver and Bill":
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
    case "To Deliver":
      return "bg-amber-500/20 text-amber-600 dark:text-amber-400";
    case "To Bill":
      return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
    case "Completed":
      return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    case "Cancelled":
      return "bg-destructive/20 text-destructive";
    case "Closed":
      return "bg-gray-500/20 text-gray-600";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const isOverdue = (order: SalesOrder) => {
  if (!order.delivery_date) return false;
  if (order.status === "Completed" || order.status === "Cancelled")
    return false;
  return new Date(order.delivery_date) < new Date();
};

export default function SalesOrderListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<SalesOrder | null>(null);

  const { data: orders, isLoading } = useFrappeList<SalesOrder>("Sales Order", {
    orderBy: { field: "creation", order: "desc" },
    search,
    limit: 50,
    filters: statusFilter !== "all" ? [["status", "=", statusFilter]] : [],
  });

  const deleteMutation = useFrappeDelete("Sales Order", {
    onSuccess: () => setDeleteTarget(null),
  });

  const filteredData = useMemo(() => {
    if (!orders) return [];
    // Note: Client side search is redundant if backend search is working,
    // but kept as per standard v3 pattern for safety.
    return orders;
  }, [orders]);

  if (isLoading) return <LoadingState type="table" count={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle={`${filteredData.length} records`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button
            className="rounded-full"
            onClick={() => router.push("/sales/sales-order/new")}
          >
            <Plus className="h-4 w-4 mr-2" /> New Sales Order
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
            className="rounded-full whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {filteredData.length === 0 ? (
        <EmptyState
          title="No Sales Orders Found"
          description={
            statusFilter !== "all"
              ? `Try changing the status filter.`
              : "Create your first sales order to get started."
          }
          action={
            <Button onClick={() => router.push("/sales/sales-order/new")}>
              Create Sales Order
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredData.map((order, index) => {
            const overdue = isOverdue(order);
            return (
              <div
                key={order.name}
                className={cn(
                  "group relative flex items-start justify-between p-4 bg-card rounded-2xl border transition-all duration-300 animate-slide-up",
                  overdue
                    ? "border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    : "border-border hover:shadow-lg",
                  order.docstatus === 2 && "opacity-60 grayscale",
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className="flex items-start gap-4 min-w-0 flex-1 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/sales/sales-order/${encodeURIComponent(order.name)}`,
                    )
                  }
                >
                  <div className="mt-1">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        overdue
                          ? "bg-destructive text-white"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {order.name?.slice(-3)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {order.customer_name}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          getStatusBadgeClasses(order.status || "Draft"),
                        )}
                      >
                        {order.status}
                      </span>
                      {overdue && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase tracking-wider">
                          <AlertCircle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{order.name}</span>
                      <span>•</span>
                      <span
                        className={cn(
                          "font-medium",
                          overdue && "text-destructive",
                        )}
                      >
                        Due: {order.delivery_date || "No Date"}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">
                        {order.grand_total
                          ? `${order.currency} ${Number(order.grand_total).toLocaleString()}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-xl bg-popover/90 backdrop-blur-xl"
                  >
                    <DropdownMenuItem
                      className="rounded-lg"
                      onClick={() =>
                        router.push(
                          `/sales/sales-order/${encodeURIComponent(order.name)}/edit`,
                        )
                      }
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg text-destructive"
                      onClick={() => setDeleteTarget(order)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Sales Order"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.name);
          }
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
