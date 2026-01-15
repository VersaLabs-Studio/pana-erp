import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { CountryCreateSchema } from "@/lib/schemas/doctype-schemas";

// GET /api/crm/country - List countries
export const GET = createListHandler("Country", {
  allowedFields: ["name", "country_name", "code"],
  defaultSort: { field: "country_name", order: "asc" },
  defaultLimit: 250,
});

// POST /api/crm/country - Create country
export const POST = createCreateHandler("Country", CountryCreateSchema);
