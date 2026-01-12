// app/api/crm/contact/route.ts
import { createListHandler, createCreateHandler } from "@/lib/api-factory";

export const GET = createListHandler("Contact", {
  allowedFields: ["name", "full_name", "email_id", "mobile_no", "company_name"],
  defaultSort: { field: "creation", order: "desc" },
});

export const POST = createCreateHandler("Contact");