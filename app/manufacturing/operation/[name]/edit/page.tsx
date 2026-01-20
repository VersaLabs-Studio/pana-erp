// app/manufacturing/operation/[name]/edit/page.tsx
// Pana ERP v3.0 - Edit Operation Page
// @ts-nocheck

"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  Cog as OperationIcon,
  Clock,
  Cpu,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import { useFrappeDoc, useFrappeUpdate } from "@/hooks/generic";
import { PageHeader, LoadingState, EmptyState } from "@/components/smart";
import { FormInput, FormFrappeSelect, FormTextarea } from "@/components/form";
import {
  OperationUpdateSchema,
  type OperationUpdateData,
} from "@/lib/schemas/doctype-schemas";
import { toast } from "sonner";
import type { Operation } from "@/types/doctype-types";

export default function EditOperationPage() {
  const params = useParams();
  const router = useRouter();
  const operationName = decodeURIComponent(params.name as string);

  // Fetch existing operation
  const {
    data: operation,
    isLoading,
    error,
  } = useFrappeDoc<Operation>("Operation", operationName);

  // Initialize form
  const form = useForm<OperationUpdateData>({
    resolver: zodResolver(OperationUpdateSchema),
    defaultValues: {
      workstation: "",
      total_operation_time: 0,
      description: "",
    },
  });

  // Populate form
  useEffect(() => {
    if (operation) {
      form.reset({
        workstation: operation.workstation || "",
        total_operation_time: operation.total_operation_time || 0,
        description: operation.description || "",
      });
    }
  }, [operation, form]);

  // Update mutation
  const updateMutation = useFrappeUpdate<
    any,
    { name: string; data: OperationUpdateData }
  >("Operation", {
    onSuccess: () => {
      toast.success("Operation updated successfully");
      router.push(
        `/manufacturing/operation/${encodeURIComponent(operationName)}`,
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update operation");
    },
    showToast: false,
  });

  const onSubmit = (data: OperationUpdateData) => {
    updateMutation.mutate({
      name: operationName,
      data: data,
    });
  };

  if (isLoading) {
    return (
      <LoadingState variant="detail" message="Fetching operation data..." />
    );
  }

  if (error || !operation) {
    return (
      <EmptyState
        icon={OperationIcon}
        title="Operation not found"
        description="The operation you are trying to edit could not be loaded."
        action={
          <Button
            onClick={() => router.push("/manufacturing/operation")}
            className="rounded-full"
          >
            Back to Operations
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${operation.name}`}
        subtitle="Modify operation configuration and standard times"
        backHref={`/manufacturing/operation/${encodeURIComponent(operationName)}`}
      />

      {/* Immutability Notice */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3 items-center">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          The <span className="font-bold text-foreground">Operation Name</span>{" "}
          is a unique identifier and cannot be renamed. To change the name,
          delete this operation and create a new one.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6 shadow-sm">
            {/* Workstation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Cpu className="h-5 w-5 text-indigo-500" />
                <span>Default Workstation</span>
              </div>

              <FormFrappeSelect
                control={form.control}
                name="workstation"
                label="Machine Assignment"
                doctype="Workstation"
                placeholder="Select default machine..."
              />
            </div>

            {/* Time Estimation */}
            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Time Management</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  control={form.control}
                  name="total_operation_time"
                  label="Standard Time (Minutes)"
                  type="number"
                />

                <div className="flex flex-col justify-end">
                  <div className="bg-secondary/20 rounded-2xl p-4 border border-border/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        Formatted Duration
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
                label="Detailed Description"
                rows={4}
              />
            </div>
          </div>

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
              disabled={updateMutation.isPending}
              className="rounded-full min-w-[160px] shadow-lg shadow-primary/20"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
