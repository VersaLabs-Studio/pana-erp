// app/api/sales/sales-order/route.ts
// Pana ERP v3.0 - Sales Order API Routes (Placeholder for Phase 3)

import { createListHandler } from "@/lib/api-factory";

// GET /api/sales/sales-order - List sales orders
export const GET = createListHandler("Sales Order", {
  allowedFields: [
    "name",
    "customer",
    "customer_name",
    "transaction_date",
    "delivery_date",
    "status",
    "grand_total",
    "currency",
    "company",
  ],
  defaultSort: { field: "transaction_date", order: "desc" },
  defaultLimit: 50,
});

// Note: POST/PUT/DELETE will be implemented in Phase 3
