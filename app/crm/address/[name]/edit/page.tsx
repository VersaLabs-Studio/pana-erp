// app/crm/addresses/[name]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useFrappeDoc, useFrappeUpdate } from "@/hooks/generic";
import { PageHeader } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import { Form } from "@/components/ui/form";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import type { Address, AddressUpdateRequest } from "@/types/doctype-types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditAddressPage() {
  const params = useParams();
  const name = params.name as string;
  const router = useRouter();

  const { data: address, isLoading } = useFrappeDoc<Address>("Address", name);
  const updateMutation = useFrappeUpdate<Address, { name: string; data: any }>(
    "Address",
    {
      onSuccess: () => router.push(`/crm/addresses/${name}`),
    }
  );

  const form = useForm({
    defaultValues: {
      address_title: "",
      address_type: "Billing",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      email_id: "",
      phone: "",
      is_primary_address: false,
      is_shipping_address: false,
    },
  });

  useEffect(() => {
    if (address) {
      form.reset({
        address_title: address.address_title,
        address_type: address.address_type as any,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        email_id: address.email_id,
        phone: address.phone,
        is_primary_address: address.is_primary_address === 1,
        is_shipping_address: address.is_shipping_address === 1,
      });
    }
  }, [address, form]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      is_primary_address: data.is_primary_address ? 1 : 0,
      is_shipping_address: data.is_shipping_address ? 1 : 0,
    };
    await updateMutation.mutateAsync({ name, data: payload });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Address: ${address?.address_title || name}`}
        subtitle="Update address details"
        backHref={`/crm/addresses/${name}`}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InfoCard title="Address Details" icon="map-pin">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="address_title"
                    label="Title"
                    required
                  />
                  <FormSelect
                    control={form.control}
                    name="address_type"
                    label="Type"
                    options={[
                      { label: "Billing", value: "Billing" },
                      { label: "Shipping", value: "Shipping" },
                      { label: "Office", value: "Office" },
                      { label: "Personal", value: "Personal" },
                      { label: "Plant", value: "Plant" },
                      { label: "Postal", value: "Postal" },
                      { label: "Shop", value: "Shop" },
                      { label: "Subsidiary", value: "Subsidiary" },
                      { label: "Warehouse", value: "Warehouse" },
                      { label: "Current", value: "Current" },
                      { label: "Permanent", value: "Permanent" },
                      { label: "Other", value: "Other" },
                    ]}
                  />
                  <FormInput
                    control={form.control}
                    name="address_line1"
                    label="Address Line 1"
                    required
                    className="col-span-2"
                  />
                  <FormInput
                    control={form.control}
                    name="address_line2"
                    label="Address Line 2"
                    className="col-span-2"
                  />
                  <FormInput
                    control={form.control}
                    name="city"
                    label="City"
                    required
                  />
                  <FormInput
                    control={form.control}
                    name="state"
                    label="State"
                  />
                  <FormInput
                    control={form.control}
                    name="country"
                    label="Country"
                    required
                  />
                  <FormInput
                    control={form.control}
                    name="pincode"
                    label="Postal Code"
                  />
                  <FormInput
                    control={form.control}
                    name="email_id"
                    label="Email"
                    type="email"
                  />
                  <FormInput
                    control={form.control}
                    name="phone"
                    label="Phone"
                  />
                </div>
              </InfoCard>

              <div className="flex gap-6">
                <FormSwitch
                  control={form.control}
                  name="is_primary_address"
                  label="Is Primary Address"
                  description="Default billing address"
                />
                <FormSwitch
                  control={form.control}
                  name="is_shipping_address"
                  label="Is Shipping Address"
                  description="Default shipping address"
                />
              </div>
            </div>

            <div className="space-y-6">
              <InfoCard title="Actions" variant="gradient">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </InfoCard>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
