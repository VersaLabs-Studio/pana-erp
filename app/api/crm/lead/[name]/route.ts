// app/api/crm/lead/[name]/route.ts
import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";

export const GET = createGetHandler("Lead");
export const PUT = createUpdateHandler("Lead");
export const DELETE = createDeleteHandler("Lead");