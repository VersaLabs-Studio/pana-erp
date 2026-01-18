// @ts-nocheck - React Hook Form + Zod type inference limitations
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PageHeader, LoadingState } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import { FormInput, FormFrappeSelect, FormTextarea } from "@/components/form";
import { useFrappeDoc, useFrappeUpdate } from "@/hooks/generic";
import { SalesPartnerUpdateSchema } from "@/lib/schemas/doctype-schemas";
import { SalesPartner, SalesPartnerUpdateRequest } from "@/types/doctype-types";
import z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { Handshake, Save } from "lucide-react";

type FormData = z.infer<typeof SalesPartnerUpdateSchema>;

export default function EditSalesPartnerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = use(params);
  const name = decodeURIComponent(encodedName);
  const router = useRouter();

  const {
    data: sp,
    isLoading,
    error,
  } = useFrappeDoc<SalesPartner>("Sales Partner", name);

  const updateMutation = useFrappeUpdate<
    { data: SalesPartner },
    { name: string; data: SalesPartnerUpdateRequest }
  >("Sales Partner", {
    onSuccess: () => {
      toast.success("Sales Partner updated successfully");
      router.push(`/sales/settings/sales-partner`);
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(SalesPartnerUpdateSchema),
    defaultValues: {
      partner_name: "",
      partner_type: "",
      commission_rate: 0,
      territory: "",
      description: "",
    },
  });

  useEffect(() => {
    if (sp) {
      form.reset({
        partner_name: sp.partner_name || "",
        partner_type: sp.partner_type || "",
        commission_rate: sp.commission_rate || 0,
        territory: sp.territory || "",
        description: sp.description || "",
      });
    }
  }, [sp, form]);

  if (isLoading) return <LoadingState type="detail" />;
  if (error || !sp)
    return (
      <div className="p-8 text-center text-destructive">
        Error loading Sales Partner
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title={sp.partner_name}
        subtitle="Editing Partner record"
        backHref="/sales/settings/sales-partner"
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) =>
            updateMutation.mutate({
              name,
              data: d as SalesPartnerUpdateRequest,
            }),
          )}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InfoCard
                title={
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    <span>Partner Details</span>
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="partner_name"
                    label="Partner Name"
                    required
                    placeholder="e.g. ABC Agency"
                  />
                  <FormFrappeSelect
                    control={form.control}
                    name="partner_type"
                    label="Partner Type"
                    doctype="Sales Partner Type"
                    labelField="name"
                    required
                  />
                  <FormInput
                    control={form.control}
                    name="commission_rate"
                    label="Commission Rate (%)"
                    type="number"
                  />
                  <FormFrappeSelect
                    control={form.control}
                    name="territory"
                    label="Territory"
                    doctype="Territory"
                    labelField="territory_name"
                    required
                  />
                </div>
                <div className="mt-4">
                  <FormTextarea
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Internal notes..."
                  />
                </div>
              </InfoCard>
            </div>

            <div className="space-y-6">
              <InfoCard title="Actions" variant="gradient">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
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
