// app/api/crm/contact/[name]/route.ts
import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";

export const GET = createGetHandler("Contact");
export const PUT = createUpdateHandler("Contact");
export const DELETE = createDeleteHandler("Contact");