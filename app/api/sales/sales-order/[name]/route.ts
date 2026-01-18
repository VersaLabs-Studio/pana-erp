import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { SalesOrderUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Sales Order");
export const PUT = createUpdateHandler("Sales Order", SalesOrderUpdateSchema);
export const DELETE = createDeleteHandler("Sales Order");