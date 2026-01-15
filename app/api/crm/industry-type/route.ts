// app/api/crm/industry-type/route.ts
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { IndustryTypeCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Industry Type", {
  allowedFields: ["name", "industry"],
  defaultSort: { field: "industry", order: "asc" },
  defaultLimit: 100,
});

// POST /api/crm/industry-type - Create industry type
export const POST = createCreateHandler(
  "Industry Type",
  IndustryTypeCreateSchema
);
