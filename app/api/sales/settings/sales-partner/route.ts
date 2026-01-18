import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { SalesPartnerCreateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createListHandler("Sales Partner", {
  allowedFields: [
    "name",
    "partner_name",
    "partner_type",
    "commission_rate",
    "territory",
    "creation",
  ],
  defaultSort: { field: "creation", order: "desc" },
  defaultLimit: 100,
});

export const POST = createCreateHandler(
  "Sales Partner",
  SalesPartnerCreateSchema,
);
