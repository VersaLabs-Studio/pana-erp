// app/crm/address/[name]/page.tsx
// Pana ERP v3.0 - Address Detail Page
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// v3.0 Imports
import { useFrappeDoc, useFrappeDelete } from "@/hooks/generic";
import {
  PageHeader,
  LoadingState,
  ConfirmDialog,
} from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
// Assuming DataPoint is in @/components/ui/info-card as per instructions
import { DataPoint } from "@/components/ui/info-card"; 
import type { Address } from "@/types/doctype-types";

export default function AddressDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch address data
  const { data: address, isLoading, error } = useFrappeDoc<Address>("Address", name);

  // Delete mutation
  const deleteMutation = useFrappeDelete("Address", {
    onSuccess: () => router.push("/crm/address"),
  });

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(name);
  };

  // Loading state
  if (isLoading) {
    return <LoadingState type="detail" />;
  }

  // Error state
  if (error || !address) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Address not found</p>
      </div>
    );
  }

  // Address type variant
  const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
    return type === "Billing" ? "default" : type === "Shipping" ? "secondary" : "outline";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={address.address_title || address.address_line1 || "Address Details"}
        subtitle={`ID: ${name}`}
        backHref="/crm/address"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => router.push(`/crm/address/${encodeURIComponent(name)}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border-none shadow-xl bg-popover/95 backdrop-blur-xl p-1"
              >
                <DropdownMenuItem
                  className="rounded-lg text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Info */}
          <InfoCard title="Location" icon="map-pin">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{address.address_line1}</p>
                  {address.address_line2 && <p className="text-muted-foreground">{address.address_line2}</p>}
                  <p className="text-muted-foreground mt-1">
                    {[address.city, address.state, address.country].filter(Boolean).join(", ")}
                  </p>
                  {address.pincode && <p className="text-muted-foreground">{address.pincode}</p>}
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Contact Info */}
          <InfoCard title="Contact Information" icon="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <DataPoint label="Email" value={address.email_id} />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <DataPoint label="Phone" value={address.phone} />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <DataPoint label="Fax" value={address.fax} />
              </div>
            </div>
          </InfoCard>

          {/* Linked Entities */}
          {address.links && address.links.length > 0 && (
            <InfoCard title="Linked To" icon="link">
              <div className="space-y-3">
                {address.links.map((link, idx) => {
                  const linkName = (link as { link_doctype: string; link_name: string }).link_name;
                  const linkDoctype = (link as { link_doctype: string; link_name: string }).link_doctype;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{linkDoctype}</span>
                      </div>
                      <Badge variant="outline">{linkName}</Badge>
                    </div>
                  );
                })}
              </div>
            </InfoCard>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Classification */}
          <InfoCard title="Classification" variant="gradient">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant={getTypeVariant(address.address_type)}>
                  {address.address_type}
                </Badge>
              </div>
              {address.is_primary_address === 1 && (
                <div className="p-3 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm font-medium text-primary">Primary Address</p>
                </div>
              )}
              {address.is_shipping_address === 1 && (
                <div className="p-3 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm font-medium text-primary">Shipping Address</p>
                </div>
              )}
            </div>
          </InfoCard>

          {/* System Info */}
          <InfoCard title="System Info">
            <div className="space-y-3">
               <DataPoint label="Created" value={address.creation ? new Date(address.creation).toLocaleDateString() : "-"} />
               <DataPoint label="Modified" value={address.modified ? new Date(address.modified).toLocaleDateString() : "-"} />
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Address"
        description={`Are you sure you want to delete "${address.address_title || address.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}