// app/api/crm/address/route.ts
import { createListHandler, createCreateHandler } from "@/lib/api-factory";
import { AddressCreateSchema } from "@/lib/schemas/doctype-schemas"; // Assuming you have a generic or specific schema, or omit schema arg if generic

// GET /api/crm/address - List addresses
export const GET = createListHandler("Address", {
  allowedFields: ["name", "address_title", "address_line1", "city", "country"],
  defaultSort: { field: "creation", order: "desc" },
});

// POST /api/crm/address - Create address
export const POST = createCreateHandler("Address");