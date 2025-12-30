// app/crm/address/new/page.tsx
// @ts-nocheck
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useFrappeCreate } from "@/hooks/generic";
import { PageHeader } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import { FormInput, FormTextarea } from "@/components/form";
import type { AddressCreateRequest } from "@/types/doctype-types"; // Generated

// Schema definition
const addressFormSchema = z.object({
  address_title: z.string().min(1, "Title is required"),
  address_line1: z.string().min(1, "Address Line 1 is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  links: z.array(z.object({
    link_doctype: z.string(),
    link_name: z.string(),
  })).optional(),
});

export default function NewAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for linking params
  const linkDoctype = searchParams.get("link_doctype");
  const linkName = searchParams.get("link_name");

  const createMutation = useFrappeCreate<{ data: AddressCreateRequest }, AddressCreateRequest>(
    "Address",
    {
      onSuccess: () => {
        // If linked, go back to the parent detail page, otherwise list
        if (linkDoctype && linkName) {
           router.push(`/${linkDoctype.toLowerCase().replace(" ", "-")}/${encodeURIComponent(linkName)}`);
        } else {
           router.push("/crm/address");
        }
      },
    }
  );

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      address_title: "",
      address_line1: "",
      city: "",
      country: "",
      links: [],
    },
  });

  // Inject link if params exist
  useEffect(() => {
    if (linkDoctype && linkName) {
      form.setValue("links", [{
        link_doctype: linkDoctype,
        link_name: linkName,
      }]);
      // Optionally set title if not present
      if (!form.getValues("address_title")) {
        form.setValue("address_title", `${linkName} Address`);
      }
    }
  }, [linkDoctype, linkName, form]);

  const onSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Address"
        subtitle={linkDoctype ? `Linking to ${linkName}` : "Create a new address"}
        backHref="/crm/address"
      />
      
      {/* Form implementation similar to Golden Template */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Use InfoCard for grouping */}
        <InfoCard title="Primary Address" icon="map-pin">
           <div className="grid grid-cols-1 gap-4">
              <FormInput control={form.control} name="address_title" label="Title" required />
              <FormInput control={form.control} name="address_line1" label="Address Line 1" required />
              <div className="grid grid-cols-2 gap-4">
                  <FormInput control={form.control} name="city" label="City" required />
                  <FormInput control={form.control} name="state" label="State" />
              </div>
           </div>
        </InfoCard>
        
        {/* Submit Button */}
      </form>
    </div>
  );
}