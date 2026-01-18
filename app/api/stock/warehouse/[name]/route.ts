import { createGetHandler, createUpdateHandler, createDeleteHandler } from "@/lib/api-factory";
import { WarehouseUpdateSchema } from "@/lib/schemas/doctype-schemas";

export const GET = createGetHandler("Warehouse");
export const PUT = createUpdateHandler("Warehouse", WarehouseUpdateSchema);
export const DELETE = createDeleteHandler("Warehouse");