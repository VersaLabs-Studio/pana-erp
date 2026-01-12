// app/crm/addresses/[name]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFrappeDoc, useFrappeDelete } from "@/hooks/generic";
import { PageHeader, ConfirmDialog } from "@/components/smart";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Address } from "@/types/doctype-types";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Globe, Edit2, Trash2 } from "lucide-react";

export default function AddressDetailPage() {
  const params = useParams();
  const name = params.name as string;
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: address, isLoading } = useFrappeDoc<Address>("Address", name);
  const deleteMutation = useFrappeDelete("Address", {
    onSuccess: () => router.push("/crm/addresses"),
  });

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(name);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!address) return <div>Address not found</div>;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
        variant="destructive"
      />

      <PageHeader
        title={address.address_title || name}
        subtitle={address.address_type}
        backHref="/crm/addresses"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => router.push(`/crm/addresses/${name}/edit`)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="rounded-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard
            title="Address Information"
            icon={<MapPin className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <DataPoint
                label="Address Title"
                value={address.address_title}
                className="col-span-2"
              />
              <DataPoint label="Address Type" value={address.address_type} />
              <div className="flex gap-2 items-center flex-wrap">
                {address.is_primary_address === 1 && (
                  <Badge variant="secondary">Primary</Badge>
                )}
                {address.is_shipping_address === 1 && (
                  <Badge variant="default">Shipping</Badge>
                )}
              </div>
              <DataPoint
                label="Address Line 1"
                value={address.address_line1}
                className="col-span-2"
              />
              <DataPoint
                label="Address Line 2"
                value={address.address_line2}
                className="col-span-2"
              />
              <DataPoint label="City" value={address.city} />
              <DataPoint label="State" value={address.state} />
              <DataPoint label="Country" value={address.country} />
              <DataPoint label="Pincode/Zip" value={address.pincode} mono />
            </div>
          </InfoCard>

          <InfoCard title="Communication" icon={<Phone className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataPoint label="Email Address" value={address.email_id} />
              <DataPoint label="Phone" value={address.phone} />
            </div>
          </InfoCard>
        </div>

        <div className="space-y-6">
          <InfoCard
            title="Linked Documents"
            icon={<Globe className="w-4 h-4" />}
          >
            <div className="space-y-4">
              {address.links && address.links.length > 0 ? (
                address.links.map((link: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-secondary/30 rounded-[1.5rem] border flex flex-col gap-1 transition-all hover:bg-secondary/50"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {link.link_doctype}
                    </span>
                    <span className="font-semibold text-sm">
                      {link.link_name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No linked documents
                </p>
              )}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
