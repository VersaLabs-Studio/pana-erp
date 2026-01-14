// app/api/crm/gender/route.ts
// Pana ERP v3.0 - Gender API (GET list for options)

import { createListHandler } from "@/lib/api-factory";

// GET /api/crm/gender - List genders
export const GET = createListHandler("Gender", {
  allowedFields: ["name", "gender"],
  defaultSort: { field: "gender", order: "asc" },
  defaultLimit: 20,
});
