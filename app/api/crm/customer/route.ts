// app/api/crm/customer/route.ts
import { createListHandler, createCreateHandler } from "@/lib/api-factory";

export const GET = createListHandler("Customer", {
  allowedFields: ["name", "customer_name", "customer_group", "territory", "email_id", "mobile_no"],
  defaultSort: { field: "creation", order: "desc" },
});

export const POST = createCreateHandler("Customer");