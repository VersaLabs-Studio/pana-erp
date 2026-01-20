// app/manufacturing/operation/new/page.tsx
// Pana ERP v3.0 - Create Operation Page
// @ts-nocheck

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  Cog as OperationIcon,
  Clock,
  Cpu,
  FileText,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import { useFrappeCreate } from "@/hooks/generic";
import { PageHeader } from "@/components/smart";
import { FormInput, FormFrappeSelect, FormTextarea } from "@/components/form";
import {
  OperationCreateSchema,
  type OperationFormData,
} from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";

export default function CreateOperationPage() {
  const router = useRouter();

  // Initialize form
  const form = useForm<OperationFormData>({
    resolver: zodResolver(OperationCreateSchema),
    defaultValues: {
      name: "",
      workstation: "",
      total_operation_time: 0,
      description: "",
    },
  });

  // Create mutation
  const createMutation = useFrappeCreate<any, OperationFormData>("Operation", {
    onSuccess: (response) => {
      toast.success("Operation created successfully");
      const createdOp = response.data;
      router.push(
        `/manufacturing/operation/${encodeURIComponent(createdOp.name)}`,
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create operation");
    },
    showToast: false,
  });

  const onSubmit = (data: OperationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="New Operation"
        subtitle="Define a manufacturing action with standard time"
        backHref="/manufacturing/operation"
      />

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Card */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6 shadow-sm">
            {/* Identity Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <OperationIcon className="h-5 w-5 text-indigo-500" />
                <span>Operation Identity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Operation Name"
                  placeholder="e.g., Printing, Cutting, Binding"
                  required
                  description="Use a clear, unique action name"
                />

                <FormFrappeSelect
                  control={form.control}
                  name="workstation"
                  label="Default Workstation"
                  doctype="Workstation"
                  placeholder="Select default machine..."
                  description="Assigns default rates when used in BOMs"
                />
              </div>
            </div>

            {/* Time Section */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Time Estimation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  control={form.control}
                  name="total_operation_time"
                  label="Standard Time (Minutes)"
                  type="number"
                  placeholder="e.g., 30"
                  description="Default time to complete this operation"
                />

                {/* Calculated Display */}
                <div className="flex flex-col justify-end">
                  <div className="bg-secondary/20 rounded-2xl p-4 border border-border/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        Duration in Hours
                      </p>
                      <p className="text-2xl font-black text-foreground">
                        {(
                          (form.watch("total_operation_time") || 0) / 60
                        ).toFixed(2)}{" "}
                        <span className="text-sm font-medium text-muted-foreground uppercase">
                          hrs
                        </span>
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Work Instructions</span>
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Operation Description"
                placeholder="Describe the step-by-step process for this operation..."
                rows={4}
              />
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 flex gap-4 items-start">
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">
                Costing Intelligence
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Assigning a workstation allows the system to automatically
                calculate operating costs for Bills of Materials (BOM) based on
                the machine's hourly rate and the standard time defined above.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-full px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-full min-w-[160px] shadow-lg shadow-primary/20"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Operation
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
