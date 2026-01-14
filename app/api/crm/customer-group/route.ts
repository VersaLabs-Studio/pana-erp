// app/api/crm/customer-group/route.ts
// Pana ERP v3.0 - Customer Group API (GET list for options)

import { createListHandler } from "@/lib/api-factory";

// GET /api/crm/customer-group - List customer groups
export const GET = createListHandler("Customer Group", {
  allowedFields: [
    "name",
    "customer_group_name",
    "parent_customer_group",
    "is_group",
  ],
  defaultSort: { field: "customer_group_name", order: "asc" },
  defaultLimit: 100,
});
