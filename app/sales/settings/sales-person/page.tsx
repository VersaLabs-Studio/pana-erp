"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Pencil,
  Trash2,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
import type { SalesPerson } from "@/types/doctype-types";

function SalesPersonRow({
  salesPerson,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  salesPerson: SalesPerson;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex items-center justify-between p-4 mb-2 bg-card hover:bg-card/80 hover:shadow-lg transition-all duration-300 rounded-2xl cursor-pointer animate-slide-up border border-border"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {salesPerson.sales_person_name}
            </h3>
            {salesPerson.enabled ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
          {salesPerson.employee && (
            <p className="text-xs text-muted-foreground truncate">
              Employee: {salesPerson.employee}
            </p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
          <DropdownMenuItem className="rounded-lg" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function SalesPersonListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SalesPerson | null>(null);

  const {
    data: salesPeople,
    isLoading,
    error,
  } = useFrappeList<SalesPerson>("Sales Person", {
    orderBy: { field: "creation", order: "desc" },
    search,
    limit: 100,
  });

  const deleteMutation = useFrappeDelete("Sales Person", {
    onSuccess: () => setDeleteTarget(null),
  });

  const filteredData = useMemo(() => {
    if (!salesPeople) return [];
    if (!search) return salesPeople;
    const lower = search.toLowerCase();
    return salesPeople.filter((sp) =>
      sp.sales_person_name?.toLowerCase().includes(lower)
    );
  }, [salesPeople, search]);

  if (isLoading) return <LoadingState type="table" count={8} />;
  if (error)
    return (
      <div className="p-4 text-destructive">Error loading Sales Persons</div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Persons"
        subtitle={`${filteredData.length} total`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button
            className="rounded-full"
            onClick={() => router.push("/sales/settings/sales-person/new")}
          >
            Add Sales Person
          </Button>
        }
      />
      {filteredData.length === 0 ? (
        <EmptyState
          title="No Sales Persons"
          description="Create your first sales person."
          action={
            <Button
              onClick={() => router.push("/sales/settings/sales-person/new")}
            >
              Add
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredData.map((sp, i) => (
            <SalesPersonRow
              key={sp.name}
              salesPerson={sp}
              index={i}
              onView={() =>
                router.push(
                  `/sales/settings/sales-person/${encodeURIComponent(sp.name)}`
                )
              }
              onEdit={() =>
                router.push(
                  `/sales/settings/sales-person/${encodeURIComponent(
                    sp.name
                  )}/edit`
                )
              }
              onDelete={() => setDeleteTarget(sp)}
            />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Sales Person"
        description={`Are you sure you want to delete "${deleteTarget?.sales_person_name}"?`}
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
