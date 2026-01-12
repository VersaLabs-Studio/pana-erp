// app/api/crm/lead/route.ts
import { createListHandler, createCreateHandler } from "@/lib/api-factory";

export const GET = createListHandler("Lead", {
  allowedFields: ["name", "lead_name", "company_name", "status", "email_id", "mobile_no"],
  defaultSort: { field: "creation", order: "desc" },
});

export const POST = createCreateHandler("Lead");