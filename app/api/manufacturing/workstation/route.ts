import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { WorkstationCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Workstation", {
  allowedFields: [
    "name",
    "workstation_name",
    "hour_rate",
    "company",
    "creation",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 50,
});

export const POST = createCreateHandler("Workstation", WorkstationCreateSchema);