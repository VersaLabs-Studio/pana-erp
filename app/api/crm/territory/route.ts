import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { TerritoryCreateSchema } from "@/lib/schemas/doctype-schemas";

// GET /api/crm/territory - List territories
export const GET = createListHandler("Territory", {
  allowedFields: ["name", "territory_name", "parent_territory", "is_group"],
  defaultSort: { field: "territory_name", order: "asc" },
  defaultLimit: 100,
});

// POST /api/crm/territory - Create territory
export const POST = createCreateHandler("Territory", TerritoryCreateSchema);
