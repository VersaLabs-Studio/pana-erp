// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Plus, Layout, Save, X } from "lucide-react";
import { useFrappeCreate } from "@/hooks/generic";
import { PageHeader } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import {
  FormInput,
  FormFrappeSelect,
  FormSelect,
  FormDatePicker,
} from "@/components/form";
import { ProjectCreateSchema } from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";

export default function NewProjectPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ProjectCreateSchema),
    defaultValues: {
      naming_series: "PROJ-.####",
      project_name: "",
      company: "",
      status: "Open",
      priority: "Medium",
    },
  });

  const createMutation = useFrappeCreate("Project", {
    onSuccess: () => {
      toast.success("Project created successfully");
      router.push("/sales/settings/project");
    },
    onError: (error: any) => {
      toast.error("Failed to create project", { description: error.message });
    },
  });

  const onSubmit = async (values: any) => {
    await createMutation.mutateAsync(values);
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="New Project"
        subtitle="Initialize a new production tracking project"
        backHref="/sales/settings/project"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <InfoCard
                title="Project Definition"
                icon={<Layout className="h-5 w-5 text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                  <div className="md:col-span-2">
                    <FormInput
                      control={form.control}
                      name="project_name"
                      label="Project Name"
                      placeholder="e.g. Standard Production 2026"
                      required
                    />
                  </div>

                  <FormFrappeSelect
                    control={form.control}
                    name="company"
                    label="Company"
                    doctype="Company"
                    labelField="company_name"
                    required
                  />

                  <FormFrappeSelect
                    control={form.control}
                    name="customer"
                    label="Linked Customer (Optional)"
                    doctype="Customer"
                    labelField="customer_name"
                  />

                  <FormDatePicker
                    control={form.control}
                    name="expected_start_date"
                    label="Expected Start"
                  />

                  <FormDatePicker
                    control={form.control}
                    name="expected_end_date"
                    label="Expected Deadline"
                  />
                </div>
              </InfoCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <InfoCard title="Configuration" variant="gradient">
                <div className="space-y-4 p-2">
                  <FormSelect
                    control={form.control}
                    name="naming_series"
                    label="Naming Series"
                    options={[{ label: "PROJ-.####", value: "PROJ-.####" }]}
                  />
                  <FormSelect
                    control={form.control}
                    name="status"
                    label="Initial Status"
                    options={[
                      { label: "Open", value: "Open" },
                      { label: "Completed", value: "Completed" },
                      { label: "Cancelled", value: "Cancelled" },
                    ]}
                  />
                  <FormSelect
                    control={form.control}
                    name="priority"
                    label="Priority"
                    options={[
                      { label: "Low", value: "Low" },
                      { label: "Medium", value: "Medium" },
                      { label: "High", value: "High" },
                    ]}
                  />
                </div>

                <div className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold shadow-lg"
                    disabled={createMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                    onClick={() => router.back()}
                  >
                    <X className="h-4 w-4 mr-2" /> Discard
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
