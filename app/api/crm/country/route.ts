// app/api/crm/country/route.ts
// Pana ERP v3.0 - Country API (GET list for options)

import { createListHandler } from "@/lib/api-factory";

// GET /api/crm/country - List countries
export const GET = createListHandler("Country", {
  allowedFields: ["name", "country_name", "code"],
  defaultSort: { field: "country_name", order: "asc" },
  defaultLimit: 250,
});