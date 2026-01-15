import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { LeadSourceCreateSchema } from "@/lib/schemas/doctype-schemas";

// GET /api/crm/lead-source - List lead sources
export const GET = createListHandler("Lead Source", {
  allowedFields: ["name", "source_name"],
  defaultSort: { field: "source_name", order: "asc" },
  defaultLimit: 100,
});

// POST /api/crm/lead-source - Create lead source
export const POST = createCreateHandler("Lead Source", LeadSourceCreateSchema);
