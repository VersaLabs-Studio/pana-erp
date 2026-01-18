"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Handshake, Percent } from "lucide-react";
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
import type { SalesPartner } from "@/types/doctype-types";

function SalesPartnerRow({
  salesPartner,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  salesPartner: SalesPartner;
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
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Handshake className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {salesPartner.partner_name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-secondary px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
              {salesPartner.partner_type}
            </span>
            {salesPartner.commission_rate && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Percent className="h-3 w-3" /> {salesPartner.commission_rate}%
              </span>
            )}
          </div>
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

export default function SalesPartnerListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SalesPartner | null>(null);

  const { data: partners, isLoading } = useFrappeList<SalesPartner>(
    "Sales Partner",
    {
      orderBy: { field: "creation", order: "desc" },
      search,
      limit: 100,
    },
  );

  const deleteMutation = useFrappeDelete("Sales Partner", {
    onSuccess: () => setDeleteTarget(null),
  });

  const filteredData = useMemo(() => {
    if (!partners) return [];
    if (!search) return partners;
    return partners.filter((p) =>
      p.partner_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [partners, search]);

  if (isLoading) return <LoadingState type="table" count={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Partners"
        subtitle={`${filteredData.length} total`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button
            className="rounded-full"
            onClick={() => router.push("/sales/settings/sales-partner/new")}
          >
            Add Partner
          </Button>
        }
      />
      {filteredData.length === 0 ? (
        <EmptyState
          title="No Partners"
          description="Create your first sales partner."
          action={
            <Button
              onClick={() => router.push("/sales/settings/sales-partner/new")}
            >
              Add
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredData.map((sp, i) => (
            <SalesPartnerRow
              key={sp.name}
              salesPartner={sp}
              index={i}
              onView={() =>
                router.push(
                  `/sales/settings/sales-partner/${encodeURIComponent(sp.name)}`,
                )
              }
              onEdit={() =>
                router.push(
                  `/sales/settings/sales-partner/${encodeURIComponent(sp.name)}/edit`,
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
        title="Delete Sales Partner"
        description={`Are you sure you want to delete "${deleteTarget?.partner_name}"?`}
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
