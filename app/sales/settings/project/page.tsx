// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Layout,
  PieChart,
  Calendar,
  Building2,
  User,
  MoreVertical,
  Edit,
  Trash2,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ProjectListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useFrappeList<any>("Project", {
    fields: [
      "name",
      "project_name",
      "status",
      "company",
      "customer",
      "percent_complete",
      "expected_end_date",
    ],
    orderBy: { field: "`tabProject`.creation", order: "desc" },
    search,
  });

  const deleteMutation = useFrappeDelete("Project", {
    onSuccess: () => {
      setDeleteTarget(null);
      refetch();
    },
  });

  if (isLoading) return <LoadingState type="grid" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Manage production and delivery projects"
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button
            className="rounded-full"
            onClick={() => router.push("/sales/settings/project/new")}
          >
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        }
      />

      {!projects || projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to track progress"
          icon={Layout}
          action={
            <Button
              onClick={() => router.push("/sales/settings/project/new")}
              className="rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className="group bg-card p-6 rounded-[2rem] border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer"
              onClick={() =>
                router.push(
                  `/sales/settings/project/${encodeURIComponent(project.name)}`,
                )
              }
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg tracking-tight">
                    {project.project_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-mono">
                      {project.name}
                    </p>
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-0 text-[9px] font-bold border-0",
                        project.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {project.status}
                    </Badge>
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
                      className="h-8 w-8 rounded-full"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl shadow-xl p-1.5 min-w-[140px]"
                  >
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/sales/settings/project/${encodeURIComponent(project.name)}/edit`,
                        );
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(project.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                    <PieChart className="h-3 w-3" /> Completion
                  </span>
                  <span className="text-primary font-black">
                    {project.percent_complete || 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${project.percent_complete || 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                      End Date
                    </p>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {project.expected_end_date || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">
                      Customer
                    </p>
                    <p className="text-xs font-bold flex items-center gap-1.5 truncate">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {project.customer || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/10 flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {project.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project?"
        onConfirm={() => deleteMutation.mutate(deleteTarget!)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
