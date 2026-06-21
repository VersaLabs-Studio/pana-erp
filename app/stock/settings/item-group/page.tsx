// app/stock/settings/item-group/page.tsx
// Obsidian ERP v4.0 — Item Group settings list (2R Part 7).
// Mirrors the Inventory → Settings golden template (KPI bar + table
// rows + premium motion + reduced-motion safe).

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, FolderTree, Layers, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  EmptyState,
  LoadingState,
  ConfirmDialog,
} from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { useFrappeList, useFrappeDelete } from "@/hooks/generic";
import { ListErrorState } from "@/components/ui/list-error-state";
import { cn } from "@/lib/utils";

interface ItemGroupRow {
  name: string;
  item_group_name?: string;
  parent_item_group?: string;
  is_group?: number;
}

export default function ItemGroupListPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ItemGroupRow | null>(null);

  const {
    data: groups = [],
    isLoading,
    error,
    refetch,
  } = useFrappeList<ItemGroupRow>("Item Group", {
    fields: ["name", "item_group_name", "parent_item_group", "is_group"],
    orderBy: { field: "lft", order: "asc" },
    limit: 500,
  });

  const deleteMutation = useFrappeDelete("Item Group", {
    onSuccess: () => {
      refetch();
      setDeleteTarget(null);
    },
  });

  const filtered = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        (g.item_group_name ?? g.name).toLowerCase().includes(q) ||
        g.name.toLowerCase().includes(q),
    );
  }, [groups, search]);

  const totalCount = filtered.length;
  const topLevelCount = useMemo(
    () => filtered.filter((g) => !g.parent_item_group || g.parent_item_group === "All Item Groups").length,
    [filtered],
  );
  const subgroupCount = totalCount - topLevelCount;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.name);
  };

  if (isLoading) return <LoadingState type="table" count={8} />;
  if (error) return <ListErrorState error={error} label="item groups" />;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Item Group"
        description={`Are you sure you want to delete "${deleteTarget?.item_group_name || deleteTarget?.name}"? Items using this group will break.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />

      <PageHeader
        title="Item Groups"
        subtitle={`${totalCount} group${totalCount !== 1 ? "s" : ""}`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search item groups..."
        actions={
          <Button
            className="rounded-full px-6 shadow-lg shadow-primary/20"
            onClick={() => router.push("/stock/settings/item-group/new")}
          >
            <Plus className="h-4 w-4 mr-2" /> New Item Group
          </Button>
        }
      />

      {/* KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard variant="gradient">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>
            <DataPoint label="Total Groups" value={totalCount} />
          </div>
        </InfoCard>
        <InfoCard variant="gradient">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <DataPoint label="Top Level" value={topLevelCount} />
          </div>
        </InfoCard>
        <InfoCard variant="gradient">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>
            <DataPoint label="Subgroups" value={subgroupCount} />
          </div>
        </InfoCard>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No item groups found"
          description={
            search
              ? "Try adjusting your search."
              : "Create your first item group to organize your inventory."
          }
          action={
            !search && (
              <Button
                onClick={() => router.push("/stock/settings/item-group/new")}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Create First Group
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-2 pb-10">
          {filtered.map((g, index) => (
            <motion.div
              key={g.name}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.18,
                delay: prefersReducedMotion ? 0 : Math.min(index * 0.02, 0.4),
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "group flex items-center justify-between gap-3 px-4 py-3 bg-card rounded-2xl border border-border/50",
                "hover:border-primary/20 hover:shadow-md transition-all",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FolderTree className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {g.item_group_name || g.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {g.parent_item_group && g.parent_item_group !== "All Item Groups" ? (
                      <>parent: {g.parent_item_group}</>
                    ) : (
                      <>top-level</>
                    )}
                    {g.is_group ? <> · group</> : null}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-border/50 shadow-xl bg-popover/95 backdrop-blur-xl p-1.5 min-w-[140px]"
                  >
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/stock/settings/item-group/${encodeURIComponent(g.name)}`,
                        )
                      }
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/stock/settings/item-group/${encodeURIComponent(g.name)}/edit`,
                        )
                      }
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(g)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}