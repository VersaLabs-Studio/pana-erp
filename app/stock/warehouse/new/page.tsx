"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/smart";
import { InfoCard } from "@/components/ui/info-card";
import { FormInput, FormFrappeSelect, FormSwitch } from "@/components/form";
import { useFrappeCreate } from "@/hooks/generic";
import { WarehouseCreateSchema } from "@/lib/schemas/doctype-schemas";
import {
  Warehouse as WarehouseIcon,
  Info,
  Settings,
  LucideIcon,
} from "lucide-react";
import type { WarehouseCreateRequest } from "@/types/doctype-types";

type FormData = z.input<typeof WarehouseCreateSchema>;

export default function NewWarehousePage() {
  const router = useRouter();
  const createMutation = useFrappeCreate<
    { data: WarehouseCreateRequest },
    WarehouseCreateRequest
  >("Warehouse", {
    onSuccess: () => router.push("/stock/warehouse"),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(WarehouseCreateSchema),
    defaultValues: { is_group: 0, disabled: 0 },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Create Warehouse" backHref="/stock/warehouse" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) =>
            createMutation.mutate(d as WarehouseCreateRequest),
          )}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InfoCard
                title="Basic Information"
                icon={<Info className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="warehouse_name"
                    label="Warehouse Name"
                    required
                    placeholder="e.g. Main Store"
                  />
                  <FormFrappeSelect
                    control={form.control}
                    name="parent_warehouse"
                    label="Parent Warehouse"
                    doctype="Warehouse"
                    filters={[["is_group", "=", 1]]}
                  />
                  <FormInput
                    control={form.control}
                    name="warehouse_type"
                    label="Warehouse Type"
                    placeholder="e.g. Finished Goods"
                  />
                  <FormFrappeSelect
                    control={form.control}
                    name="company"
                    label="Company"
                    doctype="Company"
                  />
                </div>
                <div className="flex flex-wrap gap-6 pt-4">
                  <FormSwitch
                    control={form.control}
                    name="is_group"
                    label="Is Parent Group"
                    description="Contains sub-warehouses"
                  />
                  <FormSwitch
                    control={form.control}
                    name="disabled"
                    label="Disabled"
                  />
                </div>
              </InfoCard>
            </div>
            <div className="space-y-6">
              <InfoCard
                title="Actions"
                icon={<Settings className="h-4 w-4" />}
                variant="gradient"
              >
                <Button
                  type="submit"
                  className="w-full rounded-xl"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create Warehouse"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </InfoCard>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
