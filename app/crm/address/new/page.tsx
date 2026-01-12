// app/crm/addresses/new/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useFrappeCreate } from "@/hooks/generic";
import { PageHeader } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import { Form } from "@/components/ui/form";
import { FormInput, FormSelect, FormSwitch } from "@/components/form";
import { Button } from "@/components/ui/button";
import type { AddressCreateRequest } from "@/types/doctype-types";

const addressFormSchema = z.object({
  address_title: z.string().min(1, "Title is required"),
  address_type: z.enum([
    "Billing",
    "Shipping",
    "Office",
    "Personal",
    "Plant",
    "Postal",
    "Shop",
    "Subsidiary",
    "Warehouse",
    "Current",
    "Permanent",
    "Other",
  ]),
  address_line1: z.string().min(1, "Address Line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().optional(),
  email_id: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  is_primary_address: z.boolean().default(false),
  is_shipping_address: z.boolean().default(false),
  links: z
    .array(
      z.object({
        link_doctype: z.string(),
        link_name: z.string(),
      })
    )
    .optional(),
});

export default function NewAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkDoctype = searchParams.get("link_doctype");
  const linkName = searchParams.get("link_name");

  const createMutation = useFrappeCreate<any, any>("Address", {
    onSuccess: () => {
      if (linkDoctype && linkName) {
        router.push(`/crm/customer/${encodeURIComponent(linkName)}`);
      } else {
        router.push("/crm/addresses");
      }
    },
  });

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      address_type: "Billing",
      country: "Ethiopia",
      links: [],
      is_primary_address: false,
      is_shipping_address: false,
    },
  });

  useEffect(() => {
    if (linkDoctype && linkName) {
      form.setValue("links", [
        { link_doctype: linkDoctype, link_name: linkName },
      ]);
      if (!form.getValues("address_title")) {
        form.setValue("address_title", `${linkName} - Address`);
      }
    }
  }, [linkDoctype, linkName, form]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      is_primary_address: data.is_primary_address ? 1 : 0,
      is_shipping_address: data.is_shipping_address ? 1 : 0,
    };
    await createMutation.mutateAsync(payload);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Address"
        subtitle={
          linkName ? `Adding address for ${linkName}` : "Add address details"
        }
        backHref="/crm/addresses"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InfoCard title="Address Details" icon="map-pin">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      { label: "Other", value: "Other" },
                    ]}
                  />
                  <FormInput
                    control={form.control}
                    name="address_line1"
                    label="Address Line 1"
                    required
                    className="md:col-span-2"
                  />
                  <FormInput
                    control={form.control}
                    name="address_line2"
                    label="Address Line 2"
                    className="md:col-span-2"
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

              <div className="flex gap-8">
                <FormSwitch
                  control={form.control}
                  name="is_primary_address"
                  label="Is Primary"
                  description="Default billing address"
                />
                <FormSwitch
                  control={form.control}
                  name="is_shipping_address"
                  label="Is Shipping"
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
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending
                      ? "Creating..."
                      : "Create Address"}
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
