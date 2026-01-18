"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Trash2,
  Clock,
  Handshake,
  MoreVertical,
  Activity,
  MapPin,
  FileText,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useFrappeDoc, useFrappeDelete } from "@/hooks/generic";
import { SalesPartner } from "@/types/doctype-types";
import { PageHeader, LoadingState, ConfirmDialog } from "@/components/smart";
import { InfoCard, DataPoint, StatCard } from "@/components/ui/info-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SalesPartnerDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = use(params);
  const name = decodeURIComponent(encodedName);
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: sp,
    isLoading,
    error,
  } = useFrappeDoc<SalesPartner>("Sales Partner", name);

  const deleteMutation = useFrappeDelete("Sales Partner", {
    onSuccess: () => {
      toast.success("Sales Partner deleted successfully");
      router.push("/sales/settings/sales-partner");
    },
  });

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(name);
    } catch (error) {
      console.error("Failed to delete sales partner:", error);
    }
  };

  if (isLoading) return <LoadingState type="detail" />;
  if (error || !sp)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading Sales Partner
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Sales Partner"
        description={`Are you sure you want to delete "${sp.partner_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />

      <PageHeader
        backHref="/sales/settings/sales-partner"
        label="Sales Partner Details"
        title={sp.partner_name}
        status={{
          label: "Active",
          variant: "success",
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl border-none shadow-xl bg-popover/90 backdrop-blur-xl p-2 w-48"
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-xl"
              onClick={() =>
                router.push(`/sales/settings/sales-partner/${encodedName}/edit`)
              }
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit Partner
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="rounded-xl text-destructive focus:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Partner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <InfoCard
            title={
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4" />
                <span>Partner Information</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <DataPoint label="Partner Name" value={sp.partner_name} />
              <DataPoint
                label="Partner Type"
                value={sp.partner_type || "N/A"}
              />
              <DataPoint
                label="Commission Rate"
                value={`${sp.commission_rate}%`}
              />
              <DataPoint label="Territory" value={sp.territory} />
              <div className="md:col-span-2">
                <DataPoint
                  label="Description"
                  value={sp.description || "No description provided."}
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title={
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Contact Details</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <DataPoint
                label="Address"
                value={sp.address_desc || "No address provided."}
              />
              <DataPoint
                label="Contact"
                value={sp.contact_desc || "No contact provided."}
              />
            </div>
          </InfoCard>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <InfoCard
            variant="gradient"
            title={
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Quick Stats</span>
              </div>
            }
          >
            <div className="space-y-4">
              <StatCard
                label="Commission"
                value={`${sp.commission_rate}%`}
                valueClassName="text-primary"
              />
            </div>
          </InfoCard>

          <InfoCard
            title={
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>System Audit</span>
              </div>
            }
          >
            <div className="space-y-4 text-sm text-muted-foreground/80">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="font-mono">
                  {sp.creation
                    ? new Date(sp.creation).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified</span>
                <span className="font-mono">
                  {sp.modified
                    ? new Date(sp.modified).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Owner</span>
                <span className="font-mono truncate max-w-[120px]">
                  {sp.owner}
                </span>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
