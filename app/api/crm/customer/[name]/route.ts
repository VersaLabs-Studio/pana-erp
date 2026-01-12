// app/api/crm/customer/[name]/route.ts
import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";

export const GET = createGetHandler("Customer");
export const PUT = createUpdateHandler("Customer");
export const DELETE = createDeleteHandler("Customer");