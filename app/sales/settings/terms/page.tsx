// app/sales/settings/terms/page.tsx
// Pana ERP v3.0 - Terms List Page
// @ts-nocheck

"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Trash2, FileText } from "lucide-react";
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
import type { TermsandConditions } from "@/types/doctype-types";

export default function TermsListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TermsandConditions | null>(null);

  const { data: terms, isLoading, error } = useFrappeList<TermsandConditions>("Terms and Conditions", {
    orderBy: { field: "creation", order: "desc" },
    search,
    limit: 100,
  });

  const deleteMutation = useFrappeDelete("Terms and Conditions", {
    onSuccess: () => setDeleteTarget(null),
  });

  const filteredTerms = useMemo(() => {
    if (!terms) return [];
    if (!search) return terms;
    return terms.filter((t) => t.title?.toLowerCase().includes(search.toLowerCase()));
  }, [terms, search]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.name);
  };

  if (isLoading) return <LoadingState type="list" count={6} />;
  if (error) return <div className="p-4 text-destructive">Failed to load terms</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terms and Conditions"
        subtitle={`${filteredTerms.length} total`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button className="rounded-full" onClick={() => router.push("/sales/settings/terms/new")}>
            <Plus className="h-4 w-4 mr-2" /> New Terms
          </Button>
        }
      />

      {filteredTerms.length === 0 ? (
        <EmptyState
          title="No terms found"
          description="Create standard legal terms for sales"
          action={<Button onClick={() => router.push("/sales/settings/terms/new")}>Create Terms</Button>}
        />
      ) : (
        <div className="space-y-2">
          {filteredTerms.map((term) => (
            <div
              key={term.name}
              className="group p-4 bg-card hover:bg-card/80 transition-colors rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/30 rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{term.title}</h3>
                  <div className="flex gap-2 mt-1">
                    {term.selling && <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Sales</span>}
                    {term.buying && <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">Buying</span>}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/sales/settings/terms/${encodeURIComponent(term.name)}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(term)}>
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
        title="Delete Terms"
        description={`Delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}