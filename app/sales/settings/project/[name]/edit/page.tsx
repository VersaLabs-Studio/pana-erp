// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Search, Save, X, Layout, Loader2 } from "lucide-react";
import { useFrappeDoc, useFrappeUpdate } from "@/hooks/generic";
import { PageHeader, LoadingState } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import {
  FormInput,
  FormFrappeSelect,
  FormSelect,
  FormDatePicker,
} from "@/components/form";
import { ProjectUpdateSchema } from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);

  const { data: project, isLoading } = useFrappeDoc<any>("Project", name);
  const [dataInitialized, setDataInitialized] = useState(false);

  const form = useForm({
    resolver: zodResolver(ProjectUpdateSchema),
    defaultValues: {
      project_name: "",
      company: "",
      status: "Open",
      percent_complete: 0,
    },
  });

  useEffect(() => {
    if (project && !dataInitialized) {
      form.reset({
        project_name: project.project_name,
        company: project.company,
        status: project.status,
        customer: project.customer,
        expected_start_date: project.expected_start_date,
        expected_end_date: project.expected_end_date,
        priority: project.priority,
        percent_complete: project.percent_complete || 0,
        naming_series: project.naming_series,
      });
      setDataInitialized(true);
    }
  }, [project, form, dataInitialized]);

  const updateMutation = useFrappeUpdate("Project", {
    onSuccess: () => {
      toast.success("Project updated successfully");
      router.push("/sales/settings/project");
    },
    onError: (error: any) => {
      toast.error("Failed to update project", { description: error.message });
    },
  });

  const onSubmit = async (values: any) => {
    await updateMutation.mutateAsync({ name, data: values });
  };

  if (isLoading) return <LoadingState type="detail" />;
  if (!project) return null;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title={`Edit ${project.project_name}`}
        subtitle={project.name}
        backHref="/sales/settings/project"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <InfoCard
                title="Project Management"
                icon={<Layout className="h-5 w-5 text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                  <div className="md:col-span-2">
                    <FormInput
                      control={form.control}
                      name="project_name"
                      label="Project Name"
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
                    label="Client"
                    doctype="Customer"
                    labelField="customer_name"
                  />

                  <FormInput
                    control={form.control}
                    name="percent_complete"
                    label="Completion Percentage (%)"
                    type="number"
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
              <InfoCard title="Status & Control" variant="gradient">
                <div className="space-y-4 p-2">
                  <FormSelect
                    control={form.control}
                    name="status"
                    label="Current Status"
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
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Update Project
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl"
                    onClick={() => router.back()}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancel
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
