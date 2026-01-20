// app/api/manufacturing/operation/route.ts
// Pana ERP v3.0 - Operation API (List & Create)

import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { OperationCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Operation", {
  allowedFields: [
    "name",
    "workstation",
    "total_operation_time",
    "description",
    "creation",
    "modified",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 100,
});

export const POST = createCreateHandler("Operation", OperationCreateSchema);
