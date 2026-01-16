// app/api/accounting/company/route.ts
// Pana ERP v3.0 - Company API

import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { CompanyCreateSchema } from "@/lib/schemas/doctype-schemas";

// GET /api/accounting/company - List companies
export const GET = createListHandler("Company", {
  allowedFields: [
    "name",
    "company_name",
    "abbr",
    "default_currency",
    "country",
    "is_group",
    "parent_company",
  ],
  defaultSort: { field: "company_name", order: "asc" },
  defaultLimit: 100,
});

// POST /api/accounting/company - Create company
export const POST = createCreateHandler("Company", CompanyCreateSchema);
