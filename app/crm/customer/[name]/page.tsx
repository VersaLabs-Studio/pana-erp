// app/crm/customer/[name]/page.tsx
// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useFrappeDoc, useFrappeList, useFrappeDelete } from "@/hooks/generic";
import { PageHeader, ConfirmDialog, LoadingState } from "@/components/smart";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, User, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoCard } from "@/components/ui/info-card";
import { TextDataField } from "@/components/smart";
import type { Customer, Address, Contact } from "@/types/doctype-types";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "Address" | "Contact";
    item: any;
  } | null>(null);

  const { data: customer, isLoading } = useFrappeDoc<Customer>(
    "Customer",
    name
  );

  // Filter addresses by dynamic link
  const { data: addresses } = useFrappeList<Address>("Address", {
    filters: [
      ["links", "like", `%Customer%`],
      ["links", "like", `%${name}%`],
    ],
  });

  const { data: contacts } = useFrappeList<Contact>("Contact", {
    filters: [
      ["links", "like", `%Customer%`],
      ["links", "like", `%${name}%`],
    ],
  });

  const deleteMutation = useFrappeDelete(deleteTarget?.type || "Address");

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.item.name);
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingState type="detail" />;

  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.customer_name}
        subtitle={`ID: ${name}`}
        backHref="/crm/customer"
        actions={
          <Button
            className="rounded-full"
            onClick={() =>
              router.push(`/crm/customer/${encodeURIComponent(name)}/edit`)
            }
          >
            Edit Customer
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-card/50 p-1 rounded-xl border-none shadow-sm w-full md:w-fit inline-flex">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-background"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="rounded-lg data-[state=active]:bg-background"
          >
            Addresses & Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InfoCard title="Customer Information" icon="user">
            <div className="grid grid-cols-2 gap-4">
              <TextDataField
                label="Customer Name"
                value={customer.customer_name}
              />
              <TextDataField
                label="Customer Type"
                value={customer.customer_type}
              />
              <TextDataField
                label="Customer Group"
                value={customer.customer_group}
              />
              <TextDataField label="Territory" value={customer.territory} />
              <TextDataField label="Website" value={customer.website} />
              <TextDataField label="Language" value={customer.language} />
            </div>
          </InfoCard>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          {/* Addresses Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Addresses</h2>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/crm/address/new?link_doctype=Customer&link_name=${encodeURIComponent(
                      name
                    )}`
                  )
                }
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Address
              </Button>
            </div>

            <div className="grid gap-4">
              {addresses && addresses.length > 0 ? (
                addresses.map((addr) => (
                  <InfoCard
                    key={addr.name}
                    title={addr.address_title || "Untitled"}
                    className="relative"
                  >
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{addr.address_line1}</p>
                        {addr.address_line2 && <p>{addr.address_line2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.pincode}
                        </p>
                        <p>{addr.country}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({ type: "Address", item: addr })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </InfoCard>
                ))
              ) : (
                <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground">
                  No addresses found
                </div>
              )}
            </div>
          </div>

          {/* Contacts Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Contacts</h2>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/crm/contact/new?link_doctype=Customer&link_name=${encodeURIComponent(
                      name
                    )}`
                  )
                }
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Contact
              </Button>
            </div>

            <div className="grid gap-4">
              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => (
                  <InfoCard
                    key={contact.name}
                    title={contact.full_name || "Untitled"}
                    className="relative"
                  >
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{contact.email_id}</p>
                        <p>{contact.mobile_no}</p>
                        <p>{contact.designation}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteTarget({ type: "Contact", item: contact })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </InfoCard>
                ))
              ) : (
                <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground">
                  No contacts found
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type}`}
        description={`Are you sure? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
