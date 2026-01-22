// @ts-nocheck
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { BOMCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("BOM", {
  allowedFields: [
    "name",
    "item",
    "item_name",
    "company",
    "quantity",
    "uom",
    "is_active",
    "is_default",
    "with_operations",
    "raw_material_cost",
    "operating_cost",
    "total_cost",
    "currency",
    "creation",
    "docstatus",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 50,
});

export const POST = createCreateHandler("BOM", BOMCreateSchema);
